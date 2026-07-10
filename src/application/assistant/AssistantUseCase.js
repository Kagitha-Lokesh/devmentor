import { eventBus } from '../../shared/events/EventBus';
import { AssistantConversation } from '../../domain/models/AssistantConversation';
import { AssistantMessage } from '../../domain/models/AssistantMessage';
import { ContextEngine } from './ContextEngine';
import { PromptBuilder } from './PromptBuilder';
import { ProviderManager } from './ProviderManager';
import { Agent } from './Agent';

export class AssistantUseCase {
  constructor({ prefRepo, convRepo, analytics, logger } = {}) {
    this.prefRepo = prefRepo;
    this.convRepo = convRepo;
    this.analytics = analytics;
    this.logger = logger;

    // Engine Instances are initialized lazily to resolve circular dependency cycles
    this.contextEngine = null;
    this.promptBuilder = null;
    this.providerManager = null;
    this.agent = null;
  }

  // ─── Preferences ─────────────────────────────────────────────────────────
  async getPreferences(uid) {
    return this.prefRepo.getPreferences(uid);
  }

  async savePreferences(uid, preferences) {
    this.logger.info(`[AssistantUseCase] Saving preferences for: ${uid}`);
    await this.prefRepo.savePreferences(uid, preferences);
    eventBus.publish('ASSISTANT_PREFS_CHANGED', { uid, preferences });
  }

  // ─── Conversations ───────────────────────────────────────────────────────
  async listConversations(uid) {
    return this.convRepo.listConversations(uid);
  }

  async getConversation(uid, conversationId) {
    return this.convRepo.getConversation(uid, conversationId);
  }

  async deleteConversation(uid, conversationId) {
    this.logger.info(`[AssistantUseCase] Deleting conversation: ${conversationId}`);
    await this.convRepo.deleteConversation(uid, conversationId);
  }

  async togglePin(uid, conversationId) {
    return this.convRepo.togglePin(uid, conversationId);
  }

  async getDraft(uid, topicId) {
    return this.convRepo.getConversationDraft(uid, topicId);
  }

  async saveDraft(uid, topicId, text) {
    await this.convRepo.saveConversationDraft(uid, topicId, text);
  }

  // ─── Core Response Generation ───────────────────────────────────────────
  /**
   * Processes a user chat message, applies deterministic rules or routes to LLM providers.
   * Handles history compression and saves the thread details.
   */
  async sendMessage(uid, conversationId, messageText, activeContext = {}) {
    this.logger.info(`[AssistantUseCase] sendMessage in: ${conversationId}`);

    // Lazy load engine instances to prevent circular import execution crashes
    if (!this.contextEngine) {
      this.contextEngine = new ContextEngine();
      this.promptBuilder = new PromptBuilder();
      this.providerManager = new ProviderManager();
      this.agent = new Agent();
    }

    // 1. Load or initialize conversation
    let conv = await this.convRepo.getConversation(uid, conversationId);
    if (!conv) {
      conv = new AssistantConversation({
        id: conversationId,
        title: messageText.slice(0, 30) + (messageText.length > 30 ? '...' : ''),
        type: activeContext.type || 'General',
        messages: [],
        lastActiveAt: new Date()
      });
    }

    // 2. Append user's message
    const userMsg = new AssistantMessage({
      sender: 'user',
      text: messageText,
      timestamp: new Date()
    });
    conv.messages.push(userMsg);
    conv.lastActiveAt = new Date();

    // 3. Compile context details
    const contextSnapshot = await this.contextEngine.buildContext(uid, activeContext);

    // 4. Try deterministic Agent Skills first (100% Free / Offline)
    const agentResult = await this.agent.processQuery(messageText, contextSnapshot);
    
    let assistantResponseText = '';
    let usedTool = 'none';
    let isFallback = false;

    if (agentResult.handled) {
      assistantResponseText = agentResult.response;
      usedTool = agentResult.toolUsed;
      this.logger.info(`[AssistantUseCase] Handled deterministically via agent tool: ${usedTool}`);
    } else {
      // 5. Fallback to active LLM Provider
      const prefs = await this.prefRepo.getPreferences(uid);
      const { provider, activeName, isFallback: fallbackTriggered } = await this.providerManager.resolveProvider(prefs);
      isFallback = fallbackTriggered;

      try {
        const { prompt, history } = await this.promptBuilder.buildPrompt('system', messageText, contextSnapshot, conv.messages);
        
        assistantResponseText = await provider.generateResponse(prompt, history, {
          endpointUrl: prefs.endpointUrl,
          modelName: prefs.modelName,
          context: contextSnapshot
        });
        usedTool = 'llmInference';
      } catch (err) {
        this.logger.error(`[AssistantUseCase] Provider error: ${err.message}`);
        assistantResponseText = `### Error Querying Provider\n\nI was unable to retrieve a response from **${activeName}**:\n_${err.message}_\n\n*Switching workspace to Rule-Based offline assistant is recommended.*`;
        usedTool = 'providerError';
      }
    }

    // 6. Append assistant's response
    const assistantMsg = new AssistantMessage({
      sender: 'assistant',
      text: assistantResponseText,
      timestamp: new Date()
    });
    conv.messages.push(assistantMsg);

    // 7. Save conversation to repository
    await this.convRepo.saveConversation(uid, conv);

    // 8. Track metrics
    try {
      await this.analytics.logEvent('Assistant_Opened', { uid });
      await this.analytics.logEvent('Conversation_Started', { uid, conversationId, tool: usedTool, isFallback });
    } catch {}

    return conv;
  }
}

export default AssistantUseCase;
