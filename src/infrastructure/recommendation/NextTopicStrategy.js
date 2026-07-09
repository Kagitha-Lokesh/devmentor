import { IRecommendationStrategy } from '../../domain/evaluation/IRecommendationStrategy';
import { Recommendation } from '../../domain/models/Recommendation';

export class NextTopicStrategy extends IRecommendationStrategy {
  async evaluate(context) {
    const { graph, progressList } = context;
    const recommendations = [];

    const completedTopicIds = new Set(
      progressList.filter(p => p.lessonCompleted).map(p => p.topicId)
    );

    // Find the last completed lesson in chronological order
    const completedOrdered = graph.filter(node => completedTopicIds.has(node.id));

    if (completedOrdered.length > 0) {
      // Find the next unlocked topic in the graph
      const nextCandidates = graph.filter(node => {
        // Not completed yet
        if (completedTopicIds.has(node.id)) return false;
        // All prerequisites completed
        return node.prerequisites.every(prereqId => completedTopicIds.has(prereqId));
      });

      if (nextCandidates.length > 0) {
        const nextNode = nextCandidates[0]; // Take the first candidate matching the graph sequence
        recommendations.push(
          new Recommendation({
            type: 'UnlockNext',
            topicId: nextNode.id,
            title: `Learn ${nextNode.title}`,
            description: `Ready to start! Begin the next core topic in your learning path.`,
            priority: 4
          })
        );
      }
    } else if (graph.length > 0) {
      // User hasn't started anything: recommend first topic of Volume 1 Chapter 1
      const first = graph[0];
      recommendations.push(
        new Recommendation({
          type: 'UnlockNext',
          topicId: first.id,
          title: `Start with ${first.title}`,
          description: `Welcome to DevMentor AI! Kick off your Java Full Stack career path.`,
          priority: 5
        })
      );
    }

    return recommendations;
  }
}
export default NextTopicStrategy;
