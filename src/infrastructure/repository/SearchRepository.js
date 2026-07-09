import Fuse from 'fuse.js';
import searchIndex from '../../shared/generated/global-search-index.json';
import { ISearchRepository } from '../../domain/repository/ISearchRepository';
import { localDB } from '../../shared/utils/indexedDB';

export class SearchRepository extends ISearchRepository {
  constructor() {
    super();
    this.fuse = new Fuse(searchIndex, {
      keys: ['title', 'description', 'technology', 'track', 'tags', 'keywords'],
      threshold: 0.35,
      includeScore: true
    });
  }

  async search(queryText, filters = {}) {
    let results = [];
    if (queryText && queryText.trim()) {
      results = this.fuse.search(queryText).map(res => ({
        ...res.item,
        score: res.score
      }));
    } else {
      results = [...searchIndex];
    }

    if (filters) {
      results = results.filter(item => {
        if (filters.difficulty && item.difficulty !== filters.difficulty) return false;
        if (filters.type && item.type !== filters.type) return false;
        if (filters.track && item.track !== filters.track) return false;
        
        if (filters.technology) {
          const itemTechs = item.technology || [];
          if (!itemTechs.some(t => t.toLowerCase() === filters.technology.toLowerCase())) return false;
        }

        if (filters.estimatedTime) {
          const itemTime = item.estimatedTime || 0;
          if (itemTime > parseInt(filters.estimatedTime)) return false;
        }
        
        return true;
      });
    }

    return results;
  }

  async getSuggestions(text) {
    if (!text) return [];
    const searchRes = this.fuse.search(text);
    return searchRes.slice(0, 5).map(res => res.item.title);
  }

  async getRecentSearches(uid) {
    const key = `recent_searches_${uid}`;
    const cached = await localDB.get('recentSearches', key);
    return Array.isArray(cached) ? cached : [];
  }

  async addRecentSearch(uid, text) {
    if (!text || !text.trim()) return;
    const key = `recent_searches_${uid}`;
    let list = await this.getRecentSearches(uid);
    list = list.filter(item => item !== text);
    list.unshift(text);
    if (list.length > 8) list.pop();
    await localDB.put('recentSearches', key, list);
  }

  async clearRecentSearches(uid) {
    const key = `recent_searches_${uid}`;
    await localDB.delete('recentSearches', key);
  }
}
export default SearchRepository;
