export class Mastery {
  constructor({
    topicId,
    score = 0,
    hintsUsed = 0,
    attempts = 0,
    lastUpdated = new Date()
  }) {
    if (!topicId) throw new Error('Mastery record requires a topicId.');

    this.topicId = topicId;
    this.score = score;
    this.hintsUsed = hintsUsed;
    this.attempts = attempts;
    this.lastUpdated = lastUpdated instanceof Date ? lastUpdated : new Date(lastUpdated);
  }
}
export default Mastery;
