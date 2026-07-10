/**
 * ProgressAggregationService — All progress math in one place.
 *
 * Extracted from ProgressHubUseCase and enriched with:
 *   - Velocity calculation (topics completed per week)
 *   - Remaining hours estimate
 *   - Consistent module-based calculation via CourseGraph (no tag matching)
 *
 * Every dashboard panel, progress hub, and navigator reads from this service
 * so XP, completion %, and position are always identical across the UI.
 */
import curriculumWeights from '../../shared/config/curriculum-weights.json';

export class ProgressAggregationService {
  /** @param {import('../../domain/curriculum/CourseGraph').CourseGraph} courseGraph */
  constructor(courseGraph) {
    this.graph = courseGraph;
  }

  // ─────────────────────────────────────────────────────────────────
  // Weighted Full Stack Progress
  // ─────────────────────────────────────────────────────────────────

  /**
   * Computes weighted overall completion % and per-module stats.
   * Uses CourseGraph.getTopicsInModule for accurate module membership — no tag matching.
   *
   * @param {Map<string, object>} progressMap   topicId → Progress
   * @param {Map<string, object>} masteryMap    topicId → Mastery
   * @returns {{ overall: number, modules: object, readinessMap: Map }}
   */
  computeWeightedProgress(progressMap, masteryMap) {
    const modules     = {};
    const readinessMap = new Map();
    let weightedSum   = 0;

    const weights = Object.entries(curriculumWeights).filter(([k]) => k !== '_meta');

    for (const [key, config] of weights) {
      const moduleTopics = this.graph.getTopicsInModule(key);

      if (moduleTopics.length === 0) {
        modules[key] = { ...config, completion: 0, mastery: 0, total: 0, completed: 0, remaining: 0 };
        readinessMap.set(key, 0);
        continue;
      }

      const completed = moduleTopics.filter(n => progressMap.get(n.id)?.lessonCompleted).length;

      const masteryScores = moduleTopics
        .map(n => masteryMap?.get(n.id)?.score || 0)
        .filter(s => s > 0);
      const avgMastery = masteryScores.length > 0
        ? Math.round(masteryScores.reduce((a, b) => a + b, 0) / masteryScores.length)
        : 0;

      const completion = Math.round((completed / moduleTopics.length) * 100);

      modules[key] = {
        ...config,
        completion,
        mastery: avgMastery,
        total: moduleTopics.length,
        completed,
        remaining: moduleTopics.length - completed
      };
      readinessMap.set(key, completion);
      weightedSum += (completion / 100) * (config.weight || 0);
    }

    return {
      overall: Math.round(weightedSum),
      modules,
      readinessMap
    };
  }

  // ─────────────────────────────────────────────────────────────────
  // Topic Position
  // ─────────────────────────────────────────────────────────────────

  /**
   * Returns position metadata for a topic in the global curriculum order.
   * Delegates to CourseGraph — no manual sorting anywhere.
   * @param {string} topicId
   */
  computeTopicPosition(topicId) {
    return this.graph.getTopicPosition(topicId);
  }

  // ─────────────────────────────────────────────────────────────────
  // Velocity
  // ─────────────────────────────────────────────────────────────────

  /**
   * Computes learning velocity from activity records.
   * @param {Array} activityList  activity log entries with { completedAt } timestamps
   * @returns {{ topicsPerWeek: number, estimatedFinishDate: Date | null }}
   */
  computeVelocity(activityList = []) {
    const completions = activityList
      .filter(a => a.type === 'lesson_completed' && a.completedAt)
      .map(a => new Date(a.completedAt).getTime())
      .filter(t => !isNaN(t))
      .sort();

    if (completions.length < 2) {
      return { topicsPerWeek: 0, estimatedFinishDate: null };
    }

    const spanMs     = completions[completions.length - 1] - completions[0];
    const spanWeeks  = spanMs / (7 * 24 * 60 * 60 * 1000) || 1;
    const topicsPerWeek = completions.length / spanWeeks;

    return { topicsPerWeek: Math.round(topicsPerWeek * 10) / 10, estimatedFinishDate: null };
  }

  // ─────────────────────────────────────────────────────────────────
  // Remaining Hours
  // ─────────────────────────────────────────────────────────────────

  /**
   * Estimates remaining learning hours from a given topic forward.
   * @param {string} fromTopicId
   * @param {Map<string, object>} progressMap
   * @returns {number} hours (rounded to 1 decimal)
   */
  computeRemainingHours(fromTopicId, progressMap) {
    const raw = this.graph.getRemainingEstimatedHours(fromTopicId, progressMap);
    return Math.round(raw * 10) / 10;
  }
}

export default ProgressAggregationService;
