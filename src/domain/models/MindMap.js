/**
 * Domain entity representing a topic mindmap.
 */
export class MindMap {
  /**
   * @param {object} params
   * @param {string} params.topicId - Reference topic ID
   * @param {string} params.slug - URL slug
   * @param {string} params.title - Mindmap title
   * @param {Array<object>} params.nodes - Hierarchical array of nodes [{ id, label, parentId, level }]
   */
  constructor({ topicId, slug, title, nodes = [] }) {
    if (!topicId) throw new Error('MindMap requires topicId.');
    if (!nodes || !Array.isArray(nodes)) throw new Error('MindMap requires nodes array.');

    this.topicId = topicId;
    this.slug = slug;
    this.title = title;
    this.nodes = nodes;
  }
}

export default MindMap;
