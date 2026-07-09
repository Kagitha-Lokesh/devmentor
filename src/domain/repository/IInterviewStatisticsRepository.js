export class IInterviewStatisticsRepository {
  /**
   * Get user interview statistics.
   * @param {string} uid 
   * @returns {Promise<InterviewStatistics|null>}
   */
  async getStatistics(uid) {
    throw new Error('Not implemented.');
  }

  /**
   * Save/update user interview statistics.
   * @param {string} uid 
   * @param {InterviewStatistics} stats 
   */
  async saveStatistics(uid, stats) {
    throw new Error('Not implemented.');
  }
}

export default IInterviewStatisticsRepository;
