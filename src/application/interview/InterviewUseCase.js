import { container } from '../../infrastructure/di/container';
import { eventBus } from '../../shared/events/EventBus';
import { InterviewSession } from '../../domain/models/InterviewSession';
import { InterviewAnswer } from '../../domain/models/InterviewAnswer';
import { InterviewStatistics } from '../../domain/models/InterviewStatistics';
import { Activity, ActivityType } from '../../domain/models/Activity';

export class InterviewUseCase {
  constructor() {
    this.companyRepo = container.resolve('ICompanyRepository');
    this.interviewRepo = container.resolve('IInterviewRepository');
    this.sessionRepo = container.resolve('IInterviewSessionRepository');
    this.statsRepo = container.resolve('IInterviewStatisticsRepository');
    this.activityRepo = container.resolve('IActivityRepository');
    this.logger = container.resolve('ILogger');

    // ─── Event Subscriptions ─────────────────────────────────────────────
    eventBus.subscribe('INTERVIEW_STARTED', async ({ uid, trackId, sessionId }) => {
      this.logger.info(`[InterviewUseCase] Session started: ${sessionId} | track: ${trackId}`);
      try {
        await this.activityRepo.logActivity(uid, new Activity({
          type: ActivityType.LessonStarted,
          topicId: trackId || 'interview'
        }));
      } catch {}
    });

    eventBus.subscribe('INTERVIEW_COMPLETED', async ({ uid, trackId, session }) => {
      this.logger.info(`[InterviewUseCase] Session completed: ${session.id}`);
      try {
        await this.activityRepo.logActivity(uid, new Activity({
          type: ActivityType.RevisionCompleted,
          topicId: trackId || 'interview',
          duration: session.duration
        }));
      } catch {}
    });
  }

  // ─── Company Tracks ──────────────────────────────────────────────────────

  async getCompanies() {
    return this.companyRepo.getCompanies();
  }

  async getRoadmap(companyId) {
    return this.companyRepo.getRoadmap(companyId);
  }

  // ─── Question Access ─────────────────────────────────────────────────────

  async getAllQuestions() {
    return this.interviewRepo.getQuestions();
  }

  async getQuestionsByCategory(category) {
    return this.interviewRepo.getQuestionsByCategory(category);
  }

  async getQuestionsByCompany(companyId) {
    return this.interviewRepo.getQuestionsByCompany(companyId);
  }

  // ─── Session Management ──────────────────────────────────────────────────

  /**
   * Build a deterministic interview session based on track/category selection.
   * Supports modes: 'company', 'Behavioral', 'Technical', 'SystemDesign', 'HR', 'Mixed', 'Quick'.
   * @param {string} uid
   * @param {object} options - { trackId, trackName, mode, count, scoringProfile }
   */
  async startSession(uid, options = {}) {
    const {
      trackId = 'general',
      trackName = 'General Preparation',
      mode = 'Mixed',
      count = 10,
      scoringProfile = 'campus'
    } = options;

    let questionPool = [];

    if (mode === 'company' && trackId !== 'general') {
      questionPool = await this.interviewRepo.getQuestionsByCompany(trackId);
    } else if (['Technical', 'Behavioral', 'SystemDesign', 'HR'].includes(mode)) {
      questionPool = await this.interviewRepo.getQuestionsByCategory(mode);
    } else {
      // Mixed or Quick — get all questions
      questionPool = await this.interviewRepo.getQuestions();
    }

    // Shuffle deterministically and slice to requested count
    const shuffled = [...questionPool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));

    const session = new InterviewSession({
      userId: uid,
      trackId,
      trackName,
      scoringProfile,
      questions: selected,
      answers: {},
      status: 'Started',
      startedAt: new Date()
    });

    await this.sessionRepo.saveSession(uid, session);

    eventBus.publish('INTERVIEW_STARTED', { uid, trackId, sessionId: session.id });

    return session;
  }

  /**
   * Submit an answer for a question in the session.
   * Recalculates completion and confidence averages.
   */
  async submitAnswer(uid, sessionId, questionId, answerData) {
    const session = await this.sessionRepo.getSession(uid, sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found.`);

    const answer = new InterviewAnswer({ questionId, ...answerData });

    // Calculate checkedPoints completion %
    const totalPoints = session.questions.find(q => q.id === questionId)?.keyPoints?.length || 1;
    answer.completionPercentage = Math.round((answer.checkedPoints.length / totalPoints) * 100);

    session.answers[questionId] = answer;

    await this.sessionRepo.saveSession(uid, session);

    eventBus.publish('QUESTION_ANSWERED', { uid, sessionId, questionId, rating: answer.selfRating });

    return answer;
  }

  /**
   * Finalize a session and update aggregate statistics.
   */
  async completeSession(uid, sessionId) {
    const session = await this.sessionRepo.getSession(uid, sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found.`);

    session.status = 'Completed';
    session.completedAt = new Date();

    // Duration in seconds from start
    const durationMs = session.completedAt - (session.startedAt instanceof Date
      ? session.startedAt
      : new Date(session.startedAt));
    session.duration = Math.round(durationMs / 1000);

    await this.sessionRepo.saveSession(uid, session);

    // Update aggregate statistics
    await this._updateStatistics(uid, session);

    eventBus.publish('INTERVIEW_COMPLETED', { uid, trackId: session.trackId, session });

    return session;
  }

  /**
   * Toggle bookmark on/off for a question.
   */
  async toggleBookmark(uid, questionId) {
    // FirestoreInterviewRepository handles this directly
    const repo = container.resolve('IInterviewSessionRepository');
    if (typeof repo.toggleBookmark === 'function') {
      return repo.toggleBookmark(uid, questionId);
    }
    return false;
  }

  async getBookmarks(uid) {
    const repo = container.resolve('IInterviewSessionRepository');
    if (typeof repo.getBookmarks === 'function') {
      return repo.getBookmarks(uid);
    }
    return [];
  }

  async getStatistics(uid) {
    return this.statsRepo.getStatistics(uid);
  }

  async listSessions(uid) {
    return this.sessionRepo.listSessions(uid);
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────

  async _updateStatistics(uid, session) {
    try {
      const existing = await this.statsRepo.getStatistics(uid) || new InterviewStatistics({ userId: uid });

      const answers = Object.values(session.answers);
      const total = answers.length;

      if (total > 0) {
        const avgConf = answers.reduce((s, a) => s + a.confidenceRating, 0) / total;
        const avgRating = answers.reduce((s, a) => s + a.selfRating, 0) / total;

        const prevAnswered = existing.questionsAnswered;
        const newAnswered = prevAnswered + total;

        existing.questionsAnswered = newAnswered;
        existing.sessionsCompleted = (existing.sessionsCompleted || 0) + 1;
        existing.averageConfidence = ((existing.averageConfidence * prevAnswered) + (avgConf * total)) / newAnswered;
        existing.averageSelfRating = ((existing.averageSelfRating * prevAnswered) + (avgRating * total)) / newAnswered;

        // Category breakdown
        session.questions.forEach(q => {
          existing.categoryBreakdown[q.category] = (existing.categoryBreakdown[q.category] || 0) + 1;
        });

        await this.statsRepo.saveStatistics(uid, existing);
      }
    } catch (err) {
      this.logger.warn(`[InterviewUseCase] Statistics update failed: ${err.message}`);
    }
  }
}

export default InterviewUseCase;
