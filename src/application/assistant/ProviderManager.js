import { container } from '../../infrastructure/di/container';

export class ProviderManager {
  constructor() {
    // Dependencies are resolved dynamically at runtime to break circular import cycles
  }

  /**
   * Resolves the active inference provider based on preferences and health tests.
   * If Ollama fails health ping check, falls back to RuleBased.
   * @param {object} preferences - AssistantPreferences entity
   * @returns {Promise<{ provider: IAssistantProvider, activeName: string, isFallback: boolean }>}
   */
  async resolveProvider(preferences) {
    const ruleBasedProvider = container.resolve('RuleBasedAssistantProvider');
    const ollamaProvider = container.resolve('OllamaAssistantProvider');
    const logger = container.resolve('ILogger');

    if (preferences.activeProvider === 'ollama') {
      const isOllamaHealthy = await ollamaProvider.checkHealth({
        endpointUrl: preferences.endpointUrl
      });

      if (isOllamaHealthy) {
        return {
          provider: ollamaProvider,
          activeName: 'Ollama (Local LLM)',
          isFallback: false
        };
      } else {
        logger.warn('[ProviderManager] Ollama is selected but unreachable. Falling back to Rule-Based Assistant.');
        return {
          provider: ruleBasedProvider,
          activeName: 'Rule-Based Assistant (Fallback: Ollama Unreachable)',
          isFallback: true
        };
      }
    }

    // Default to Rule-Based
    return {
      provider: ruleBasedProvider,
      activeName: 'Rule-Based Assistant',
      isFallback: false
    };
  }
}

export default ProviderManager;
