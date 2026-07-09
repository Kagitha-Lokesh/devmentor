import { container } from '../../infrastructure/di/container';
import { eventBus } from '../../shared/events/EventBus';
import { Progress } from '../../domain/models/Progress';
import { ProgressStatus } from '../../domain/models/ProgressStatus';
import { Mastery } from '../../domain/models/Mastery';
import { Activity, ActivityType } from '../../domain/models/Activity';

export class LearningUseCase {
  constructor() {
    this.progressRepo = container.resolve('IProgressRepository');
    this.masteryRepo = container.resolve('IMasteryRepository');
    this.activityRepo = container.resolve('IActivityRepository');
    this.masteryCalculator = container.resolve('IMasteryCalculator');
    this.logger = container.resolve('ILogger');

    // Subscribe domain listeners to propagate activities and updates dynamically
    eventBus.subscribe('LESSON_STARTED', async ({ uid, topicId }) => {
      await this.activityRepo.logActivity(uid, new Activity({
        type: ActivityType.LessonStarted,
        topicId
      }));
    });

    eventBus.subscribe('LESSON_COMPLETED', async ({ uid, topicId }) => {
      await this.activityRepo.logActivity(uid, new Activity({
        type: ActivityType.LessonCompleted,
        topicId
      }));
      await this.updateTopicMastery(uid, topicId);
    });

    eventBus.subscribe('PROBLEM_SOLVED', async ({ uid, topicId, problemId }) => {
      await this.activityRepo.logActivity(uid, new Activity({
        type: ActivityType.ProblemSolved,
        topicId,
        problemId
      }));
      await this.updateTopicMastery(uid, topicId);
    });
  }

  async startLesson(uid, topicId) {
    let progress = await this.progressRepo.getProgress(uid, topicId);
    if (!progress) {
      progress = new Progress({
        topicId,
        status: ProgressStatus.Started,
        readingPercentage: 0
      });
      await this.progressRepo.saveProgress(uid, progress);
      eventBus.publish('LESSON_STARTED', { uid, topicId });
    }
  }

  async completeLesson(uid, topicId, percentage = 100) {
    let progress = await this.progressRepo.getProgress(uid, topicId);
    if (!progress) {
      progress = new Progress({ topicId });
    }
    
    progress.readingPercentage = Math.max(progress.readingPercentage, percentage);
    if (progress.readingPercentage >= 100) {
      progress.lessonCompleted = true;
      progress.status = ProgressStatus.Completed;
    } else {
      progress.status = ProgressStatus.InProgress;
    }
    progress.lastActivity = new Date();

    await this.progressRepo.saveProgress(uid, progress);
    
    if (progress.lessonCompleted) {
      eventBus.publish('LESSON_COMPLETED', { uid, topicId });
    }
  }

  async solvePractice(uid, topicId, problemId, attempts = 1, hintsUsed = 0) {
    let progress = await this.progressRepo.getProgress(uid, topicId);
    if (!progress) {
      progress = new Progress({ topicId });
    }

    progress.practiceCompleted = true;
    progress.attempts += attempts;
    progress.solved = true;
    progress.lastActivity = new Date();
    
    await this.progressRepo.saveProgress(uid, progress);

    eventBus.publish('PROBLEM_SOLVED', { uid, topicId, problemId, attempts, hintsUsed });
  }

  async updateTopicMastery(uid, topicId) {
    const progress = await this.progressRepo.getProgress(uid, topicId);
    let mastery = await this.masteryRepo.getMastery(uid, topicId);
    if (!mastery) {
      mastery = new Mastery({ topicId });
    }

    const score = this.masteryCalculator.calculateMastery(
      progress,
      progress ? progress.attempts : 0,
      mastery.hintsUsed
    );

    mastery.score = score;
    mastery.attempts = progress ? progress.attempts : 0;
    mastery.lastUpdated = new Date();

    await this.masteryRepo.saveMastery(uid, mastery);
    eventBus.publish('MASTERY_UPDATED', { uid, topicId, score });
  }
}

export default LearningUseCase;
