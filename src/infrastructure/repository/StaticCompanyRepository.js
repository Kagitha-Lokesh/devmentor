import { ICompanyRepository } from '../../domain/repository/ICompanyRepository';

/**
 * StaticCompanyRepository
 * Reads from the pre-compiled company-index.json generated at build time.
 * Falls back to an empty array on network/file error.
 */
export class StaticCompanyRepository extends ICompanyRepository {
  constructor() {
    super();
    this._cache = null;
    this._roadmapCache = new Map();
  }

  async getCompanies() {
    if (this._cache) return this._cache;
    try {
      const res = await fetch('/generated/company-index.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this._cache = Array.isArray(data) ? data : (data.companies || []);
      return this._cache;
    } catch (err) {
      console.warn('[StaticCompanyRepository] Could not load company-index:', err.message);
      return [];
    }
  }

  async getCompany(companyId) {
    const list = await this.getCompanies();
    return list.find(c => c.id === companyId) || null;
  }

  async getRoadmap(companyId) {
    if (this._roadmapCache.has(companyId)) return this._roadmapCache.get(companyId);
    try {
      const res = await fetch(`/content/interviews/companies/${companyId}/roadmap.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const steps = data.roadmap || data.steps || data || [];
      this._roadmapCache.set(companyId, steps);
      return steps;
    } catch {
      return [];
    }
  }
}

export default StaticCompanyRepository;
