import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContextEngine } from '../ContextEngine';
import { container } from '../../../infrastructure/di/container';

// Stub container.resolve
vi.spyOn(container, 'resolve').mockImplementation((name) => {
  return {
    listProgress: vi.fn(),
    listMastery: vi.fn(),
    getRevisionQueue: vi.fn(),
    listSessions: vi.fn(),
    getSubmissionsHistory: vi.fn()
  };
});

describe('ContextEngine unit tests', () => {
  let contextEngine;
  let mockProgressRepo;
  let mockMasteryRepo;
  let mockRevisionUseCase;
  let mockInterviewRepo;
  let mockSubmissionRepo;

  beforeEach(() => {
    mockProgressRepo = {
      listProgress: vi.fn().mockResolvedValue([
        { topicId: 't1', lessonCompleted: true, readingPercentage: 100 },
        { topicId: 't2', lessonCompleted: false, readingPercentage: 50 }
      ])
    };
    mockMasteryRepo = {
      listMastery: vi.fn().mockResolvedValue([
        { topicId: 't1', score: 85 },
        { topicId: 't2', score: 45 }
      ])
    };
    mockRevisionUseCase = {
      getRevisionQueue: vi.fn().mockResolvedValue({
        today: [{ id: 'card-1' }],
        overdue: [{ id: 'card-2' }, { id: 'card-3' }],
        upcoming: []
      })
    };
    mockInterviewRepo = {
      listSessions: vi.fn().mockResolvedValue([])
    };
    mockSubmissionRepo = {
      getSubmissionsHistory: vi.fn().mockResolvedValue([
        { problemId: 'p1', verdict: 'Compilation Error', errorMessage: 'Syntax Error', output: '', submittedAt: new Date() }
      ])
    };

    vi.spyOn(container, 'resolve').mockImplementation((name) => {
      if (name === 'IProgressRepository') return mockProgressRepo;
      if (name === 'IMasteryRepository') return mockMasteryRepo;
      if (name === 'RevisionUseCase') return mockRevisionUseCase;
      if (name === 'IInterviewSessionRepository') return mockInterviewRepo;
      if (name === 'ISubmissionRepository') return mockSubmissionRepo;
      return {};
    });

    contextEngine = new ContextEngine();
  });

  it('should build the user context summary correctly from repositories', async () => {
    const context = await contextEngine.buildContext('user-123', {
      currentTopic: 'OOP Basics'
    });

    expect(context.currentTopic).toBe('OOP Basics');
    expect(context.learningProgress.completedTopicsCount).toBe(1);
    expect(context.learningProgress.startedTopicsCount).toBe(2);
    expect(context.learningProgress.weakTopics).toEqual([
      { topicId: 't2', score: 45 }
    ]);
    expect(context.revisionQueueLength).toBe(3); // 1 today + 2 overdue
    expect(context.lastCompilerRun.verdict).toBe('Compilation Error');
  });
});
