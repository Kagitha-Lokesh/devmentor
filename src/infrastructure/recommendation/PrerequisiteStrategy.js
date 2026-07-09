import { IRecommendationStrategy } from '../../domain/evaluation/IRecommendationStrategy';
import { Recommendation } from '../../domain/models/Recommendation';

export class PrerequisiteStrategy extends IRecommendationStrategy {
  async evaluate(context) {
    const { graph, progressList } = context;
    const recommendations = [];

    // Find in-progress/started topics with incomplete prerequisites
    const completedTopicIds = new Set(
      progressList.filter(p => p.lessonCompleted).map(p => p.topicId)
    );

    for (const p of progressList) {
      if (!p.lessonCompleted) {
        const node = graph.find(n => n.id === p.topicId);
        if (node) {
          // Find any incomplete prereqs
          const missing = node.prerequisites.filter(prereqId => !completedTopicIds.has(prereqId));
          if (missing.length > 0) {
            const missingNode = graph.find(n => n.id === missing[0]);
            const missingTitle = missingNode ? missingNode.title : missing[0];
            
            recommendations.push(
              new Recommendation({
                type: 'PrerequisiteBlock',
                topicId: missing[0],
                title: `Unlock: ${node.title}`,
                description: `You need to complete its prerequisite "${missingTitle}" before moving forward.`,
                priority: 2
              })
            );
          }
        }
      }
    }

    return recommendations;
  }
}
export default PrerequisiteStrategy;
