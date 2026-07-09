/**
 * IKnowledgeGraphRepository Interface
 * Contract for querying the static build-time compiled knowledge graph and node linkages.
 */
export class IKnowledgeGraphRepository {
  async getGraph() {
    throw new Error('Method not implemented: getGraph');
  }

  async getNode(topicId) {
    throw new Error('Method not implemented: getNode');
  }

  async getPrerequisites(topicId) {
    throw new Error('Method not implemented: getPrerequisites');
  }

  async getDependents(topicId) {
    throw new Error('Method not implemented: getDependents');
  }
}
export default IKnowledgeGraphRepository;
