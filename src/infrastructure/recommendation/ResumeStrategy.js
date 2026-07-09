import { IRecommendationStrategy } from '../../domain/evaluation/IRecommendationStrategy';
import { Recommendation } from '../../domain/models/Recommendation';

export class ResumeStrategy extends IRecommendationStrategy {
  async evaluate(context) {
    const { graph, progressList } = context;
    const recommendations = [];

    // Find the most recently active in-progress topic
    const inProgress = progressList
      .filter(p => !p.lessonCompleted && p.readingPercentage > 0)
      .sort((a, b) => b.lastActivity - a.lastActivity);

    if (inProgress.length > 0) {
      const node = graph.find(n => n.id === inProgress[0].topicId);
      if (node) {
        recommendations.push(
          new Recommendation({
            type: 'ContinueLesson',
            topicId: node.id,
            title: `Resume ${node.title}`,
            description: `You read ${inProgress[0].readingPercentage}% of this lesson. Pick up where you left off.`,
            priority: 3
          })
        );
      }
    }

    return recommendations;
  }
}
export default ResumeStrategy;
