export class ISearchRepository {
  async search(queryText, filters) {
    throw new Error('Not implemented.');
  }

  async getSuggestions(text) {
    throw new Error('Not implemented.');
  }

  async getRecentSearches(uid) {
    throw new Error('Not implemented.');
  }

  async addRecentSearch(uid, text) {
    throw new Error('Not implemented.');
  }

  async clearRecentSearches(uid) {
    throw new Error('Not implemented.');
  }
}
export default ISearchRepository;
