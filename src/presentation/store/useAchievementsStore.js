import { create } from 'zustand';
import { container } from '../../infrastructure/di/container';

export const useAchievementsStore = create((set) => ({
  achievements: [],
  isLoading: false,

  loadAchievements: async (uid) => {
    set({ isLoading: true });
    const useCase = container.resolve('AchievementUseCase');
    const achievements = await useCase.getAchievementsDashboard(uid);
    set({ achievements, isLoading: false });
  },

  incrementProgress: async (uid, achievementId, amount = 1) => {
    const useCase = container.resolve('AchievementUseCase');
    const updated = await useCase.incrementProgress(uid, achievementId, amount);
    if (updated) {
      set(state => ({ achievements: state.achievements.map(a => a.id === achievementId ? updated : a) }));
    }
    return updated;
  },

  reset: () => set({ achievements: [], isLoading: false }),
}));
