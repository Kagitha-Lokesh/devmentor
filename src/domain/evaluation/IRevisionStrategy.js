/**
 * Strategy interface contract for spaced repetition algorithms.
 */
export class IRevisionStrategy {
  /**
   * Calculate the next scheduled review intervals and parameters.
   * @param {RevisionCard} card - Current RevisionCard state
   * @param {number} rating - RevisionRating submitted (0-3)
   * @param {number} [recallTime] - Time taken to recall in seconds
   * @param {object} [config] - Parameters mapping config weights
   * @returns {RevisionCard} Updated RevisionCard instance
   */
  computeNextReview(card, rating, recallTime = 0, config = {}) {
    throw new Error('Not implemented.');
  }
}

export default IRevisionStrategy;
