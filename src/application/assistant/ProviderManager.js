import { container } from '../../infrastructure/di/container';

export class ProviderManager {
  constructor() {
    this.ruleBasedProvider = container.resolve('RuleBasedAssistantProvider');
    this.ollamaProvider = container.resolve('OllamaAssistantProvider');
    this.logger = container.resolve('ILogger');
  }

  /**
   * Resolves the active inference provider based on preferences and health tests.
   * If Ollama fails health ping check, falls back to RuleBased.
   * @param {object} preferences - AssistantPreferences entity
   * @returns {Promise<{ provider: IAssistantProvider, activeName: string, isFallback: boolean }>}
   */
  async resolveProvider(preferences) {
    if (preferences.activeProvider === 'ollama') {
      const isOllamaHealthy = await this.ollamaProvider.checkHealth({
        endpointUrl: preferences.endpointUrl
      });

      if (isOllamaHealthy) {
        return {
          provider: this.ollamaProvider,
          activeName: 'Ollama (Local LLM)',
          isFallback: false
        };
      } else {
        this.logger.warn('[ProviderManager] Ollama is selected but unreachable. Falling back to Rule-Based Assistant.');
        return {
          provider: this.ruleBasedProvider,
          activeName: 'Rule-Based Assistant (Fallback: Ollama Unreachable)',
          isFallback: true
        };
      }
    }

    // Default to Rule-Based
    return {
      provider: this.ruleBasedProvider,
      activeName: 'Rule-Based Assistant',
      isFallback: false
    };
  }
}

export default ProviderManager;
