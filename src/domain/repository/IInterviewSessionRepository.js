export class IInterviewSessionRepository {
  /**
   * Get an active or past interview session.
   * @param {string} uid 
   * @param {string} sessionId 
   * @returns {Promise<InterviewSession|null>}
   */
  async getSession(uid, sessionId) {
    throw new Error('Not implemented.');
  }

  /**
   * Save or update an interview session.
   * @param {string} uid 
   * @param {InterviewSession} session 
   */
  async saveSession(uid, session) {
    throw new Error('Not implemented.');
  }

  /**
   * List past completed interview sessions.
   * @param {string} uid 
   * @returns {Promise<InterviewSession[]>}
   */
  async listSessions(uid) {
    throw new Error('Not implemented.');
  }
}

export default IInterviewSessionRepository;
