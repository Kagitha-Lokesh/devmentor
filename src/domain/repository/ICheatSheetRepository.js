/**
 * Interface contract for fetching static topic cheat sheets.
 */
export class ICheatSheetRepository {
  /**
   * Fetch cheatsheet metadata or configuration for a topic.
   * @param {string} topicId - Topic ID
   * @returns {Promise<CheatSheet|null>}
   */
  async getCheatSheet(topicId) {
    throw new Error('Not implemented.');
  }
}

export default ICheatSheetRepository;
