/**
 * CourseGraph — Centralized curriculum graph query engine.
 *
 * Single source of truth for ALL graph traversal, topic ordering, progress
 * calculation, search, and breadcrumb generation across JavaMentor.
 *
 * Designed around the curriculum-index.json global topic order so that:
 *   - No regex ID parsing happens at runtime
 *   - No tag-based module matching happens anywhere
 *   - Every consumer gets consistent results from one implementation
 *
 * Construction:
 *   const graph = new CourseGraph(graphNodes, curriculumIndex, modules);
 *
 * Where:
 *   graphNodes[]     — LearningNode[] from knowledge-graph.json (now includes
 *                      courseId, moduleId, volumeOrder, chapterOrder, topicOrder)
 *   curriculumIndex  — parsed curriculum-index.json
 *   modules          — ordered module definitions from curriculum-manifest.json
 */
export class CourseGraph {
  constructor(graphNodes = [], curriculumIndex = {}, modules = []) {
    this._modules = [...modules].sort((a, b) => a.order - b.order);

    // Build O(1) lookup by topicId
    this._nodeMap = new Map(graphNodes.map(n => [n.id, n]));

    // Canonical order from curriculum-index.json
    const orderedIds = curriculumIndex.orderedTopicIds || [];
    this._orderedIds = orderedIds.filter(id => this._nodeMap.has(id));

    // Position map: topicId → 0-based index in global order
    this._posMap = new Map(this._orderedIds.map((id, i) => [id, i]));

    // Module slice map: moduleId → { order, startIndex, count, courseId }
    this._moduleIndex = curriculumIndex.moduleIndex || {};

    // Pre-group nodes by moduleId for fast getTopicsInModule
    this._byModule = new Map();
    for (const id of this._orderedIds) {
      const node = this._nodeMap.get(id);
      if (!node?.moduleId) continue;
      if (!this._byModule.has(node.moduleId)) this._byModule.set(node.moduleId, []);
      this._byModule.get(node.moduleId).push(node);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Basic lookups
  // ─────────────────────────────────────────────────────────────────

  /** Returns the LearningNode for a given topic ID, or null. */
  getTopic(id) {
    return this._nodeMap.get(id) ?? null;
  }

  /** Returns the very first topic in the global curriculum order. */
  getFirstTopic() {
    const id = this._orderedIds[0];
    return id ? this._nodeMap.get(id) : null;
  }

  /** Returns all topic nodes in canonical global order. */
  getAllTopics() {
    return this._orderedIds.map(id => this._nodeMap.get(id));
  }

  // ─────────────────────────────────────────────────────────────────
  // Navigation
  // ─────────────────────────────────────────────────────────────────

  /** Returns the next topic after `id` in curriculum order, or null. */
  getNext(id) {
    const pos = this._posMap.get(id);
    if (pos == null || pos >= this._orderedIds.length - 1) return null;
    return this._nodeMap.get(this._orderedIds[pos + 1]) ?? null;
  }

  /** Returns the previous topic before `id` in curriculum order, or null. */
  getPrevious(id) {
    const pos = this._posMap.get(id);
    if (pos == null || pos <= 0) return null;
    return this._nodeMap.get(this._orderedIds[pos - 1]) ?? null;
  }

  /**
   * Returns the next N topics after `fromId` (inclusive of fromId if desired).
   * Useful for "upcoming topics" previews.
   */
  getLearningPath(fromId, count = 5) {
    const pos = this._posMap.get(fromId);
    if (pos == null) return [];
    return this._orderedIds
      .slice(pos + 1, pos + 1 + count)
      .map(id => this._nodeMap.get(id))
      .filter(Boolean);
  }

  // ─────────────────────────────────────────────────────────────────
  // Position
  // ─────────────────────────────────────────────────────────────────

  /**
   * Returns rich 1-based position metadata for a topic.
   * @returns {{
   *   globalIndex: number,   totalTopics: number,
   *   moduleId: string,      moduleIndex: number, moduleTotal: number,
   *   volumeOrder: number,   chapterOrder: number, topicOrder: number,
   *   moduleName: string
   * } | null}
   */
  getTopicPosition(id) {
    const pos = this._posMap.get(id);
    if (pos == null) return null;
    const node = this._nodeMap.get(id);
    const moduleTopics = this._byModule.get(node?.moduleId) || [];
    const modPos = moduleTopics.findIndex(n => n.id === id);
    const modDef = this._moduleIndex[node?.moduleId];
    const moduleName = this._modules.find(m => m.id === node?.moduleId)?.title || node?.moduleId || '';

    return {
      globalIndex:  pos + 1,
      totalTopics:  this._orderedIds.length,
      moduleId:     node?.moduleId || null,
      moduleName,
      moduleIndex:  modPos + 1,
      moduleTotal:  moduleTopics.length,
      volumeOrder:  node?.volumeOrder || 1,
      chapterOrder: node?.chapterOrder || 1,
      topicOrder:   node?.topicOrder || 1,
    };
  }

  // ─────────────────────────────────────────────────────────────────
  // Module / Chapter / Volume queries
  // ─────────────────────────────────────────────────────────────────

  /**
   * Returns all topics in a module in canonical curriculum order.
   * @param {string} moduleId
   * @returns {LearningNode[]}
   */
  getTopicsInModule(moduleId) {
    return this._byModule.get(moduleId) || [];
  }

  /**
   * Returns all topics in a specific chapter.
   * @param {string} moduleId
   * @param {number} volumeOrder
   * @param {number} chapterOrder
   * @returns {LearningNode[]}
   */
  getTopicsInChapter(moduleId, volumeOrder, chapterOrder) {
    return this.getTopicsInModule(moduleId).filter(n =>
      n.volumeOrder === volumeOrder && n.chapterOrder === chapterOrder
    );
  }

  /**
   * Returns the grouped structure for a module: volumes → chapters → topics.
   * Used by CurriculumNavigator.
   * @returns {{ volumeOrder: number, chapterOrder: number, topics: LearningNode[] }[][]}
   */
  getModuleStructure(moduleId) {
    const nodes = this.getTopicsInModule(moduleId);
    const volumes = new Map();
    for (const node of nodes) {
      const vk = node.volumeOrder;
      if (!volumes.has(vk)) volumes.set(vk, new Map());
      const chapters = volumes.get(vk);
      const ck = node.chapterOrder;
      if (!chapters.has(ck)) chapters.set(ck, []);
      chapters.get(ck).push(node);
    }
    // Convert to sorted arrays
    return [...volumes.entries()]
      .sort(([a], [b]) => a - b)
      .map(([vol, chapters]) => ({
        volumeOrder: vol,
        chapters: [...chapters.entries()]
          .sort(([a], [b]) => a - b)
          .map(([chap, topics]) => ({ chapterOrder: chap, topics }))
      }));
  }

  /** Returns all module definitions in canonical order. */
  getModules() {
    return this._modules;
  }

  // ─────────────────────────────────────────────────────────────────
  // Prerequisites / Unlock
  // ─────────────────────────────────────────────────────────────────

  /** Returns prerequisite IDs for a topic. */
  getPrerequisites(id) {
    return this._nodeMap.get(id)?.prerequisites || [];
  }

  /**
   * Returns prerequisite IDs that have NOT been completed.
   * @param {string} id
   * @param {Map<string, object>} progressMap  topicId → Progress
   */
  getMissingPrerequisites(id, progressMap) {
    return this.getPrerequisites(id).filter(prereqId => {
      const p = progressMap.get(prereqId);
      return !p?.lessonCompleted;
    });
  }

  /**
   * Returns true if all prerequisites are completed.
   * @param {string} id
   * @param {Map<string, object>} progressMap
   */
  isTopicUnlocked(id, progressMap) {
    return this.getMissingPrerequisites(id, progressMap).length === 0;
  }

  /**
   * Returns all topics whose prerequisites are fully met.
   * @param {Map<string, object>} progressMap
   * @returns {LearningNode[]} in curriculum order
   */
  getUnlockedTopics(progressMap) {
    return this._orderedIds
      .map(id => this._nodeMap.get(id))
      .filter(n => n && this.isTopicUnlocked(n.id, progressMap));
  }

  // ─────────────────────────────────────────────────────────────────
  // Progress
  // ─────────────────────────────────────────────────────────────────

  /**
   * Returns completion stats for a module.
   * @param {string} moduleId
   * @param {Map<string, object>} progressMap
   * @returns {{ completed: number, total: number, pct: number }}
   */
  getModuleProgress(moduleId, progressMap) {
    const topics = this.getTopicsInModule(moduleId);
    const completed = topics.filter(n => progressMap.get(n.id)?.lessonCompleted).length;
    return { completed, total: topics.length, pct: topics.length > 0 ? Math.round((completed / topics.length) * 100) : 0 };
  }

  /**
   * Returns global completion stats.
   * @param {Map<string, object>} progressMap
   * @returns {{ completed: number, total: number, pct: number }}
   */
  getGlobalProgress(progressMap) {
    const total = this._orderedIds.length;
    const completed = this._orderedIds.filter(id => progressMap.get(id)?.lessonCompleted).length;
    return { completed, total, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }

  /**
   * Estimates remaining learning hours from a given topic position.
   * @param {string} fromId  starting topic (inclusive)
   * @param {Map<string, object>} progressMap
   */
  getRemainingEstimatedHours(fromId, progressMap) {
    const pos = this._posMap.get(fromId) ?? 0;
    return this._orderedIds
      .slice(pos)
      .map(id => this._nodeMap.get(id))
      .filter(n => n && !progressMap.get(n.id)?.lessonCompleted)
      .reduce((acc, n) => acc + (n.estimatedReadingTime || 15) / 60, 0);
  }

  // ─────────────────────────────────────────────────────────────────
  // Search
  // ─────────────────────────────────────────────────────────────────

  /**
   * Searches topics by title, description, and searchKeywords.
   * Returns results in curriculum order with breadcrumb context.
   * @param {string} query
   * @returns {{ node: LearningNode, breadcrumb: string[], matchedOn: string }[]}
   */
  search(query) {
    if (!query?.trim()) return [];
    const q = query.toLowerCase().trim();
    const results = [];

    for (const id of this._orderedIds) {
      const node = this._nodeMap.get(id);
      if (!node) continue;

      let matchedOn = null;
      if (node.title?.toLowerCase().includes(q)) matchedOn = 'title';
      else if (node.description?.toLowerCase().includes(q)) matchedOn = 'description';
      else if (node.tags?.some(t => t.toLowerCase().includes(q))) matchedOn = 'tag';

      if (matchedOn) {
        results.push({ node, breadcrumb: this.buildBreadcrumb(id), matchedOn });
      }
    }
    return results;
  }

  /**
   * Builds a human-readable breadcrumb for a topic.
   * @param {string} id
   * @returns {Array<{ label: string, key: string }>}
   */
  buildBreadcrumb(id) {
    const node = this._nodeMap.get(id);
    if (!node) return [];
    const mod = this._modules.find(m => m.id === node.moduleId);
    const vol = mod?.volumes?.find(v => v.order === node.volumeOrder);
    const chap = vol?.chapters?.find(c => c.order === node.chapterOrder);
    return [
      mod  ? { label: mod.title,   key: `mod:${mod.id}` }                            : null,
      vol  ? { label: vol.title,   key: `vol:${mod?.id}:${vol.order}` }              : null,
      chap ? { label: chap.title,  key: `chap:${mod?.id}:${vol?.order}:${chap.order}` } : null,
      { label: node.title, key: `topic:${id}` }
    ].filter(Boolean);
  }
}

export default CourseGraph;
