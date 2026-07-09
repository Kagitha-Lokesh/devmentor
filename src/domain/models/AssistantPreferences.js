export class AssistantPreferences {
  constructor({
    userId = 'anonymous',
    activeProvider = 'rule-based', // 'rule-based' | 'ollama' | 'custom'
    endpointUrl = 'http://localhost:11434',
    modelName = 'llama3',
    contextLimit = 4096,
    experimentalFeatures = false
  } = {}) {
    this.userId = userId;
    this.activeProvider = activeProvider;
    this.endpointUrl = endpointUrl;
    this.modelName = modelName;
    this.contextLimit = Number(contextLimit) || 4096;
    this.experimentalFeatures = !!experimentalFeatures;
  }
}

export default AssistantPreferences;
