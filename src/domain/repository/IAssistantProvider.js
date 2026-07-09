/**
 * Interface contract for AI / Model Inference Providers.
 * Implemented by RuleBasedAssistantProvider and OllamaAssistantProvider.
 */
export class IAssistantProvider {
  /**
   * Generates a text response from the model provider.
   * @param {string} prompt - Structured prompt built by PromptBuilder.
   * @param {Array<object>} history - Serialized message history.
   * @param {object} options - Execution configs (modelName, endpointUrl, etc.)
   * @returns {Promise<string>} The generated text response.
   */
  async generateResponse(prompt, history, options = {}) {
    throw new Error('Not implemented.');
  }

  /**
   * Checks the health and availability of this provider.
   * Useful for Ollama connection testing.
   * @param {object} options
   * @returns {Promise<boolean>} True if online, else false.
   */
  async checkHealth(options = {}) {
    throw new Error('Not implemented.');
  }
}

export default IAssistantProvider;
