export class Achievement {
  constructor({
    id,
    userId,
    title,
    description,
    progress = 0,
    target = 1,
    completionDate = null,
    relatedSkills = [],
    linkedProjects = []
  }) {
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.description = description;
    this.progress = progress;
    this.target = target;
    this.completionDate = completionDate ? (completionDate instanceof Date ? completionDate : new Date(completionDate)) : null;
    this.relatedSkills = relatedSkills;
    this.linkedProjects = linkedProjects;
  }

  get isUnlocked() {
    return this.progress >= this.target;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      title: this.title,
      description: this.description,
      progress: this.progress,
      target: this.target,
      completionDate: this.completionDate ? this.completionDate.toISOString() : null,
      relatedSkills: this.relatedSkills,
      linkedProjects: this.linkedProjects
    };
  }
}
export default Achievement;
