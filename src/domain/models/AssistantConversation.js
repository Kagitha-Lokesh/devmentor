import { AssistantMessage } from './AssistantMessage';

export class AssistantConversation {
  constructor({
    id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title = 'New Conversation',
    type = 'General', // 'Lesson' | 'Compiler' | 'Interview' | 'Revision' | 'Career' | 'General'
    messages = [],
    pinned = false,
    lastActiveAt = new Date(),
    metadata = {}
  } = {}) {
    this.id = id;
    this.title = title;
    this.type = type;
    this.messages = messages.map(m => new AssistantMessage(m));
    this.pinned = !!pinned;
    this.lastActiveAt = lastActiveAt instanceof Date ? lastActiveAt : new Date(lastActiveAt);
    this.metadata = metadata || {};
  }
}

export default AssistantConversation;
