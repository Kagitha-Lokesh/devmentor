import { create } from 'zustand';
import { container } from '../../infrastructure/di/container';

export const useExportsStore = create((set) => ({
  exportJobs: [],
  isExporting: false,

  loadHistory: async (uid) => {
    const useCase = container.resolve('ExportUseCase');
    const exportJobs = await useCase.getExportHistory(uid);
    set({ exportJobs });
  },

  exportData: async (uid, { format, progressData, label }) => {
    set({ isExporting: true });
    try {
      const useCase = container.resolve('ExportUseCase');
      const job = await useCase.exportProgress(uid, { format, progressData, label });
      set(state => ({ exportJobs: [job, ...state.exportJobs], isExporting: false }));
      return job;
    } catch (err) {
      set({ isExporting: false });
      throw err;
    }
  },

  reset: () => set({ exportJobs: [], isExporting: false }),
}));
