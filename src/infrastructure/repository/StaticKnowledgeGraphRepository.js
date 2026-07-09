import graphData from '../../shared/generated/knowledge-graph.json';
import dependencyData from '../../shared/generated/topic-dependencies.json';
import { LearningNode } from '../../domain/models/LearningNode';
import { IKnowledgeGraphRepository } from '../../domain/repository/IKnowledgeGraphRepository';

export class StaticKnowledgeGraphRepository extends IKnowledgeGraphRepository {
  async getGraph() {
    return graphData.map(node => new LearningNode(node));
  }

  async getNode(topicId) {
    const data = graphData.find(node => node.id === topicId);
    if (!data) return null;
    return new LearningNode(data);
  }

  async getPrerequisites(topicId) {
    return dependencyData[topicId] || [];
  }

  async getDependents(topicId) {
    const dependents = [];
    for (const key in dependencyData) {
      if (dependencyData[key].includes(topicId)) {
        dependents.push(key);
      }
    }
    return dependents;
  }
}
export default StaticKnowledgeGraphRepository;
