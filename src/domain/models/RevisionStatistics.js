/**
 * Domain entity representing aggregate user revision analytics.
 */
export class RevisionStatistics {
  /**
   * @param {object} params
   * @param {string} params.uid - Owner user ID
   * @param {number} [params.totalReviewed] - Total cards reviewed in history
   * @param {number} [params.totalCorrect] - Total correct recalls in history
   * @param {number} [params.totalIncorrect] - Total incorrect recalls in history
   * @param {number} [params.currentStreak] - Active study review streak in days
   * @param {number} [params.longestStreak] - Longest historical study review streak in days
   * @param {number} [params.averageRetention] - Average retention correctness rate (percentage 0-100)
   * @param {Date|string} [params.lastReviewedAt] - Timestamp of last review run
   * @param {Array<object>} [params.weeklyData] - [{ date: string, count: number, correct: number }] for metrics charts
   */
  constructor({
    uid,
    totalReviewed = 0,
    totalCorrect = 0,
    totalIncorrect = 0,
    currentStreak = 0,
    longestStreak = 0,
    averageRetention = 0,
    lastReviewedAt = null,
    weeklyData = []
  }) {
    if (!uid) throw new Error('RevisionStatistics requires uid.');

    this.uid = uid;
    this.totalReviewed = totalReviewed;
    this.totalCorrect = totalCorrect;
    this.totalIncorrect = totalIncorrect;
    this.currentStreak = currentStreak;
    this.longestStreak = longestStreak;
    this.averageRetention = averageRetention;
    this.lastReviewedAt = lastReviewedAt ? (lastReviewedAt instanceof Date ? lastReviewedAt : new Date(lastReviewedAt)) : null;
    this.weeklyData = Array.isArray(weeklyData) ? weeklyData : [];
  }
}

export default RevisionStatistics;
