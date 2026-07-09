import { IAssistantProvider } from '../../domain/repository/IAssistantProvider';

export class OllamaAssistantProvider extends IAssistantProvider {
  async checkHealth(options = {}) {
    const endpoint = options.endpointUrl || 'http://localhost:11434';
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 2000); // 2 second timeout

      const res = await fetch(`${endpoint}/api/tags`, { signal: controller.signal });
      clearTimeout(id);
      return res.ok;
    } catch {
      return false;
    }
  }

  async generateResponse(prompt, history, options = {}) {
    const endpoint = options.endpointUrl || 'http://localhost:11434';
    const model = options.modelName || 'llama3';

    // Map history to Ollama chat roles
    const messages = history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));

    // Add structured prompt containing current context as the final instruction
    messages.push({
      role: 'user',
      content: prompt
    });

    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 15000); // 15 second timeout for local inference

      const res = await fetch(`${endpoint}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model,
          messages: messages,
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(id);

      if (!res.ok) {
        throw new Error(`Ollama response error: ${res.statusText}`);
      }

      const data = await res.json();
      return data.message?.content || 'Error: Empty response from local Ollama model.';
    } catch (err) {
      console.warn('[OllamaAssistantProvider] Connection failed:', err.message);
      throw new Error(`Failed to query Ollama model. Ensure Ollama is running locally (endpoint: ${endpoint}) and model "${model}" is downloaded.`);
    }
  }
}

export default OllamaAssistantProvider;
