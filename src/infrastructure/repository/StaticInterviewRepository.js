import { IInterviewRepository } from '../../domain/repository/IInterviewRepository';

/**
 * StaticInterviewRepository
 * Reads from the pre-compiled question-index.json generated at build time.
 * Provides filtering by category and by company.
 */
export class StaticInterviewRepository extends IInterviewRepository {
  constructor() {
    super();
    this._cache = null;
  }

  async _load() {
    if (this._cache) return this._cache;
    try {
      const res = await fetch('/generated/question-index.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this._cache = Array.isArray(data) ? data : (data.questions || []);
      return this._cache;
    } catch (err) {
      console.warn('[StaticInterviewRepository] Could not load question-index:', err.message);
      this._cache = [];
      return [];
    }
  }

  async getQuestions() {
    return this._load();
  }

  async getQuestion(id) {
    const all = await this._load();
    return all.find(q => q.id === id) || null;
  }

  async getQuestionsByCategory(category) {
    const all = await this._load();
    return all.filter(q => q.category === category);
  }

  async getQuestionsByCompany(companyId) {
    const all = await this._load();
    return all.filter(q =>
      (q.companyIds || []).includes(companyId) ||
      (q.companyId && q.companyId === companyId)
    );
  }

  async searchQuestions(keyword) {
    const all = await this._load();
    const kw = keyword.toLowerCase();
    return all.filter(q =>
      q.question.toLowerCase().includes(kw) ||
      (q.tags || []).some(t => t.toLowerCase().includes(kw))
    );
  }
}

export default StaticInterviewRepository;
