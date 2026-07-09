import { KnowledgeRetriever } from './KnowledgeRetriever';

export class Agent {
  constructor() {
    this.retriever = new KnowledgeRetriever();
  }

  /**
   * Evaluates user query to route to deterministic skills/tools or decide if it requires LLM.
   * @param {string} queryStr - User's chat message
   * @param {object} context - Current learning context snapshot
   * @returns {Promise<{ handled: boolean, response: string, toolUsed: string }>}
   */
  async processQuery(queryStr, context) {
    const clean = queryStr.trim().toLowerCase();

    // ─── 1. Navigation & Search Skill ───────────────────────────────────────
    if (clean.startsWith('search ') || clean.startsWith('find ') || clean.startsWith('go to ')) {
      const kw = clean.replace(/^(search|find|go to)\s+/i, '');
      const results = await this.retriever.searchAll(kw);
      if (results.length > 0) {
        let response = `### Curriculum Search Results\nI found the following lessons matching **"${kw}"**:\n\n`;
        results.slice(0, 5).forEach(res => {
          response += `- [${res.title}](/courses/java/topics/${res.slug}): *${res.description}*\n`;
        });
        return { handled: true, response, toolUsed: 'querySearch' };
      }
    }

    // ─── 2. Coding Problem Hint Skill ──────────────────────────────────────
    if (clean === 'hint' || clean.includes('give me a hint') || clean.includes('help with problem')) {
      const probId = context?.activeProblem?.id;
      if (probId) {
        const hints = await this.retriever.retrieveHint(probId);
        if (hints.length > 0) {
          let response = `### Practice Hints for **${context.activeProblem.title}**:\n\n`;
          hints.forEach(h => {
            response += `- **Hint ${h.id}**: ${h.hint}\n`;
          });
          return { handled: true, response, toolUsed: 'revealHint' };
        }
      }
    }

    // ─── 3. Compiler Diagnostics Skill ──────────────────────────────────────
    if (clean === 'explain error' || clean.includes('compile error') || clean.startsWith('debug ')) {
      const lastRun = context?.lastCompilerRun;
      if (lastRun && (lastRun.error || lastRun.output)) {
        const errorMsg = lastRun.error || lastRun.output;
        const response = this._explainCompilerError(errorMsg, lastRun);
        return { handled: true, response, toolUsed: 'explainCompilerError' };
      }
    }

    // ─── 4. Conceptual Explanation Skill ───────────────────────────────────
    if (clean.startsWith('explain ') || clean.startsWith('what is ') || clean.startsWith('how does ')) {
      const concept = clean.replace(/^(explain|what is|how does)\s+/i, '');
      const topicData = await this.retriever.retrieveTopic(concept);
      if (topicData) {
        let response = `### Explanation: **${topicData.title}**\n\n`;
        if (topicData.cheatsheet) {
          response += `#### Quick Summary / Cheat Sheet\n${topicData.cheatsheet.slice(0, 1200)}\n\n`;
        }
        if (topicData.lesson) {
          response += `#### Lesson Excerpt\n${topicData.lesson.slice(0, 1200)}...\n\n`;
          response += `[Open Full Topic](/courses/java/topics/${topicData.id})`;
        }
        return { handled: true, response, toolUsed: 'explainConcept' };
      }
    }

    // ─── 5. Revision & Stats Checklist Skill ────────────────────────────────
    if (clean.includes('revision') || clean.includes('card') || clean.includes('spaced repetition')) {
      const len = context?.revisionQueueLength || 0;
      let response = `### Spaced Repetition Overview\n`;
      if (len > 0) {
        response += `You currently have **${len} flashcards** waiting for review in your queue.\n`;
        response += `[Start Revision Session](/revision)`;
      } else {
        response += `Your revision queue is clean! All cards are mastered for today. Check back tomorrow.`;
      }
      return { handled: true, response, toolUsed: 'revisionStatus' };
    }

    // Default: Not handled by deterministic tools, delegate to LLM provider
    return { handled: false, response: '', toolUsed: 'none' };
  }

  // ─── Deterministic Tool Logics ───────────────────────────────────────────

  _explainCompilerError(errorMsg, runDetails) {
    let out = `### Compiler Diagnostics Tool\n\n`;
    out += `Latest execution verdict: \`${runDetails.verdict || 'FAIL'}\`\n\n`;
    
    const errText = String(errorMsg).toLowerCase();
    if (errText.includes('nullpointerexception')) {
      out += `**Diagnostic**: A \`NullPointerException\` occurs when dereferencing a reference variable that points to \`null\`.
- Check if you missed calling \`new\` to initialize an object.
- Make sure arrays elements are initialized before indexing.`;
    } else if (errText.includes('outofbounds')) {
      out += `**Diagnostic**: Index Out Of Bounds exception.
- Java is 0-indexed. Ensure boundaries satisfy \`0 <= index < size\`.
- Check loop limits: use \`i < size\` rather than \`i <= size\`.`;
    } else if (errText.includes('cannot find symbol')) {
      out += `**Diagnostic**: Compiler cannot find the symbol name.
- Verify variable spelling, scope boundaries, or imports.`;
    } else {
      out += `**Diagnostic**: Standard compiler parse check fail.
- Check syntax brackets \`{}\`, \`()\`, and missing semicolons \`;\`.`;
    }
    return out;
  }
}

export default Agent;
