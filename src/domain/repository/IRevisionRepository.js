/**
 * Interface contract for managing user revision states, session logs, and statistics.
 * Must be implemented by Infrastructure repository providers.
 */
export class IRevisionRepository {
  /**
   * Save revision state for a specific card.
   * @param {string} uid - User ID
   * @param {RevisionCard} card - RevisionCard domain entity
   * @returns {Promise<void>}
   */
  async saveRevisionCard(uid, card) {
    throw new Error('Not implemented.');
  }

  /**
   * Fetch revision state of a card.
   * @param {string} uid - User ID
   * @param {string} flashcardId - Card ID
   * @returns {Promise<RevisionCard|null>}
   */
  async getRevisionCard(uid, flashcardId) {
    throw new Error('Not implemented.');
  }

  /**
   * Fetch all user revision card states.
   * @param {string} uid - User ID
   * @param {string} [topicId] - Filter by topic
   * @returns {Promise<RevisionCard[]>}
   */
  async listRevisionCards(uid, topicId = null) {
    throw new Error('Not implemented.');
  }

  /**
   * Log a completed revision session.
   * @param {string} uid - User ID
   * @param {RevisionSession} session - Completed session log
   * @returns {Promise<void>}
   */
  async saveRevisionSession(uid, session) {
    throw new Error('Not implemented.');
  }

  /**
   * List recent completed revision sessions.
   * @param {string} uid - User ID
   * @param {number} [limit] - Max items to return
   * @returns {Promise<RevisionSession[]>}
   */
  async listRevisionSessions(uid, limit = 50) {
    throw new Error('Not implemented.');
  }

  /**
   * Fetch aggregate revision statistics.
   * @param {string} uid - User ID
   * @returns {Promise<RevisionStatistics|null>}
   */
  async getRevisionStatistics(uid) {
    throw new Error('Not implemented.');
  }

  /**
   * Save aggregate revision statistics.
   * @param {string} uid - User ID
   * @param {RevisionStatistics} stats - Statistics domain entity
   * @returns {Promise<void>}
   */
  async saveRevisionStatistics(uid, stats) {
    throw new Error('Not implemented.');
  }
}

export default IRevisionRepository;
