import { ISpacedRepetitionEngine } from '../../domain/evaluation/ISpacedRepetitionEngine';
import { SM2SpacedRepetitionStrategy } from './SM2SpacedRepetitionStrategy';
import { RevisionQueue } from '../../domain/models/RevisionQueue';
import { RevisionSchedule } from '../../domain/models/RevisionSchedule';
import config from '../../shared/generated/revision-config.json';
import { container } from '../di/container';

export class DefaultRevisionScheduler extends ISpacedRepetitionEngine {
  constructor() {
    super();
    this.strategy = new SM2SpacedRepetitionStrategy();
  }

  computeNextReview(card, rating, recallTime = 0) {
    return this.strategy.computeNextReview(card, rating, recallTime, config);
  }

  /**
   * Generates and segments the revision queue for a user.
   * @param {string} uid - User ID
   * @param {RevisionCard[]} allCards - List of all user's card states
   * @param {Progress[]} progressList - User progress list
   * @param {Mastery[]} masteryList - User mastery records
   * @param {object[]} knowledgeGraph - Static knowledge graph topics
   * @returns {RevisionQueue} Segmented and prioritized revision queue
   */
  buildQueue(uid, allCards, progressList, masteryList, knowledgeGraph) {
    const logger = container.resolve('ILogger');
    logger.info(`[DefaultRevisionScheduler] Building queue for user ${uid}. Total cards tracked: ${allCards.length}`);

    const progressMap = new Map(progressList.map((p) => [p.topicId, p]));
    const masteryMap = new Map(masteryList.map((m) => [m.topicId, m]));
    
    // Group user's card states by topicId
    const cardsByTopic = new Map();
    allCards.forEach((card) => {
      if (!cardsByTopic.has(card.topicId)) {
        cardsByTopic.set(card.topicId, []);
      }
      cardsByTopic.get(card.topicId).push(card);
    });

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const todaySchedules = [];
    const overdueSchedules = [];
    const upcomingSchedules = [];
    const weakSchedules = [];

    // Weights from config
    const weights = config.weights || { urgency: 0.40, importance: 0.35, weakness: 0.25 };

    knowledgeGraph.forEach((node) => {
      const topicId = node.id;
      const progress = progressMap.get(topicId);
      const mastery = masteryMap.get(topicId);
      const topicCards = cardsByTopic.get(topicId) || [];

      // Check if this topic has any static flashcards compiled (from content directory)
      // Since static flashcard metadata is in index, let's find it. 
      // If we don't find it in index, we look if there are any cards.
      // Wait, we can load flashcards count or assume they exist if topicCards has data, 
      // or check the static flashcard-index.json. Let's look up if the topic has flashcards.
      // If there are no cards at all for this topic in allCards, check if user completed the lesson.
      const lessonCompleted = progress && progress.lessonCompleted;

      // To find how many cards are due for this topic:
      // Loop through all individual cards in this topic. 
      // If user has not reviewed them, or nextReviewDate <= today, they are due.
      let dueCount = 0;
      let overdueCount = 0;
      let minNextReviewDate = null;
      let totalTopicCards = topicCards.length;

      // Wait, if totalTopicCards is 0, then none are saved in database yet (unreviewed).
      // If lesson is completed, we assume they are due (dueCount = total cards count from content, 
      // or we just mark topic due with dueCount = 1 for priority sorting, etc).
      // Let's resolve the actual cards count:
      // We can obtain total cards from static flashcard index. Let's load the index from generated folder.
      let staticFlashcardCount = 0;
      try {
        const fcIndex = require('../../shared/generated/flashcard-index.json');
        const match = fcIndex.find((f) => f.topicId === topicId);
        staticFlashcardCount = match ? match.count : 0;
      } catch {
        // Fallback ES-modules friendly import resolve at runtime
        try {
          const fcIndex = container.resolve('flashcardIndex') || [];
          const match = fcIndex.find((f) => f.topicId === topicId);
          staticFlashcardCount = match ? match.count : 0;
        } catch {
          staticFlashcardCount = 5; // Default guess
        }
      }

      if (staticFlashcardCount === 0) {
        // No flashcards for this topic, skip from revision queue
        return;
      }

      let hasReviews = topicCards.length > 0;
      let maxOverdueDays = 0;

      if (!hasReviews) {
        // Topic has flashcards but user has never reviewed them.
        // It becomes due only if they have completed the lesson.
        if (lessonCompleted) {
          dueCount = staticFlashcardCount;
          minNextReviewDate = todayDate;
        } else {
          // Lesson not completed, not due yet
          return;
        }
      } else {
        topicCards.forEach((card) => {
          const dueDate = new Date(card.nextReviewDate);
          dueDate.setHours(0, 0, 0, 0);

          if (dueDate <= todayDate) {
            dueCount += 1;
            const diffTime = todayDate.getTime() - dueDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 0) {
              overdueCount += 1;
              maxOverdueDays = Math.max(maxOverdueDays, diffDays);
            }
          }
          if (!minNextReviewDate || dueDate < minNextReviewDate) {
            minNextReviewDate = dueDate;
          }
        });
      }

      // If nothing is due and we have reviews, this topic is scheduled for the future
      if (dueCount === 0 && minNextReviewDate) {
        const diffTime = minNextReviewDate.getTime() - todayDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const upcomingSchedule = new RevisionSchedule({
          topicId,
          uid,
          dueDate: minNextReviewDate,
          overdueBy: -diffDays,
          cardsDue: staticFlashcardCount,
          priority: 0 // Future upcoming cards get lowest priority sorting
        });
        upcomingSchedules.push(upcomingSchedule);
        return;
      }

      // Compute unified priority metrics: Priority = Urgency + Importance + Weakness
      // 1. Urgency (0 to 5)
      let urgencyScore = 0;
      if (overdueCount > 0) {
        urgencyScore = Math.min(5.0, 1.0 + maxOverdueDays * 0.2);
      } else if (dueCount > 0) {
        urgencyScore = 1.0;
      }

      // 2. Importance (0 to 5)
      const importanceValue = node.interviewImportance || 3; // 1 to 5 scale
      const importanceScore = importanceValue;

      // 3. Weakness (0 to 5)
      const masteryScore = mastery ? mastery.score : 0;
      const weaknessScore = (100 - masteryScore) / 20;

      // Normalized Priority Score
      const priority = (urgencyScore * weights.urgency) +
                       (importanceScore * weights.importance) +
                       (weaknessScore * weights.weakness);

      const schedule = new RevisionSchedule({
        topicId,
        uid,
        dueDate: minNextReviewDate || todayDate,
        overdueBy: maxOverdueDays,
        cardsDue: dueCount,
        priority
      });

      if (maxOverdueDays > 0) {
        overdueSchedules.push(schedule);
      } else {
        todaySchedules.push(schedule);
      }

      // Populate weak topics segment (if mastery score exists and is below the threshold)
      const masteryThreshold = config.masteryThreshold || 80;
      if (masteryScore < masteryThreshold && lessonCompleted) {
        weakSchedules.push(schedule);
      }
    });

    // Sort descending by priority score (highest priority first)
    const sorter = (a, b) => b.priority - a.priority;

    return new RevisionQueue({
      today: todaySchedules.sort(sorter),
      overdue: overdueSchedules.sort(sorter),
      upcoming: upcomingSchedules.sort((a, b) => a.dueDate - b.dueDate), // Sort upcoming by chronological date ascending
      weakTopics: weakSchedules.sort(sorter)
    });
  }
}

export default DefaultRevisionScheduler;
