import { WeakTopicStrategy } from './WeakTopicStrategy';
import { PrerequisiteStrategy } from './PrerequisiteStrategy';
import { ResumeStrategy } from './ResumeStrategy';
import { NextTopicStrategy } from './NextTopicStrategy';

export class RecommendationEngine {
  constructor() {
    this.strategies = [
      new WeakTopicStrategy(),
      new PrerequisiteStrategy(),
      new ResumeStrategy(),
      new NextTopicStrategy()
    ];
  }

  /**
   * Generates prioritized list of recommendations.
   * @param {object} context uid, graph, progressList, masteryList
   * @returns {Promise<Recommendation[]>} Mapped recommendation list sorted by priority
   */
  async getRecommendations(context) {
    const list = [];
    
    // Evaluate strategies in parallel
    const results = await Promise.all(
      this.strategies.map(strategy => strategy.evaluate(context))
    );

    results.forEach((subList) => {
      list.push(...subList);
    });

    // Sort by priority parameter (lower value = higher priority)
    return list.sort((a, b) => a.priority - b.priority);
  }
}
export default RecommendationEngine;
