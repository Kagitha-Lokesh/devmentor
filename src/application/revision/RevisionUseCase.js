import { container } from '../../infrastructure/di/container';
import { eventBus } from '../../shared/events/EventBus';
import { RevisionCard } from '../../domain/models/RevisionCard';
import { RevisionSession } from '../../domain/models/RevisionSession';
import { RevisionStatistics } from '../../domain/models/RevisionStatistics';
import { Activity, ActivityType } from '../../domain/models/Activity';

export class RevisionUseCase {
  constructor() {
    // Resolve dependencies from DI container lazily inside constructor to prevent circular lookups
    this.revisionRepo = container.resolve('IRevisionRepository');
    this.flashcardRepo = container.resolve('IFlashcardRepository');
    this.cheatsheetRepo = container.resolve('ICheatSheetRepository');
    this.mindmapRepo = container.resolve('IMindMapRepository');
    this.srEngine = container.resolve('ISpacedRepetitionEngine');
    
    this.progressRepo = container.resolve('IProgressRepository');
    this.masteryRepo = container.resolve('IMasteryRepository');
    this.activityRepo = container.resolve('IActivityRepository');
    this.graphRepo = container.resolve('IKnowledgeGraphRepository');
    this.logger = container.resolve('ILogger');

    // Subscribe to domain event triggers
    eventBus.subscribe('REVISION_STARTED', async ({ uid, topicId }) => {
      this.logger.info(`[RevisionUseCase] Topic revision started: topicId=${topicId} uid=${uid}`);
      await this.activityRepo.logActivity(uid, new Activity({
        type: ActivityType.RevisionStarted,
        topicId
      }));
    });

    eventBus.subscribe('REVISION_COMPLETED', async ({ uid, topicId, session }) => {
      this.logger.info(`[RevisionUseCase] Topic revision completed: topicId=${topicId} uid=${uid}`);
      
      // Log activity
      await this.activityRepo.logActivity(uid, new Activity({
        type: ActivityType.RevisionCompleted,
        topicId,
        duration: session.duration
      }));

      // Trigger topic mastery update via LearningUseCase application service
      try {
        const learningUseCase = container.resolve('LearningUseCase');
        await learningUseCase.updateTopicMastery(uid, topicId);
      } catch (err) {
        this.logger.warn(`[RevisionUseCase] Mastery recalculation lookup failed: ${err.message}`);
      }
    });

    eventBus.subscribe('FLASHCARD_FLIPPED', async ({ uid, topicId }) => {
      await this.activityRepo.logActivity(uid, new Activity({
        type: ActivityType.FlashcardFlipped,
        topicId
      }));
    });

    eventBus.subscribe('CHEATSHEET_VIEWED', async ({ uid, topicId }) => {
      await this.activityRepo.logActivity(uid, new Activity({
        type: ActivityType.CheatSheetViewed,
        topicId
      }));
    });

    eventBus.subscribe('MINDMAP_VIEWED', async ({ uid, topicId }) => {
      await this.activityRepo.logActivity(uid, new Activity({
        type: ActivityType.MindMapViewed,
        topicId
      }));
    });
  }

  async startRevisionSession(uid, topicId) {
    eventBus.publish('REVISION_STARTED', { uid, topicId });
  }

  async submitCardReview(uid, flashcardId, topicId, rating, timeSpent) {
    let card = await this.revisionRepo.getRevisionCard(uid, flashcardId);
    if (!card) {
      card = new RevisionCard({ flashcardId, topicId });
    }

    const updatedCard = this.srEngine.computeNextReview(card, rating, timeSpent);
    await this.revisionRepo.saveRevisionCard(uid, updatedCard);
    return updatedCard;
  }

