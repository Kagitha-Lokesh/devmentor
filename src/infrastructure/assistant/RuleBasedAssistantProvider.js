import { IAssistantProvider } from '../../domain/repository/IAssistantProvider';

export class RuleBasedAssistantProvider extends IAssistantProvider {
  async checkHealth(options = {}) {
    return true; // Always healthy and available offline
  }

  async generateResponse(prompt, history, options = {}) {
    // The query is passed down or we extract it from the prompt structure.
    // In our pipeline, the last message in history or the query is what the user asked.
    const lastMsg = history[history.length - 1]?.text || '';
    const query = lastMsg.trim().toLowerCase();

    // ─── Command/Intent Routing ─────────────────────────────────────────────
    if (query === 'help') {
      return this._getHelpResponse();
    }

    if (query.includes('next') || query.includes('recommend') || query.includes('suggest')) {
      return this._getRecommendationResponse(options.context);
    }

    if (query.includes('hint') || query.includes('clue')) {
      return this._getHintResponse(options.context);
    }

    if (query.includes('error') || query.includes('exception') || query.includes('fail')) {
      return this._getCompilerErrorResponse(options.context);
    }

    // Default to search in knowledge base
    return this._getExplanationResponse(query, options.context);
  }

  // ─── Response Generators ─────────────────────────────────────────────────

  _getHelpResponse() {
    return `### DevMentor AI Assistant Capabilities (Rule-Based Mode)

I am running in **100% offline, rule-based mode**. Here is what I can help you with deterministically:

1. **Concept Explanations**: Ask me to *"Explain variables"* or *"What is JVM?"*. I will search the curriculum index and fetch the detailed cheatsheets or lesson notes directly.
2. **Next Lesson Recommendations**: Ask *"What should I do next?"* or *"Recommend next"* to evaluate your weak topics, prerequisites, and revision queue.
3. **Coding Hints**: Ask *"Give me a hint"* to reveal the next step of the active coding problem you are solving.
4. **Error Guidance**: Ask *"Explain error"* or paste a compiler trace. I will help diagnose typical JVM or syntax errors.
5. **Curriculum Navigation**: Ask *"Search loops"* or *"Find arrays"* to quickly get links to relevant lessons.`;
  }

  async _getRecommendationResponse(context) {
    if (!context) return `I couldn't load your learning profile context. Please open a course topic or start practice to calibrate recommendations.`;

    const recs = context.recommendations || [];
    if (recs.length === 0) {
      return `### Learning Recommendations
You are fully on track! There are no immediate prerequisites pending. 
- Try continuing your current course topic: **${context.currentTopic?.title || 'Java Fundamentals'}**.
- Review your revision queue if you have upcoming card reviews.`;
    }

    let out = `### Personalized Study Recommendation\n\n`;
    recs.forEach((rec, idx) => {
      out += `${idx + 1}. **${rec.title || rec.topicId}** (${rec.type})\n`;
      if (rec.description) out += `   *${rec.description}*\n`;
      if (rec.reason) out += `   Reason: _${rec.reason}_\n`;
    });
    return out;
  }

  async _getHintResponse(context) {
    const probId = context?.activeProblem?.id || context?.currentTopic?.id;
    if (!probId) {
      return `There is no active coding problem or lesson open. Please navigate to a practice workspace to request coding hints.`;
    }

    try {
      const hintIdx = await fetch('/generated/hint-index.json').then(r => r.json());
      const hints = hintIdx[probId];
      if (!hints || hints.length === 0) {
        return `No predefined hints were found for the problem ID: **${probId}**. Try checking the problem description or writing test assertions.`;
      }

      let out = `### Coding Hints for ${context?.activeProblem?.title || probId}\n\n`;
      hints.forEach((h) => {
        out += `- **Hint ${h.id}**: ${h.hint}\n`;
      });
      return out;
    } catch {
      return `Failed to fetch hints index. Ensure you are running in the correct project workspace.`;
    }
  }

  _getCompilerErrorResponse(context) {
    const lastError = context?.lastCompilerRun?.error || context?.lastCompilerRun?.verdict;
    if (!lastError) {
      return `### Error Debugging Coach
No recent compiler run error was detected in your active workspace context. 
If you have a compilation error, try running your code first, or paste the error here (e.g. "NullPointerException").`;
    }

    let out = `### Compiler Diagnostics Guide\n\n`;
    out += `**Latest Verdict**: \`${context.lastCompilerRun.verdict || 'FAIL'}\`\n`;
    if (context.lastCompilerRun.output) {
      out += `**Output Log**:\n\`\`\`text\n${context.lastCompilerRun.output}\n\`\`\`\n`;
    }

    // Basic rule matching for typical errors
    const errText = String(lastError + ' ' + (context.lastCompilerRun.output || '')).toLowerCase();
    if (errText.includes('nullpointerexception') || errText.includes('null')) {
      out += `\n**Advice**: You encountered a \`NullPointerException\`. This happens when you try to dereference a variable that is \`null\`.
- Check if you forgot to initialize an object (e.g., \`MyClass obj = new MyClass();\`).
- Put a null check before calling methods: \`if (obj != null) { obj.doWork(); }\`.`;
    } else if (errText.includes('arrayindexoutofboundsexception') || errText.includes('bounds')) {
      out += `\n**Advice**: You hit an index out-of-bounds error. 
- In Java, arrays are 0-indexed. The last valid index is \`array.length - 1\`.
- Check loop boundaries: use \`i < array.length\` instead of \`i <= array.length\`.`;
    } else if (errText.includes('cannot find symbol')) {
      out += `\n**Advice**: Compiler cannot find variable/class symbol.
- Double-check variable spelling and casing.
- Ensure the symbol is declared in the current scope or imported correctly.`;
    } else {
      out += `\n**Advice**: Check syntax brackets alignment, semicolons presence, and types compatibility in your code.`;
    }
    return out;
  }

  async _getExplanationResponse(query, context) {
    try {
      const kwIndex = await fetch('/generated/knowledge-index.json').then(r => r.json());
      
      // Match keyword or title
      const terms = query.split(' ');
      const match = kwIndex.find(item => 
        terms.some(t => item.slug.includes(t) || item.title.toLowerCase().includes(t) || item.keywords.some(k => k.includes(t)))
      );

      if (!match) {
        // Fallback search
        return `### Search Concept: "${query}"
I couldn't find an exact curriculum match for your query. 
Try searching for topics like:
- **variables**
- **data types**
- **loops** (for, while)
- **classes and objects**`;
      }

      // Fetch Cheatsheet and Lesson path
      const lessonUrl = `/content/${match.paths.lesson}`;
      const csUrl = `/content/${match.paths.cheatsheet}`;

      const [lessonText, csText] = await Promise.all([
        fetch(lessonUrl).then(r => r.text()).catch(() => ''),
        fetch(csUrl).then(r => r.text()).catch(() => '')
      ]);

      let body = `### Concept explanation: ${match.title}\n\n`;
      if (csText) {
        body += `#### Cheat Sheet Summary\n${csText.slice(0, 1000)}\n\n`;
      }
      if (lessonText) {
        body += `#### Lesson Excerpt\n${lessonText.slice(0, 1500)}...\n\n`;
        body += `[Open Full Lesson](/courses/java/topics/${match.slug})`;
      }

      return body;
    } catch (err) {
      return `### Search Error
An error occurred while scanning the local knowledge registry. Try checking your network connection or reload the assistant workspace.`;
    }
  }
}

export default RuleBasedAssistantProvider;
