/**
 * Domain entity representing the active recall spaced repetition state of a flashcard.
 */
export class RevisionCard {
  /**
   * @param {object} params
   * @param {string} params.flashcardId - Reference ID to static Flashcard
   * @param {string} params.topicId - Reference ID to topic
   * @param {number} [params.easeFactor] - SM-2 ease factor coefficient (default 2.5)
   * @param {number} [params.interval] - Next review interval in days
   * @param {number} [params.repetitions] - Count of consecutive successful recall runs
   * @param {Date|string} [params.nextReviewDate] - Date of next due review
   * @param {number} [params.lastRating] - Last submitted rating (RevisionRating enum)
   * @param {Date|string} [params.lastReviewedAt] - Timestamp of last review run
   * @param {number} [params.averageRecallTime] - Cumulative average recall duration in seconds
   * @param {number} [params.reviewCount] - Total revision review runs for this card
   * @param {number} [params.lastDuration] - Recall duration of the last revision in seconds
   * @param {number} [params.confidence] - Confidence score mapping rating (0-3)
   */
  constructor({
    flashcardId,
    topicId,
    easeFactor = 2.5,
    interval = 0,
    repetitions = 0,
    nextReviewDate = new Date(),
    lastRating = null,
    lastReviewedAt = null,
    averageRecallTime = 0,
    reviewCount = 0,
    lastDuration = 0,
    confidence = 0
  }) {
    if (!flashcardId) throw new Error('RevisionCard requires flashcardId.');
    if (!topicId) throw new Error('RevisionCard requires topicId.');

    this.flashcardId = flashcardId;
    this.topicId = topicId;
    this.easeFactor = easeFactor;
    this.interval = interval;
    this.repetitions = repetitions;
    this.nextReviewDate = nextReviewDate instanceof Date ? nextReviewDate : new Date(nextReviewDate);
    this.lastRating = lastRating;
    this.lastReviewedAt = lastReviewedAt ? (lastReviewedAt instanceof Date ? lastReviewedAt : new Date(lastReviewedAt)) : null;
    this.averageRecallTime = averageRecallTime;
    this.reviewCount = reviewCount;
    this.lastDuration = lastDuration;
    this.confidence = confidence;
  }
}

export default RevisionCard;
