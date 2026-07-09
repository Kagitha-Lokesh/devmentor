export class Bookmark {
  constructor({
    id,
    userId,
    targetType, // 'topic' | 'problem' | 'flashcard' | 'interview_question' | 'project' | 'task' | 'roadmap' | 'resume' | 'portfolio' | 'conversation'
    targetId,
    title,
    folder = 'General',
    tags = [],
    isFavorite = false,
    createdAt = new Date()
  }) {
    this.id = id || `bm_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    this.userId = userId;
    this.targetType = targetType;
    this.targetId = targetId;
    this.title = title;
    this.folder = folder;
    this.tags = tags;
    this.isFavorite = isFavorite;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      targetType: this.targetType,
      targetId: this.targetId,
      title: this.title,
      folder: this.folder,
      tags: this.tags,
      isFavorite: this.isFavorite,
      createdAt: this.createdAt.toISOString()
    };
  }
}
export default Bookmark;
