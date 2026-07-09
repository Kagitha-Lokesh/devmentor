export class InterviewAnswer {
  constructor({
    questionId,
    userResponse = '',
    selfRating = 3,       // scale 1-5
    confidenceRating = 3, // scale 1-5
    checkedPoints = [],   // key points checklisted
    completionPercentage = 0,
    hintUsed = false,
    duration = 0          // seconds
  }) {
    if (!questionId) throw new Error('InterviewAnswer requires a questionId.');

    this.questionId = questionId;
    this.userResponse = userResponse;
    this.selfRating = selfRating;
    this.confidenceRating = confidenceRating;
    this.checkedPoints = checkedPoints;
    this.completionPercentage = completionPercentage;
    this.hintUsed = hintUsed;
    this.duration = duration;
  }
}

export default InterviewAnswer;
