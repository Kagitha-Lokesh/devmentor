import { container } from '../../infrastructure/di/container';

export class ContextEngine {
  constructor() {
    // Dependencies are resolved dynamically at runtime to break circular import cycles
  }

  async buildContext(uid, activeContext = {}) {
    const progressRepo = container.resolve('IProgressRepository');
    const masteryRepo = container.resolve('IMasteryRepository');
    const revisionUseCase = container.resolve('RevisionUseCase');
    const interviewRepo = container.resolve('IInterviewSessionRepository');
    const submissionRepo = container.resolve('ISubmissionRepository');

    const [progressList, masteryList, revisionQueue, sessions, submissions] = await Promise.all([
      progressRepo.listProgress(uid).catch(() => []),
      masteryRepo.listMastery(uid).catch(() => []),
      revisionUseCase.getRevisionQueue(uid).catch(() => null),
      interviewRepo.listSessions(uid).catch(() => []),
      submissionRepo.getSubmissionsHistory(uid).catch(() => [])
    ]);

    // Find weak topics: topics with mastery < 60
    const weakTopics = [];
    if (Array.isArray(masteryList)) {
      masteryList.forEach((m) => {
        if (m.score > 0 && m.score < 60) {
          weakTopics.push({ topicId: m.topicId, score: m.score });
        }
      });
    }

    // Extract last compiler error
    let lastCompilerRun = null;
    const lastSub = submissions?.[0];
    if (lastSub) {
      lastCompilerRun = {
        problemId: lastSub.problemId,
        verdict: lastSub.verdict,
        error: lastSub.errorMessage || lastSub.verdict,
        output: lastSub.output,
        timestamp: lastSub.submittedAt
      };
    }

    // Recent interview stats
    const lastInterviewSession = sessions?.[0] ? {
      id: sessions[0].id,
      trackName: sessions[0].trackName,
      status: sessions[0].status,
      answeredCount: Object.keys(sessions[0].answers || {}).length,
      completedAt: sessions[0].completedAt
    } : null;

    const revisionQueueLength = revisionQueue
      ? (revisionQueue.today?.length || 0) + (revisionQueue.overdue?.length || 0)
      : 0;

    return {
      currentTopic: activeContext.currentTopic || null,
      currentLesson: activeContext.currentLesson || null,
      activeProblem: activeContext.activeProblem || null,
      activeCompanyTrack: activeContext.activeCompanyTrack || null,
      learningProgress: {
        completedTopicsCount: Array.isArray(progressList) ? progressList.filter(p => p.lessonCompleted).length : 0,
        startedTopicsCount: Array.isArray(progressList) ? progressList.filter(p => p.readingPercentage > 0).length : 0,
        weakTopics
      },
      revisionQueueLength,
      lastCompilerRun,
      lastInterviewSession,
      recommendations: activeContext.recommendations || []
    };
  }
}

export default ContextEngine;
