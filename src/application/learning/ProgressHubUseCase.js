/**
 * ProgressHubUseCase — Learning OS Core Computation Engine
 *
 * Single responsibility: compute the complete Learning OS dashboard state.
 * Uses ONLY existing repositories already registered in the DI container.
 * Does NOT duplicate LearningUseCase — it composes above it.
 */
import { resolveLearningStatus, LearningStatus } from '../../domain/models/LearningStatus';
import curriculumWeights from '../../shared/config/curriculum-weights.json';

export class ProgressHubUseCase {
  constructor({ progressRepo, masteryRepo, activityRepo, graphRepo, recEngine, logger } = {}) {
    this.progressRepo    = progressRepo;
    this.masteryRepo     = masteryRepo;
    this.activityRepo    = activityRepo;
    this.graphRepo       = graphRepo;
    this.recEngine       = recEngine;
    this.logger          = logger;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 1. Weighted Full Stack Progress
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Compute overall weighted completion % and per-module readiness.
   * @param {LearningNode[]} graph
   * @param {Progress[]}     progressList
   * @param {Mastery[]}      masteryList
   * @returns {{ overall: number, modules: object, readinessMap: Map }}
   */
  computeWeightedProgress(graph, progressList, masteryList) {
    const progressMap = new Map(progressList.map(p => [p.topicId, p]));
    const masteryMap  = new Map(masteryList.map(m => [m.topicId, m]));

    const modules = {};
    const readinessMap = new Map();
    let weightedSum = 0;

    const weights = Object.entries(curriculumWeights).filter(([k]) => k !== '_meta');

    for (const [key, config] of weights) {
      // Match graph nodes to this module by tag
      const moduleNodes = graph.filter(node =>
        node.tags && node.tags.some(tag => config.tags.includes(tag))
      );

      if (moduleNodes.length === 0) {
        modules[key] = { ...config, completion: 0, mastery: 0, total: 0, completed: 0 };
        readinessMap.set(key, 0);
        continue;
      }

      const completed = moduleNodes.filter(node => {
        const p = progressMap.get(node.id);
        return p && p.lessonCompleted;
      }).length;

      // Average mastery for this module
      const masteryScores = moduleNodes
        .map(node => masteryMap.get(node.id)?.score || 0)
        .filter(s => s > 0);
      const avgMastery = masteryScores.length > 0
        ? Math.round(masteryScores.reduce((a, b) => a + b, 0) / masteryScores.length)
        : 0;

      const completion = Math.round((completed / moduleNodes.length) * 100);

      modules[key] = {
        ...config,
        completion,
        mastery: avgMastery,
        total: moduleNodes.length,
        completed,
        remaining: moduleNodes.length - completed
      };
      readinessMap.set(key, completion);

      weightedSum += (completion / 100) * config.weight;
    }

    return {
      overall: Math.round(weightedSum),
      modules,
      readinessMap
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Topic Position in the Unified Roadmap
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Returns 1-based position metadata for a topic within the full graph.
   */
  computeTopicPosition(topicId, graph) {
    // Flatten by volume → chapter → topic order
    const sorted = [...graph].sort((a, b) => {
      const getVol = (n) => typeof n.volume === 'number' ? n.volume : parseInt(String(n.volume).replace(/\D/g, '')) || 999;
      const getCh  = (n) => parseInt((String(n.chapter || '').replace('chapter-', '')) || '999');
      const getNum = (id) => parseInt((id.match(/T(\d+)$/) || [0, 999])[1]);

      const vd = getVol(a) - getVol(b);
      if (vd !== 0) return vd;
      const cd = getCh(a) - getCh(b);
      if (cd !== 0) return cd;
      return getNum(a.id) - getNum(b.id);
    });

    const idx = sorted.findIndex(n => n.id === topicId);
    const node = sorted[idx];
    if (!node) return null;

    const volumes = [...new Set(sorted.map(n => n.volume))].sort();
    const chaptersInVolume = sorted.filter(n => n.volume === node.volume);
    const chaptersUniq = [...new Set(chaptersInVolume.map(n => n.chapter))].sort();

    return {
      topicIndex: idx + 1,
      totalTopics: sorted.length,
      volumeIndex: volumes.indexOf(node.volume) + 1,
      totalVolumes: volumes.length,
      chapterIndex: chaptersUniq.indexOf(node.chapter) + 1,
      totalChapters: chaptersUniq.length,
      volumeLabel: `Volume ${node.volume}`,
      chapterLabel: node.chapter
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Remaining Roadmap
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Compute remaining topics + estimated hours per module.
   */
  computeRemainingRoadmap(graph, progressList) {
    const progressMap = new Map(progressList.map(p => [p.topicId, p]));
    const weights = Object.entries(curriculumWeights).filter(([k]) => k !== '_meta');
    const result = [];

    for (const [key, config] of weights) {
      const moduleNodes = graph.filter(node =>
        node.tags && node.tags.some(tag => config.tags.includes(tag))
      );
      const remaining = moduleNodes.filter(n => {
        const p = progressMap.get(n.id);
        return !p || !p.lessonCompleted;
      });
      const estimatedHours = remaining.reduce((acc, n) => {
        return acc + ((n.estimatedReadingTime || 20) + (n.estimatedPracticeTime || 15)) / 60;
      }, 0);

      result.push({
        key,
        label: config.label,
        color: config.color,
        icon: config.icon,
        remaining: remaining.length,
        total: moduleNodes.length,
        estimatedHours: Math.round(estimatedHours * 10) / 10
      });
    }

    const totalHours = result.reduce((acc, r) => acc + r.estimatedHours, 0);
    return { modules: result, totalHours: Math.round(totalHours * 10) / 10 };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Current Focus (Most Recently Active In-Progress Topic)
  // ─────────────────────────────────────────────────────────────────────────

  computeCurrentFocus(graph, progressList) {
    const inProgress = progressList
      .filter(p => !p.lessonCompleted && p.readingPercentage > 0)
      .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));

    if (inProgress.length === 0) return null;

    const latestProgress = inProgress[0];
    const node = graph.find(n => n.id === latestProgress.topicId);
    if (!node) return null;

    return {
      node,
      progress: latestProgress,
      estimatedMinutesRemaining: Math.max(
        1,
        Math.round(((100 - latestProgress.readingPercentage) / 100) * (node.estimatedReadingTime || 20))
      )
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Today's Learning Queue
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Build an ordered list of tasks for the learner's current session.
   * @param {LearningNode[]} graph
   * @param {Progress[]}     progressList
   * @param {Mastery[]}      masteryList
   * @param {Recommendation[]} recommendations - already computed from engine
   * @returns {QueueItem[]}
   */
  computeTodaysQueue(graph, progressList, masteryList, recommendations = []) {
    const progressMap = new Map(progressList.map(p => [p.topicId, p]));
    const queue = [];

    // 1. Priority: resume in-progress lesson
    const inProgress = progressList
      .filter(p => !p.lessonCompleted && p.readingPercentage > 0)
      .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));

    inProgress.slice(0, 2).forEach(p => {
      const node = graph.find(n => n.id === p.topicId);
      if (node) {
        queue.push({
          type: 'lesson',
          priority: 1,
          topicId: node.id,
          topicSlug: node.slug,
          title: `Finish: ${node.title}`,
          subtitle: `${p.readingPercentage}% complete`,
          route: `/courses/java/topics/${node.slug}`,
          tab: 'lesson',
          icon: 'BookOpen'
        });
      }
    });

    // 2. Practice pending (lesson done, practice not done)
    const practicePending = progressList.filter(p => p.lessonCompleted && !p.practiceCompleted);
    practicePending.slice(0, 2).forEach(p => {
      const node = graph.find(n => n.id === p.topicId);
      if (node) {
        queue.push({
          type: 'practice',
          priority: 2,
          topicId: node.id,
          topicSlug: node.slug,
          title: `Solve: ${node.title}`,
          subtitle: 'Practice problem waiting',
          route: `/courses/java/topics/${node.slug}`,
          tab: 'examples',
          icon: 'Code'
        });
      }
    });

    // 3. Quiz pending (practice done, quiz not passed)
    const quizPending = progressList.filter(p => p.practiceCompleted && !p.quizPassed);
    quizPending.slice(0, 1).forEach(p => {
      const node = graph.find(n => n.id === p.topicId);
      if (node) {
        queue.push({
          type: 'quiz',
          priority: 3,
          topicId: node.id,
          topicSlug: node.slug,
          title: `Quiz: ${node.title}`,
          subtitle: 'Test your understanding',
          route: `/courses/java/topics/${node.slug}`,
          tab: 'quiz',
          icon: 'HelpCircle'
        });
      }
    });

    // 4. Flashcard review (quiz passed, flashcards not reviewed)
    const flashcardDue = progressList.filter(p => p.quizPassed && !p.flashcardsReviewed);
    flashcardDue.slice(0, 1).forEach(p => {
      const node = graph.find(n => n.id === p.topicId);
      if (node) {
        queue.push({
          type: 'flashcards',
          priority: 4,
          topicId: node.id,
          topicSlug: node.slug,
          title: `Review: ${node.title}`,
          subtitle: 'Flashcard session due',
          route: `/courses/java/topics/${node.slug}`,
          tab: 'flashcards',
          icon: 'Layers'
        });
      }
    });

    // 5. Next topic recommendation from engine
    const nextRec = recommendations.find(r => r.type === 'NextTopic' || r.type === 'ContinueLesson');
    if (nextRec) {
      const node = graph.find(n => n.id === nextRec.topicId);
      if (node && !progressMap.has(node.id)) {
        queue.push({
          type: 'next',
          priority: 5,
          topicId: node.id,
          topicSlug: node.slug,
          title: `Start: ${node.title}`,
          subtitle: nextRec.description || 'Next in your roadmap',
          route: `/courses/java/topics/${node.slug}`,
          tab: 'lesson',
          icon: 'ArrowRight'
        });
      }
    }

    return queue.sort((a, b) => a.priority - b.priority).slice(0, 7);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 6. Estimated Completion Date
  // ─────────────────────────────────────────────────────────────────────────

  computeEstimatedCompletion(graph, progressList, activitiesList) {
    const completedTopics = progressList.filter(p => p.lessonCompleted).length;
    const totalTopics = graph.length;
    const remaining = totalTopics - completedTopics;

    if (remaining === 0) return { remainingTopics: 0, estimatedDate: null, dailyVelocity: 0 };

    // Daily velocity: topics completed in last 14 days
    const now = new Date();
    const cutoff = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const recentDays = activitiesList.filter(a =>
      new Date(a.timestamp) > cutoff && a.type === 'Lesson Completed'
    ).length;
    const dailyVelocity = Math.max(0.1, recentDays / 14);

    const daysRemaining = Math.ceil(remaining / dailyVelocity);
    const estimatedDate = new Date(now.getTime() + daysRemaining * 24 * 60 * 60 * 1000);

    return {
      remainingTopics: remaining,
      dailyVelocity: Math.round(dailyVelocity * 10) / 10,
      daysRemaining,
      estimatedDate
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 7. Build progress + mastery Maps
  // ─────────────────────────────────────────────────────────────────────────

  buildProgressMap(progressList) {
    return new Map(progressList.map(p => [p.topicId, p]));
  }

  buildMasteryMap(masteryList) {
    return new Map(masteryList.map(m => [m.topicId, m]));
  }
}

export default ProgressHubUseCase;
