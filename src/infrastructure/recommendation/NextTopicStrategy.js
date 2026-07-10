/**
 * NextTopicStrategy — Recommendation strategy for the next learning action.
 *
 * Thin delegate to CurriculumFlowService — all flow logic lives there.
 * This class satisfies the IRecommendationStrategy interface only.
 */
import { IRecommendationStrategy } from '../../domain/evaluation/IRecommendationStrategy';
import { Recommendation } from '../../domain/models/Recommendation';
import { container } from '../di/container';

export class NextTopicStrategy extends IRecommendationStrategy {
  async evaluate(context) {
    const { progressList, masteryList = [], activeTopicId = null } = context;
    const recommendations = [];

    const progressMap = new Map(progressList.map(p => [p.topicId, p]));
    const masteryMap  = new Map(masteryList.map(m => [m.topicId, m]));

    // Delegate all flow decisions to CurriculumFlowService
    const flowService = container.resolve('CurriculumFlowService');

    // New user — no completions at all
    const completedCount = progressList.filter(p => p.lessonCompleted).length;
    if (completedCount === 0) {
      const first = flowService.getStartTopic();
      if (first) {
        recommendations.push(new Recommendation({
          type:        'StartCurriculum',
          topicId:     first.id,
          title:       `Start with ${first.title}`,
          description: 'Welcome to JavaMentor! Begin your Full Stack Java journey.',
          priority:    5
        }));
      }
      return recommendations;
    }

    // Returning user — priority engine
    const target = flowService.getContinueLearningTarget(activeTopicId, progressMap, masteryMap);
    if (target) {
      const actionLabels = {
        'continue-lesson': 'Continue Lesson',
        'practice':        'Practice',
        'quiz':            'Take Quiz',
        'revision':        'Revision',
        'start-lesson':    `Learn ${target.node?.title || ''}`,
      };

      recommendations.push(new Recommendation({
        type:        'UnlockNext',
        topicId:     target.topicId,
        action:      target.action,
        title:       actionLabels[target.action] || `Continue Learning`,
        description: 'Ready to go! Continue your Full Stack Java career path.',
        priority:    4
      }));
    }

    return recommendations;
  }
}

export default NextTopicStrategy;
