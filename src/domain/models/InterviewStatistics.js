export class InterviewStatistics {
  constructor({
    userId,
    sessionsCompleted = 0,
    questionsAnswered = 0,
    averageConfidence = 0.0,
    averageSelfRating = 0.0,
    categoryBreakdown = {}, // { Technical: count, Behavioral: count, ... }
    companyReadiness = {}   // { amazon: percentage, google: percentage, ... }
  }) {
    if (!userId) throw new Error('InterviewStatistics requires a userId.');

    this.userId = userId;
    this.sessionsCompleted = sessionsCompleted;
    this.questionsAnswered = questionsAnswered;
    this.averageConfidence = averageConfidence;
    this.averageSelfRating = averageSelfRating;
    this.categoryBreakdown = categoryBreakdown || {
      Technical: 0,
      Behavioral: 0,
      SystemDesign: 0,
      HR: 0
    };
    this.companyReadiness = companyReadiness || {};
  }
}

export default InterviewStatistics;
