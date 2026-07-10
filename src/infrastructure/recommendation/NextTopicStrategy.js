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
        // Sort candidates by volume → chapter → topic number to get the earliest unlocked topic
        const getNum = (id) => parseInt((id.match(/T(\d+)$/) || [0, 999])[1]);
        const getVol = (n) => typeof n.volume === 'number' ? n.volume : parseInt(String(n.volume).replace(/\D/g, '')) || 999;
        const getCh  = (n) => parseInt((String(n.chapter || '').replace('chapter-', '')) || '999');

        nextCandidates.sort((a, b) => {
          const vd = getVol(a) - getVol(b);
          if (vd !== 0) return vd;
          const cd = getCh(a) - getCh(b);
          if (cd !== 0) return cd;
          return getNum(a.id) - getNum(b.id);
        });

        const nextNode = nextCandidates[0];
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
      // User hasn't started anything: find the very first topic in the proper learning order.
      // Sort by: java course first (no prefix = java), then lowest volume, then lowest chapter, then lowest T-number.
      const getTopicNum = (id) => parseInt((id.match(/T(\d+)$/) || [0, 999])[1]);
      const getVolNum   = (node) => typeof node.volume === 'number' ? node.volume : parseInt(String(node.volume).replace(/\D/g, '')) || 999;
      const getChapNum  = (node) => parseInt((String(node.chapter || '').replace('chapter-', '')) || '999');
      const isJava      = (node) => !node.id.includes('-') || node.id.startsWith('V'); // java IDs are like V1-C1-T1

      // Separate java topics from other courses (backend has BE- prefix, frontend FE- etc.)
      const javaCandidates = graph.filter(n => isJava(n));
      const pool = javaCandidates.length > 0 ? javaCandidates : graph;

      const sorted = [...pool].sort((a, b) => {
        const volDiff = getVolNum(a) - getVolNum(b);
        if (volDiff !== 0) return volDiff;
        const chapDiff = getChapNum(a) - getChapNum(b);
        if (chapDiff !== 0) return chapDiff;
        return getTopicNum(a.id) - getTopicNum(b.id);
      });

      const first = sorted[0];
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
