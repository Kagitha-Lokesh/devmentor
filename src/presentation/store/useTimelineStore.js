import { create } from 'zustand';
import { container } from '../../infrastructure/di/container';

export const useTimelineStore = create((set) => ({
  events: [],
  stats: null,
  isLoading: false,

  loadEvents: async (uid) => {
    set({ isLoading: true });
    const useCase = container.resolve('TimelineUseCase');
    const events = await useCase.getEvents(uid);
    const stats = await useCase.getStatistics(uid);
    set({ events, stats, isLoading: false });
  },

  recordEvent: async (uid, eventData) => {
    const useCase = container.resolve('TimelineUseCase');
    const event = await useCase.recordEvent(uid, eventData);
    set(state => ({ events: [event, ...state.events] }));
    return event;
  },
}));
