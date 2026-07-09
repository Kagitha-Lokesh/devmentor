export class TimelineEvent {
  constructor({
    id,
    userId,
    type, // 'lesson_completed' | 'problem_solved' | 'revision_finished' | 'interview_completed' | 'project_milestone' | 'resume_generated' | 'portfolio_updated'
    title,
    description,
    metadata = {},
    timestamp = new Date()
  }) {
    this.id = id || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    this.userId = userId;
    this.type = type;
    this.title = title;
    this.description = description;
    this.metadata = metadata;
    this.timestamp = timestamp instanceof Date ? timestamp : new Date(timestamp);
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      title: this.title,
      description: this.description,
      metadata: this.metadata,
      timestamp: this.timestamp.toISOString()
    };
  }
}
export default TimelineEvent;
