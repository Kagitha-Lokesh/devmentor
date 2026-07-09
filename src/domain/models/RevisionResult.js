/**
 * Value object representing a single card's evaluation result inside a session.
 */
export class RevisionResult {
  /**
   * @param {object} params
   * @param {string} params.flashcardId - Reference ID of the flashcard reviewed
   * @param {number} params.rating - Rating given by user (RevisionRating enum)
   * @param {number} params.timeSpent - Recall response time in seconds
   * @param {boolean} params.isCorrect - Computed correctness (rating >= Good)
   */
  constructor({ flashcardId, rating, timeSpent, isCorrect }) {
    if (!flashcardId) throw new Error('RevisionResult requires flashcardId.');
    if (rating === undefined || rating === null) throw new Error('RevisionResult requires rating.');

    this.flashcardId = flashcardId;
    this.rating = rating;
    this.timeSpent = timeSpent;
    this.isCorrect = isCorrect === undefined ? (rating >= 2) : isCorrect;
  }
}

export default RevisionResult;
