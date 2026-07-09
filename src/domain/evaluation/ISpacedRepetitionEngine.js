/**
 * Spaced repetition engine interface contract.
 */
export class ISpacedRepetitionEngine {
  /**
   * Orchestrates the calculation of the next card review based on active strategy.
   * @param {RevisionCard} card - Current RevisionCard state
   * @param {number} rating - RevisionRating submitted (0-3)
   * @param {number} [recallTime] - Recall time in seconds
   * @returns {RevisionCard} Updated RevisionCard instance
   */
  computeNextReview(card, rating, recallTime = 0) {
    throw new Error('Not implemented.');
  }

  /**
   * Generates and segments the revision queue for a user.
   * @param {string} uid - User ID
   * @param {RevisionCard[]} allCards - List of all user's card states
   * @param {Progress[]} progressList - User progress list
   * @param {Mastery[]} masteryList - User mastery records
   * @param {object} knowledgeGraph - Static knowledge graph topics
   * @returns {RevisionQueue} Segmented and prioritized revision queue
   */
  buildQueue(uid, allCards, progressList, masteryList, knowledgeGraph) {
    throw new Error('Not implemented.');
  }
}

export default ISpacedRepetitionEngine;
