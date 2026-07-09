import { IRecommendationStrategy } from '../../domain/evaluation/IRecommendationStrategy';
import { Recommendation } from '../../domain/models/Recommendation';

export class WeakTopicStrategy extends IRecommendationStrategy {
  async evaluate(context) {
    const { graph, masteryList } = context;
    const recommendations = [];

    // Find completed topics with mastery < 70
    masteryList.forEach((m) => {
      if (m.score > 0 && m.score < 70) {
        const node = graph.find(n => n.id === m.topicId);
        if (node) {
          recommendations.push(
            new Recommendation({
              type: 'WeakTopicRefresher',
              topicId: node.id,
              title: `Revise ${node.title}`,
              description: `Your mastery score is ${m.score}%. Practice this topic again to strengthen your core understanding.`,
              priority: 1 // Highest priority
            })
          );
        }
      }
    });

    return recommendations;
  }
}
export default WeakTopicStrategy;
