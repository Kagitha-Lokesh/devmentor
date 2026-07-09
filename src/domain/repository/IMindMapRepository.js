/**
 * Interface contract for fetching static topic mindmaps.
 */
export class IMindMapRepository {
  /**
   * Fetch mindmap nodes for a topic.
   * @param {string} topicId - Topic ID
   * @returns {Promise<MindMap|null>}
   */
  async getMindMap(topicId) {
    throw new Error('Not implemented.');
  }
}

export default IMindMapRepository;
