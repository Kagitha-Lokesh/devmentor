export class InterviewSession {
  constructor({
    id,
    userId,
    trackId = 'general',  // 'general' | companyId (e.g. 'amazon') | round category (e.g. 'Behavioral')
    trackName = 'General Preparation',
    scoringProfile = 'campus', // 'campus' | 'experienced'
    questions = [],       // array of InterviewQuestion
    answers = {},         // map of questionId -> InterviewAnswer
    status = 'Started',   // 'Started' | 'Paused' | 'Completed'
    startedAt = new Date(),
    completedAt = null,
    duration = 0          // total accumulated seconds
  }) {
    if (!userId) throw new Error('InterviewSession requires a userId.');

    this.id = id || `int_sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.userId = userId;
    this.trackId = trackId;
    this.trackName = trackName;
    this.scoringProfile = scoringProfile;
    this.questions = questions;
    this.answers = answers;
    this.status = status;
    this.startedAt = startedAt instanceof Date ? startedAt : new Date(startedAt);
    this.completedAt = completedAt ? (completedAt instanceof Date ? completedAt : new Date(completedAt)) : null;
    this.duration = duration;
  }
}

export default InterviewSession;
