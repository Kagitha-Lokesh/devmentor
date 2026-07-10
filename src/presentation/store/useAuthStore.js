import { create } from 'zustand';
import { AuthUseCase } from '../../application/auth/AuthUseCase';
import { useUserStore } from './useUserStore';
import { syncQueue } from '../../shared/utils/syncQueue';
import { GlobalStateResetService } from '../../application/auth/GlobalStateResetService';
import { authSyncManager } from '../../shared/utils/AuthSyncManager';

const authUseCase = new AuthUseCase();

export const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: true,
  error: null,

  setUser: (user) => set({ user, isLoading: false, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),

  init: () => {
    set({ isLoading: true });
    // Initialize cross-tab sync context
    authSyncManager.initialize();

    return authUseCase.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        try {
          syncQueue.setUid(authUser.uid);
          // Fetch student profile subdocuments
          await useUserStore.getState().fetchUserProfile(authUser.uid, authUser.email, authUser.displayName);
          set({ user: authUser, isLoading: false, error: null });
        } catch {
          // Allow authentication to succeed even if profile fetching fails temporarily
          set({ user: authUser, isLoading: false, error: null });
        }
      } else {
        const currentUser = get().user;
        if (currentUser) {
          await GlobalStateResetService.resetAll(currentUser.uid);
        } else {
          useUserStore.getState().clearProfile();
        }
        set({ user: null, isLoading: false, error: null });
      }
    });
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    const result = await authUseCase.signIn(email, password);

    if (result.isSuccess) {
      set({ user: result.data, isLoading: false });
      authSyncManager.broadcast('LOGIN');
      return result.data;
    } else {
      set({ error: result.error.message, isLoading: false });
      throw result.error;
    }
  },

  signUp: async (email, password) => {
    set({ isLoading: true, error: null });
    const result = await authUseCase.signUp(email, password);

    if (result.isSuccess) {
      set({ user: result.data, isLoading: false });
      authSyncManager.broadcast('LOGIN');
      return result.data;
    } else {
      set({ error: result.error.message, isLoading: false });
      throw result.error;
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    const result = await authUseCase.signInWithGoogle();

    if (result.isSuccess) {
      set({ user: result.data, isLoading: false });
      authSyncManager.broadcast('LOGIN');
      return result.data;
    } else {
      set({ error: result.error.message, isLoading: false });
      throw result.error;
    }
  },

  signInWithGithub: async () => {
    set({ isLoading: true, error: null });
    const result = await authUseCase.signInWithGithub();

    if (result.isSuccess) {
      set({ user: result.data, isLoading: false });
      authSyncManager.broadcast('LOGIN');
      return result.data;
    } else {
      set({ error: result.error.message, isLoading: false });
      throw result.error;
    }
  },

  signOut: async () => {
    const currentUser = get().user;
    set({ isLoading: true, error: null });
    const result = await authUseCase.signOut();

    if (result.isSuccess) {
      if (currentUser) {
        await GlobalStateResetService.resetAll(currentUser.uid);
      } else {
        useUserStore.getState().clearProfile();
      }
      set({ user: null, isLoading: false });
      authSyncManager.broadcast('LOGOUT');
    } else {
      set({ error: result.error.message, isLoading: false });
      throw result.error;
    }
  },

  sendPasswordReset: async (email) => {
    const result = await authUseCase.sendPasswordReset(email);
    if (!result.isSuccess) {
      throw result.error;
    }
  },

  sendVerificationEmail: async () => {
    const result = await authUseCase.sendVerificationEmail();
    if (!result.isSuccess) {
      throw result.error;
    }
  },

  clearError: () => set({ error: null })
}));
