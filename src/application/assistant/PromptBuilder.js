export class PromptBuilder {
  constructor() {
    this._templates = null;
  }

  async _loadTemplates() {
    if (!this._templates) {
      this._templates = await fetch('/src/shared/generated/prompt-templates.json')
        .then(r => r.json())
        .catch(() => ({}));
    }
  }

  async buildPrompt(templateKey, query, context, history = []) {
    await this._loadTemplates();
    const template = this._templates[templateKey] || this._templates.system || '{{context}}\n\nQuery: {{query}}';

    const contextStr = this._serializeContext(context);
    
    let prompt = template
      .replace('{{context}}', contextStr)
      .replace('{{query}}', query);

    // Limit history length to fit context limits (compress history)
    const compressedHistory = this._compressHistory(history, 5); // Take last 5 messages
    return {
      prompt,
      history: compressedHistory
    };
  }

  _serializeContext(context) {
    if (!context) return 'No context available.';
    const parts = [];

    if (context.currentTopic) {
      parts.push(`Current Topic: ${context.currentTopic.title} (${context.currentTopic.id})`);
    }
    if (context.activeProblem) {
      parts.push(`Active Coding Practice Problem: ${context.activeProblem.title} (Difficulty: ${context.activeProblem.difficulty})`);
    }
    if (context.learningProgress) {
      const lp = context.learningProgress;
      parts.push(`Progress: Completed ${lp.completedTopicsCount} topics, In-progress ${lp.startedTopicsCount} topics.`);
      if (lp.weakTopics?.length > 0) {
        parts.push(`Weak Areas: ${lp.weakTopics.map(w => `${w.topicId} (score: ${w.score})`).join(', ')}`);
      }
    }
    if (context.revisionQueueLength > 0) {
      parts.push(`Spaced Repetition: ${context.revisionQueueLength} cards pending review.`);
    }
    if (context.lastCompilerRun) {
      const cr = context.lastCompilerRun;
      parts.push(`Last Compile Attempt: Problem ${cr.problemId} | Verdict: ${cr.verdict} | Error: ${cr.error || 'None'}`);
    }
    if (context.lastInterviewSession) {
      const is = context.lastInterviewSession;
      parts.push(`Last Mock Interview: Track ${is.trackName} | Status: ${is.status} | Answered ${is.answeredCount} questions`);
    }

    return parts.join('\n');
  }

  _compressHistory(history, limitCount = 5) {
    if (!history) return [];
    // Slice last N messages and keep simple sender/text payload
    return history.slice(-limitCount).map(h => ({
      sender: h.sender,
      text: h.text
    }));
  }
}

export default PromptBuilder;
