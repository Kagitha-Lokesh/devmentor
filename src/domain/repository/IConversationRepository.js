/**
 * Interface contract for Assistant Conversations history, messages, and drafts management.
 */
export class IConversationRepository {
  async getConversation(uid, conversationId) {
    throw new Error('Not implemented.');
  }

  async saveConversation(uid, conversation) {
    throw new Error('Not implemented.');
  }

  async deleteConversation(uid, conversationId) {
    throw new Error('Not implemented.');
  }

  async listConversations(uid) {
    throw new Error('Not implemented.');
  }

  async togglePin(uid, conversationId) {
    throw new Error('Not implemented.');
  }

  async getConversationDraft(uid, topicId) {
    throw new Error('Not implemented.');
  }

  async saveConversationDraft(uid, topicId, text) {
    throw new Error('Not implemented.');
  }
}

export default IConversationRepository;
