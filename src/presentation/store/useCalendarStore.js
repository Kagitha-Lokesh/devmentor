import { create } from 'zustand';
import { container } from '../../infrastructure/di/container';

export const useCalendarStore = create((set, get) => ({
  tasks: [],
  viewMode: 'week', // 'day' | 'week' | 'month'
  isLoading: false,

  loadTasks: async (uid) => {
    set({ isLoading: true });
    const useCase = container.resolve('CalendarUseCase');
    await useCase.updateOverdueTasks(uid);
    const tasks = await useCase.getTasks(uid);
    set({ tasks, isLoading: false });
  },

  addTask: async (uid, data) => {
    const useCase = container.resolve('CalendarUseCase');
    const task = await useCase.addTask(uid, data);
    set(state => ({ tasks: [...state.tasks, task] }));
    return task;
  },

  completeTask: async (uid, taskId) => {
    const useCase = container.resolve('CalendarUseCase');
    const updated = await useCase.completeTask(uid, taskId);
    if (updated) {
      set(state => ({ tasks: state.tasks.map(t => t.id === taskId ? updated : t) }));
    }
  },

  deleteTask: async (uid, taskId) => {
    const useCase = container.resolve('CalendarUseCase');
    await useCase.deleteTask(uid, taskId);
    set(state => ({ tasks: state.tasks.filter(t => t.id !== taskId) }));
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  reset: () => set({ tasks: [], isLoading: false, viewMode: 'week' }),
}));
