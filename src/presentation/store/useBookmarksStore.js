import { create } from 'zustand';
import { container } from '../../infrastructure/di/container';

export const useBookmarksStore = create((set) => ({
  bookmarks: [],
  isLoading: false,

  loadBookmarks: async (uid) => {
    set({ isLoading: true });
    const useCase = container.resolve('BookmarkUseCase');
    const bookmarks = await useCase.listBookmarks(uid);
    set({ bookmarks, isLoading: false });
  },

  addBookmark: async (uid, data) => {
    const useCase = container.resolve('BookmarkUseCase');
    const bookmark = await useCase.addBookmark(uid, data);
    set(state => ({ bookmarks: [bookmark, ...state.bookmarks] }));
    return bookmark;
  },

  removeBookmark: async (uid, bookmarkId) => {
    const useCase = container.resolve('BookmarkUseCase');
    await useCase.removeBookmark(uid, bookmarkId);
    set(state => ({ bookmarks: state.bookmarks.filter(b => b.id !== bookmarkId) }));
  },

  toggleFavorite: async (uid, bookmarkId) => {
    const useCase = container.resolve('BookmarkUseCase');
    const updated = await useCase.toggleFavorite(uid, bookmarkId);
    if (updated) {
      set(state => ({ bookmarks: state.bookmarks.map(b => b.id === bookmarkId ? updated : b) }));
    }
  },

  reset: () => set({ bookmarks: [], isLoading: false }),
}));
