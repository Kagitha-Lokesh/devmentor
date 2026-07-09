/**
 * Domain entity representing a completed timed active recall session.
 */
export class RevisionSession {
  /**
   * @param {object} params
   * @param {string} [params.id] - Unique session ID
   * @param {string} params.uid - User owner ID
   * @param {string} params.topicId - Topic context ID
   * @param {number} params.cardsReviewed - Count of cards reviewed
   * @param {number} params.cardsCorrect - Count of correct recalls (rating >= Good)
   * @param {number} params.cardsIncorrect - Count of failed recalls (rating < Good)
   * @param {number} params.duration - Duration of review session in seconds
   * @param {number} params.averageRecall - Average recall rating score as percentage (0-100)
   * @param {Date|string} [params.startedAt] - Timestamp when session started
   * @param {Date|string} [params.completedAt] - Timestamp when session ended
   */
  constructor({
    id,
    uid,
    topicId,
    cardsReviewed,
    cardsCorrect,
    cardsIncorrect,
    duration,
    averageRecall,
    startedAt = new Date(),
    completedAt = new Date()
  }) {
    if (!uid) throw new Error('RevisionSession requires uid.');
    if (!topicId) throw new Error('RevisionSession requires topicId.');

    this.id = id || `rev_sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.uid = uid;
    this.topicId = topicId;
    this.cardsReviewed = cardsReviewed;
    this.cardsCorrect = cardsCorrect;
    this.cardsIncorrect = cardsIncorrect;
    this.duration = duration;
    this.averageRecall = averageRecall;
    this.startedAt = startedAt instanceof Date ? startedAt : new Date(startedAt);
    this.completedAt = completedAt instanceof Date ? completedAt : new Date(completedAt);
  }
}

export default RevisionSession;
