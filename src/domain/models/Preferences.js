export class Preferences {
  constructor({
    codingExperience = 'beginner',
    goal = 'job-ready',
    interests = [],
    updatedAt = new Date().toISOString()
  } = {}) {
    this.codingExperience = codingExperience;
    this.goal = goal;
    this.interests = interests;
    this.updatedAt = updatedAt;
  }

  static fromJSON(json) {
    if (!json) return new Preferences();
    return new Preferences(json);
  }

  toJSON() {
    return {
      codingExperience: this.codingExperience,
      goal: this.goal,
      interests: this.interests,
      updatedAt: this.updatedAt
    };
  }
}
