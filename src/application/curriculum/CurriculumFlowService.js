/**
 * CurriculumFlowService — Learning flow and priority engine.
 *
 * Single authority for:
 *   - Which topic the user should engage with next
 *   - What ACTION to take on that topic (continue lesson, practice, quiz, revision, start)
 *   - Topic unlock state
 *   - New-user start point (always the global first topic)
 *
 * Priority for getContinueLearningTarget:
 *   1. Current topic lesson not complete  → action: 'continue-lesson'
 *   2. Lesson done, practice score < 0.6  → action: 'practice'
 *   3. Practice done, quiz not passed     → action: 'quiz'
 *   4. Quiz done, flashcards not reviewed → action: 'revision'
 *   5. All done                           → action: 'start-lesson' (next topic)
 *
 * RecommendationEngine / NextTopicStrategy delegate to this service.
 * Dashboard Continue Learning delegates to this service.
 * No other code should contain learning flow logic.
 */
export class CurriculumFlowService {
  /** @param {import('../../domain/curriculum/CourseGraph').CourseGraph} courseGraph */
  constructor(courseGraph) {
    this.graph = courseGraph;
  }

  // ─────────────────────────────────────────────────────────────────
  // Core API
  // ─────────────────────────────────────────────────────────────────

  /**
   * Always returns the very first topic in the curriculum.
   * Used for new users — no heuristics, no tag matching, no sorting.
   * @returns {import('../../domain/models/LearningNode').LearningNode | null}
   */
  getStartTopic() {
    return this.graph.getFirstTopic();
  }

  /**
   * Returns the next unstarted topic in curriculum order for a returning user.
   * Filters to topics whose prerequisites are all met.
   * @param {Map<string, object>} progressMap  topicId → Progress
   * @returns {import('../../domain/models/LearningNode').LearningNode | null}
   */
  getNextTopic(progressMap) {
    const unlocked = this.graph.getUnlockedTopics(progressMap);
    return unlocked.find(n => !progressMap.get(n.id)?.lessonCompleted) ?? null;
  }

  /**
   * Returns the previous topic in curriculum order.
   * @param {string} topicId
   * @returns {import('../../domain/models/LearningNode').LearningNode | null}
   */
  getPreviousTopic(topicId) {
    return this.graph.getPrevious(topicId);
  }

  /**
   * Returns topic unlock state.
   * @param {string} topicId
   * @param {Map<string, object>} progressMap
   */
  isTopicUnlocked(topicId, progressMap) {
    return this.graph.isTopicUnlocked(topicId, progressMap);
  }

  /**
   * Returns the current position metadata for a topic.
   * @param {string} topicId
   */
  getCurrentPosition(topicId) {
    return this.graph.getTopicPosition(topicId);
  }

  /**
   * Priority engine — returns what the user should do right now.
   *
   * @param {string|null}          activeTopicId  The topic the user is currently on (may be null)
   * @param {Map<string, object>}  progressMap    topicId → Progress
   * @param {Map<string, object>}  masteryMap     topicId → Mastery
   * @returns {{ topicId: string, action: string, node: object } | null}
   */
  getContinueLearningTarget(activeTopicId, progressMap, masteryMap) {
    const resolve = (node, action) => node ? { topicId: node.id, action, node } : null;

    if (activeTopicId) {
      const node     = this.graph.getTopic(activeTopicId);
      const progress = progressMap.get(activeTopicId);
      const mastery  = masteryMap?.get(activeTopicId);

      if (node && progress) {
        // 1. Lesson not finished
        if (!progress.lessonCompleted) {
          return resolve(node, 'continue-lesson');
        }
        // 2. Lesson done, practice weak
        if (progress.lessonCompleted && !progress.practiceCompleted) {
          return resolve(node, 'practice');
        }
        // 3. Practice done, quiz not passed
        if (progress.practiceCompleted && !progress.quizPassed) {
          return resolve(node, 'quiz');
        }
        // 4. Quiz done, flashcards not reviewed
        if (progress.quizPassed && !progress.flashcardsReviewed) {
          return resolve(node, 'revision');
        }
      }
    }

    // 5. All done on current topic (or no active topic) — find next unlocked
    const next = this.getNextTopic(progressMap);
    if (next) return resolve(next, 'start-lesson');

    return null;
  }
}

export default CurriculumFlowService;
