import { container } from '../../infrastructure/di/container';

export class ContextEngine {
  constructor() {
    this.progressRepo = container.resolve('IProgressRepository');
    this.masteryRepo = container.resolve('IMasteryRepository');
    this.activityRepo = container.resolve('IActivityRepository');
    this.revisionRepo = container.resolve('IRevisionRepository');
    this.interviewRepo = container.resolve('IInterviewSessionRepository');
    this.submissionRepo = container.resolve('ISubmissionRepository');
  }

  async buildContext(uid, activeContext = {}) {
    const [progress, mastery, revisionQueue, sessions, submissions] = await Promise.all([
      this.progressRepo.getProgress(uid).catch(() => null),
      this.masteryRepo.getMastery(uid).catch(() => null),
      this.revisionRepo.getRevisionQueue(uid).catch(() => []),
      this.interviewRepo.listSessions(uid).catch(() => []),
      this.submissionRepo.getSubmissionsHistory(uid).catch(() => [])
    ]);

    // Find weak topics: topics with mastery < 60
    const weakTopics = [];
    if (mastery && typeof mastery.topicScores === 'object') {
      Object.entries(mastery.topicScores).forEach(([topicId, score]) => {
        if (score < 60) {
          weakTopics.push({ topicId, score });
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

    return {
      currentTopic: activeContext.currentTopic || null,
      currentLesson: activeContext.currentLesson || null,
      activeProblem: activeContext.activeProblem || null,
      activeCompanyTrack: activeContext.activeCompanyTrack || null,
      learningProgress: {
        completedTopicsCount: progress?.completedTopics?.length || 0,
        startedTopicsCount: progress?.startedTopics?.length || 0,
        weakTopics
      },
      revisionQueueLength: revisionQueue.length,
      lastCompilerRun,
      lastInterviewSession,
      recommendations: activeContext.recommendations || []
    };
  }
}

export default ContextEngine;
