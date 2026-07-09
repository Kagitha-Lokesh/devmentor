export class ICompanyRepository {
  /**
   * Get all registered company tracks.
   * @returns {Promise<object[]>}
   */
  async getCompanies() {
    throw new Error('Not implemented.');
  }

  /**
   * Get roadmap and tips markdown content for a company track.
   * @param {string} companyId 
   * @returns {Promise<object|null>}
   */
  async getRoadmap(companyId) {
    throw new Error('Not implemented.');
  }
}

export default ICompanyRepository;
