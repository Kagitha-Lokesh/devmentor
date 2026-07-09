export class Note {
  constructor({
    id,
    userId,
    title = 'Untitled Note',
    content = '',
    targetType, // 'lesson' | 'problem' | 'interview' | 'project' | 'career'
    targetId,
    isPinned = false,
    isArchived = false,
    tags = [],
    createdAt = new Date(),
    updatedAt = new Date(),
    isHighlight = false,
    highlightedText = '',
    color = 'yellow' // yellow, green, blue, purple, red
  }) {
    this.id = id || `note_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    this.userId = userId;
    this.title = title;
    this.content = content;
    this.targetType = targetType;
    this.targetId = targetId;
    this.isPinned = isPinned;
    this.isArchived = isArchived;
    this.tags = tags;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    this.updatedAt = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
    this.isHighlight = isHighlight;
    this.highlightedText = highlightedText;
    this.color = color;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      title: this.title,
      content: this.content,
      targetType: this.targetType,
      targetId: this.targetId,
      isPinned: this.isPinned,
      isArchived: this.isArchived,
      tags: this.tags,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      isHighlight: this.isHighlight,
      highlightedText: this.highlightedText,
      color: this.color
    };
  }
}
export default Note;
