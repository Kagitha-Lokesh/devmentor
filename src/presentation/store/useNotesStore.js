import { create } from 'zustand';
import { container } from '../../infrastructure/di/container';

export const useNotesStore = create((set, get) => ({
  notes: [],
  highlights: {},
  isLoading: false,

  loadNotes: async (uid) => {
    set({ isLoading: true });
    const useCase = container.resolve('NotesUseCase');
    const notes = await useCase.listNotes(uid);
    set({ notes, isLoading: false });
  },

  createNote: async (uid, data) => {
    const useCase = container.resolve('NotesUseCase');
    const note = await useCase.createNote(uid, data);
    set(state => ({ notes: [note, ...state.notes] }));
    return note;
  },

  updateNote: async (uid, noteId, changes) => {
    const useCase = container.resolve('NotesUseCase');
    const updated = await useCase.updateNote(uid, noteId, changes);
    set(state => ({ notes: state.notes.map(n => n.id === noteId ? updated : n) }));
    return updated;
  },

  deleteNote: async (uid, noteId) => {
    const useCase = container.resolve('NotesUseCase');
    await useCase.deleteNote(uid, noteId);
    set(state => ({ notes: state.notes.filter(n => n.id !== noteId) }));
  },

  addHighlight: async (uid, highlightData) => {
    const useCase = container.resolve('NotesUseCase');
    const note = await useCase.addHighlight(uid, highlightData);
    set(state => ({ notes: [note, ...state.notes] }));
    return note;
  },

  loadHighlightsForTarget: async (uid, targetType, targetId) => {
    const useCase = container.resolve('NotesUseCase');
    const highlights = await useCase.getHighlightsForTarget(uid, targetType, targetId);
    const key = `${targetType}:${targetId}`;
    set(state => ({ highlights: { ...state.highlights, [key]: highlights } }));
  },

  reset: () => set({ notes: [], highlights: {}, isLoading: false }),
}));
