export class IInterviewRepository {
  /**
   * Fetch all questions.
   * @returns {Promise<InterviewQuestion[]>}
   */
  async getQuestions() {
    throw new Error('Not implemented.');
  }

  /**
   * Fetch questions by category/round (e.g. Technical, Behavioral).
   * @param {string} category 
   * @returns {Promise<InterviewQuestion[]>}
   */
  async getQuestionsByCategory(category) {
    throw new Error('Not implemented.');
  }

  /**
   * Fetch questions by company track ID.
   * @param {string} companyId 
   * @returns {Promise<InterviewQuestion[]>}
   */
  async getQuestionsByCompany(companyId) {
    throw new Error('Not implemented.');
  }
}

export default IInterviewRepository;
