import { create } from 'zustand';

export const useUiStore = create((set) => ({
  sidebarOpen: false,
  mobileDrawerOpen: false,
  activeModal: null, // null | 'install_prompt' | 'settings' | 'error_boundary'
  requestState: 'idle', // 'idle' | 'loading' | 'success' | 'empty' | 'error' | 'refreshing'
  globalError: null,

  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setMobileDrawerOpen: (mobileDrawerOpen) => set({ mobileDrawerOpen }),
  toggleMobileDrawer: () => set((state) => ({ mobileDrawerOpen: !state.mobileDrawerOpen })),

  setActiveModal: (activeModal) => set({ activeModal }),
  setRequestState: (requestState) => set({ requestState }),
  
  setGlobalError: (globalError) => set({ globalError, requestState: 'error' }),
  clearGlobalError: () => set({ globalError: null, requestState: 'idle' }),

  resetUi: () => set({
    sidebarOpen: false,
    mobileDrawerOpen: false,
    activeModal: null,
    requestState: 'idle',
    globalError: null
  })
}));