  async completeRevisionSession(uid, topicId, results, duration) {
    const cardsReviewed = results.length;
    const cardsCorrect = results.filter((r) => r.isCorrect).length;
    const cardsIncorrect = cardsReviewed - cardsCorrect;

    // Average recall percentage based on sum of ratings (0 to 3) divided by max possible (cardsReviewed * 3)
    const sumRatings = results.reduce((sum, r) => sum + r.rating, 0);
    const averageRecall = cardsReviewed > 0 ? Math.round((sumRatings / (cardsReviewed * 3)) * 100) : 0;

    const session = new RevisionSession({
      uid,
      topicId,
      cardsReviewed,
      cardsCorrect,
      cardsIncorrect,
      duration,
      averageRecall,
      startedAt: new Date(Date.now() - duration * 1000),
      completedAt: new Date()
    });

    // Save session log
    await this.revisionRepo.saveRevisionSession(uid, session);

    // Update revision aggregate statistics
    let stats = await this.revisionRepo.getRevisionStatistics(uid);
    if (!stats) {
      stats = new RevisionStatistics({ uid });
    }

    stats.totalReviewed += cardsReviewed;
    stats.totalCorrect += cardsCorrect;
    stats.totalIncorrect += cardsIncorrect;
    stats.averageRetention = Math.round((stats.totalCorrect / stats.totalReviewed) * 100);

    // Streak logic calculation
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (stats.lastReviewedAt) {
      const lastReviewDate = new Date(stats.lastReviewedAt);
      lastReviewDate.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - lastReviewDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Reviewed yesterday: increment streak
        stats.currentStreak += 1;
      } else if (diffDays > 1) {
        // Missed reviews: reset streak
        stats.currentStreak = 1;
      }
      // If diffDays === 0, user already reviewed today: keep current streak unchanged
    } else {
      stats.currentStreak = 1;
    }

    stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
    stats.lastReviewedAt = new Date();

    // Update weekly aggregates for chart metrics
    const dateStr = today.toISOString().split('T')[0];
    const weeklyDataList = [...stats.weeklyData];
    const existingDayIdx = weeklyDataList.findIndex((w) => w.date === dateStr);

    if (existingDayIdx > -1) {
      weeklyDataList[existingDayIdx].count += cardsReviewed;
      weeklyDataList[existingDayIdx].correct += cardsCorrect;
    } else {
      weeklyDataList.push({ date: dateStr, count: cardsReviewed, correct: cardsCorrect });
    }

    // Keep only last 14 days of history to limit payload storage size
    if (weeklyDataList.length > 14) {
      weeklyDataList.shift();
    }
    stats.weeklyData = weeklyDataList;

    await this.revisionRepo.saveRevisionStatistics(uid, stats);

    // Publish session completion to EventBus
    eventBus.publish('REVISION_COMPLETED', { uid, topicId, session });
    return session;
  }

  async getRevisionQueue(uid) {
    const allCards = await this.revisionRepo.listRevisionCards(uid);
    const progressList = await this.progressRepo.listProgress(uid);
    const masteryList = await this.masteryRepo.listMastery(uid);
    const knowledgeGraph = await this.graphRepo.getGraph();

    return this.srEngine.buildQueue(uid, allCards, progressList, masteryList, knowledgeGraph);
  }

  async getRevisionStatistics(uid) {
    return this.revisionRepo.getRevisionStatistics(uid);
  }

  async getFlashcardsForTopic(uid, topicId) {
    const staticCards = await this.flashcardRepo.getFlashcardsByTopic(topicId);
    const userCards = await this.revisionRepo.listRevisionCards(uid, topicId);
    const userCardMap = new Map(userCards.map((c) => [c.flashcardId, c]));

    // Map each static card overlaying user's repetition state
    return staticCards.map((card) => {
      const state = userCardMap.get(card.id);
      return {
        card,
        state: state || null // null means unreviewed card
      };
    });
  }

  async getCheatSheet(uid, topicId) {
    eventBus.publish('CHEATSHEET_VIEWED', { uid, topicId });
    return this.cheatsheetRepo.getCheatSheet(topicId);
  }

  async getMindMap(uid, topicId) {
    eventBus.publish('MINDMAP_VIEWED', { uid, topicId });
    return this.mindmapRepo.getMindMap(topicId);
  }
}

export default RevisionUseCase;
