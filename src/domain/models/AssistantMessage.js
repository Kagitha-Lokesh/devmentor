export class AssistantMessage {
  constructor({
    id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    sender = 'user', // 'user' | 'assistant'
    text = '',
    timestamp = new Date()
  } = {}) {
    this.id = id;
    this.sender = sender;
    this.text = text;
    this.timestamp = timestamp instanceof Date ? timestamp : new Date(timestamp);
  }
}

export default AssistantMessage;
