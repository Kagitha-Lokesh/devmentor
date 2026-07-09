import { container } from '../../infrastructure/di/container';

export class SearchUseCase {
  _getRepo() {
    return container.resolve('ISearchRepository');
  }

  async search(queryText, filters) {
    return this._getRepo().search(queryText, filters);
  }

  async getSuggestions(text) {
    return this._getRepo().getSuggestions(text);
  }

  async getRecentSearches(uid) {
    return this._getRepo().getRecentSearches(uid);
  }

  async addRecentSearch(uid, text) {
    return this._getRepo().addRecentSearch(uid, text);
  }

  async clearRecentSearches(uid) {
    return this._getRepo().clearRecentSearches(uid);
  }
}
export default SearchUseCase;
