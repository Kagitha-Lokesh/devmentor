import { create } from 'zustand';
import { container } from '../../infrastructure/di/container';

export const useSearchStore = create((set, get) => ({
  results: [],
  suggestions: [],
  recentSearches: [],
  isSearching: false,
  activeFilters: {},

  search: async (queryText, filters = {}) => {
    set({ isSearching: true, activeFilters: filters });
    try {
      const useCase = container.resolve('SearchUseCase');
      const results = await useCase.search(queryText, filters);
      set({ results, isSearching: false });
    } catch {
      set({ results: [], isSearching: false });
    }
  },

  getSuggestions: async (text) => {
    try {
      const useCase = container.resolve('SearchUseCase');
      const suggestions = await useCase.getSuggestions(text);
      set({ suggestions });
    } catch {
      set({ suggestions: [] });
    }
  },

  loadRecentSearches: async (uid) => {
    const useCase = container.resolve('SearchUseCase');
    const recentSearches = await useCase.getRecentSearches(uid);
    set({ recentSearches });
  },

  addRecentSearch: async (uid, text) => {
    const useCase = container.resolve('SearchUseCase');
    await useCase.addRecentSearch(uid, text);
    await get().loadRecentSearches(uid);
  },

  clearRecentSearches: async (uid) => {
    const useCase = container.resolve('SearchUseCase');
    await useCase.clearRecentSearches(uid);
    set({ recentSearches: [] });
  },

  clearResults: () => set({ results: [], suggestions: [] }),
}));
