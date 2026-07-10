import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProgressHubUseCase } from '../ProgressHubUseCase';
import { Progress } from '../../../domain/models/Progress';

describe('ProgressHubUseCase unit tests', () => {
  let useCase;
  let mockProgressRepo;
  let mockMasteryRepo;
  let mockActivityRepo;
  let mockGraphRepo;
  let mockRecEngine;
  let mockLogger;

  beforeEach(() => {
    mockProgressRepo = {
      getProgress: vi.fn(),
      saveProgress: vi.fn(),
      listProgress: vi.fn()
    };
    mockMasteryRepo = {
      getMastery: vi.fn(),
      saveMastery: vi.fn(),
      listMastery: vi.fn()
    };
    mockActivityRepo = {
      logActivity: vi.fn(),
      listActivities: vi.fn()
    };
    mockGraphRepo = {
      getGraph: vi.fn(),
      getPrerequisites: vi.fn()
    };
    mockRecEngine = {
      getRecommendations: vi.fn()
    };
    mockLogger = {
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    };

    useCase = new ProgressHubUseCase({
      progressRepo: mockProgressRepo,
      masteryRepo: mockMasteryRepo,
      activityRepo: mockActivityRepo,
      graphRepo: mockGraphRepo,
      recEngine: mockRecEngine,
      logger: mockLogger
    });
  });

  describe('computeWeightedProgress', () => {
    it('should compute overall and module progress correctly', () => {
      const graph = [
        { id: 't1', title: 'Java basics', tags: ['Java'], volume: 1, chapter: 'chapter-1' },
        { id: 't2', title: 'OOP core', tags: ['Java'], volume: 1, chapter: 'chapter-1' },
        { id: 't3', title: 'Recursion basics', tags: ['DSA'], volume: 1, chapter: 'chapter-2' }
      ];

      const progressList = [
        new Progress({ topicId: 't1', lessonCompleted: true, practiceCompleted: true, quizPassed: true, flashcardsReviewed: true }),
        new Progress({ topicId: 't2', lessonCompleted: false, readingPercentage: 50 })
      ];

      const masteryList = [
        { topicId: 't1', score: 90 }
      ];

      const result = useCase.computeWeightedProgress(graph, progressList, masteryList);

      expect(result.overall).toBeDefined();
      // Java module has 2 topics, 1 is completed (100% reading/lessonCompleted), 1 is not. Completion = 50%.
      // DSA has 1 topic, 0 completed. Completion = 0%.
      // Check that the modules are computed correctly
      expect(result.modules.java.completion).toBe(50);
      expect(result.modules.java.completed).toBe(1);
      expect(result.modules.java.total).toBe(2);
      expect(result.modules.java.mastery).toBe(90);

      expect(result.modules.dsa.completion).toBe(0);
      expect(result.modules.dsa.completed).toBe(0);
      expect(result.modules.dsa.total).toBe(1);
    });
  });

  describe('computeTopicPosition', () => {
    it('should compute the correct position in the curriculum order', () => {
      const graph = [
        { id: 't1', title: 'Java Basics', volume: 1, chapter: 'chapter-1' },
        { id: 't2', title: 'Java OOP', volume: 1, chapter: 'chapter-1' },
        { id: 't3', title: 'DSA Lists', volume: 2, chapter: 'chapter-2' }
      ];

      const pos1 = useCase.computeTopicPosition('t1', graph);
      expect(pos1.topicIndex).toBe(1);
      expect(pos1.totalTopics).toBe(3);
      expect(pos1.volumeIndex).toBe(1);
      expect(pos1.chapterIndex).toBe(1);

      const pos3 = useCase.computeTopicPosition('t3', graph);
      expect(pos3.topicIndex).toBe(3);
      expect(pos3.volumeIndex).toBe(2);
      expect(pos3.chapterIndex).toBe(1); // chapter-2 is the first unique chapter in volume 2
    });
  });

  describe('computeRemainingRoadmap', () => {
    it('should compute estimated hours and remaining topic count', () => {
      const graph = [
        { id: 't1', tags: ['Java'], estimatedReadingTime: 30, estimatedPracticeTime: 30 },
        { id: 't2', tags: ['Java'], estimatedReadingTime: 20, estimatedPracticeTime: 10 },
        { id: 't3', tags: ['DSA'], estimatedReadingTime: 40, estimatedPracticeTime: 20 }
      ];

      const progressList = [
        new Progress({ topicId: 't1', lessonCompleted: true })
      ];

      const result = useCase.computeRemainingRoadmap(graph, progressList);

      // t1 is completed. t2 is remaining in Java (30 min total = 0.5 hours).
      // t3 is remaining in DSA (60 min total = 1.0 hours).
      // Total remaining hours = ~1.5
      expect(result.totalHours).toBeCloseTo(1.5, 0.1);

      const javaMod = result.modules.find(m => m.key === 'java');
      expect(javaMod.remaining).toBe(1);
      expect(javaMod.estimatedHours).toBe(0.5);

      const dsaMod = result.modules.find(m => m.key === 'dsa');
      expect(dsaMod.remaining).toBe(1);
      expect(dsaMod.estimatedHours).toBe(1.0);
    });
  });

  describe('computeCurrentFocus', () => {
    it('should identify the most recently active in-progress lesson', () => {
      const graph = [
        { id: 't1', title: 'Java Basics', estimatedReadingTime: 20 },
        { id: 't2', title: 'Java OOP', estimatedReadingTime: 30 }
      ];

      const progressList = [
        new Progress({ topicId: 't1', lessonCompleted: false, readingPercentage: 50, lastActivity: new Date('2026-07-09T10:00:00Z') }),
        new Progress({ topicId: 't2', lessonCompleted: false, readingPercentage: 20, lastActivity: new Date('2026-07-09T11:00:00Z') })
      ];

      const focus = useCase.computeCurrentFocus(graph, progressList);

      expect(focus).toBeDefined();
      expect(focus.node.id).toBe('t2'); // t2 has more recent lastActivity
      expect(focus.progress.readingPercentage).toBe(20);
      // Remaining minutes for t2 (30 min total, 20% completed => 80% remaining => 24 min remaining)
      expect(focus.estimatedMinutesRemaining).toBe(24);
    });
  });

  describe('computeTodaysQueue', () => {
    it('should prioritize in-progress and next steps in correct priority order', () => {
      const graph = [
        { id: 't1', slug: 'basics', title: 'Basics' },
        { id: 't2', slug: 'oop', title: 'OOP' },
        { id: 't3', slug: 'lists', title: 'Lists' }
      ];

      const progressList = [
        // t1 is in-progress (priority 1)
        new Progress({ topicId: 't1', readingPercentage: 40 }),
        // t2 has practice pending (priority 2)
        new Progress({ topicId: 't2', lessonCompleted: true, practiceCompleted: false })
      ];

      const recommendations = [
        { type: 'NextTopic', topicId: 't3', description: 'Next up' }
      ];

      const queue = useCase.computeTodaysQueue(graph, progressList, [], recommendations);

      expect(queue.length).toBe(3);
      expect(queue[0].type).toBe('lesson'); // t1 in-progress
      expect(queue[0].topicId).toBe('t1');
      expect(queue[1].type).toBe('practice'); // t2 practice pending
      expect(queue[1].topicId).toBe('t2');
      expect(queue[2].type).toBe('next'); // t3 recommendation
      expect(queue[2].topicId).toBe('t3');
    });
  });
});
