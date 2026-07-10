import { ProgressStatus } from './ProgressStatus';

export class Progress {
  constructor({
    topicId,
    status = ProgressStatus.NotStarted,
    readingPercentage = 0,
    lessonCompleted = false,
    practiceCompleted = false,
    attempts = 0,
    solved = false,
    timeSpent = 0, // seconds
    lastActivity = new Date(),
    resumePoint = '',
    // Learning OS extensions (v1.2) — backward-compatible defaults
    quizPassed = false,
    quizScore = 0,
    flashcardsReviewed = false,
    timeSpentMinutes = 0,
    completedAt = null
  }) {
    if (!topicId) throw new Error('Progress record requires a topicId.');

    this.topicId = topicId;
    this.status = status;
    this.readingPercentage = readingPercentage;
    this.lessonCompleted = lessonCompleted;
    this.practiceCompleted = practiceCompleted;
    this.attempts = attempts;
    this.solved = solved;
    this.timeSpent = timeSpent;
    this.lastActivity = lastActivity instanceof Date ? lastActivity : new Date(lastActivity);
    this.resumePoint = resumePoint;
    // Learning OS extensions
    this.quizPassed = quizPassed;
    this.quizScore = quizScore;
    this.flashcardsReviewed = flashcardsReviewed;
    this.timeSpentMinutes = timeSpentMinutes;
    this.completedAt = completedAt ? new Date(completedAt) : null;
  }

  /** True when every learning objective for this topic is complete */
  get isFullyComplete() {
    return this.lessonCompleted && this.practiceCompleted && this.quizPassed && this.flashcardsReviewed;
  }
}
export default Progress;
