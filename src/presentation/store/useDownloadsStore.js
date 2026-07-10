import { create } from 'zustand';
import { container } from '../../infrastructure/di/container';

export const useDownloadsStore = create((set) => ({
  assets: [],
  downloadedAssets: [],
  isLoading: false,

  loadAssets: async (uid) => {
    set({ isLoading: true });
    const useCase = container.resolve('DownloadUseCase');
    const [assets, downloadedAssets] = await Promise.all([
      useCase.getAvailableAssets(),
      useCase.getDownloadedAssets(uid)
    ]);
    set({ assets, downloadedAssets, isLoading: false });
  },

  downloadAsset: async (uid, asset) => {
    const useCase = container.resolve('DownloadUseCase');
    await useCase.downloadAsset(uid, asset);
    set(state => ({
      downloadedAssets: state.downloadedAssets.some(a => a.id === asset.id)
        ? state.downloadedAssets
        : [{ ...asset, downloadedAt: new Date() }, ...state.downloadedAssets]
    }));
  },

  reset: () => set({ assets: [], downloadedAssets: [], isLoading: false }),
}));
