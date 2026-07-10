export class KnowledgeRetriever {
  constructor() {
    this._kwIndex = null;
    this._hintIndex = null;
  }

  async _loadIndices() {
    if (!this._kwIndex) {
      this._kwIndex = await fetch('/generated/knowledge-index.json')
        .then(r => r.json())
        .catch(() => []);
    }
    if (!this._hintIndex) {
      this._hintIndex = await fetch('/generated/hint-index.json')
        .then(r => r.json())
        .catch(() => ({}));
    }
  }

  async retrieveTopic(queryStr) {
    await this._loadIndices();
    const clean = queryStr.trim().toLowerCase();

    // Match keywords or slug
    const matched = this._kwIndex.find(item => 
      item.slug.includes(clean) ||
      item.title.toLowerCase().includes(clean) ||
      (item.keywords || []).some(k => k.includes(clean))
    );

    if (!matched) return null;

    try {
      const lessonText = await fetch(`/content/${matched.paths.lesson}`).then(r => r.text()).catch(() => '');
      const cheatsheetText = await fetch(`/content/${matched.paths.cheatsheet}`).then(r => r.text()).catch(() => '');
      return {
        id: matched.id,
        title: matched.title,
        description: matched.description,
        lesson: lessonText,
        cheatsheet: cheatsheetText
      };
    } catch {
      return null;
    }
  }

  async retrieveHint(problemId) {
    await this._loadIndices();
    return this._hintIndex[problemId] || [];
  }

  async searchAll(queryStr) {
    await this._loadIndices();
    const clean = queryStr.trim().toLowerCase();
    return this._kwIndex.filter(item => 
      item.slug.includes(clean) ||
      item.title.toLowerCase().includes(clean) ||
      item.tags.some(t => t.toLowerCase().includes(clean))
    );
  }
}

export default KnowledgeRetriever;
