import { create } from 'zustand';
import { UserUseCase } from '../../application/user/UserUseCase';

const userUseCase = new UserUseCase();

export const useUserStore = create((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchUserProfile: async (uid, email = null, displayName = null) => {
    set({ isLoading: true, error: null });
    let result = await userUseCase.getUserProfile(uid);

    if ((result.isEmpty || !result.isSuccess) && email) {
      // Auto-create missing base document for user (self-healing)
      const mockEmail = email;
      const mockDisplayName = displayName || email.split('@')[0];
      const createResult = await userUseCase.createUserProfile({
        uid,
        email: mockEmail,
        displayName: mockDisplayName,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        settings: {},
        progress: {},
        preferences: {}
      });

      if (createResult.isSuccess) {
        result = await userUseCase.getUserProfile(uid);
      } else {
        console.error('[Self-Healing] Failed to create user profile:', createResult.error);
        set({ error: createResult.error?.message || 'Failed to create user profile', isLoading: false });
        throw createResult.error;
      }
    }

    if (result.isSuccess) {
      set({ profile: result.data, isLoading: false });
      return result.data;
    } else if (result.isEmpty) {
      set({ profile: null, isLoading: false });
      return null;
    } else {
      set({ error: result.error?.message || 'Failed to fetch user profile', isLoading: false });
      throw result.error;
    }
  },

  updateUserSettings: async (settingsUpdates) => {
    const profile = get().profile;
    if (!profile) return;

    set({ isLoading: true, error: null });
    // Optimistic update
    const updatedUser = {
      ...profile,
      settings: { ...profile.settings, ...settingsUpdates }
    };
    set({ profile: updatedUser });

    const result = await userUseCase.updateSettings(profile.uid, settingsUpdates);
    set({ isLoading: false });

    if (!result.isSuccess) {
      // Rollback
      set({ profile, error: result.error?.message || 'Failed to update settings' });
      throw result.error;
    }
  },

  updateUserPreferences: async (preferencesUpdates) => {
    const profile = get().profile;
    if (!profile) return;

    set({ isLoading: true, error: null });
    const updatedUser = {
      ...profile,
      preferences: { ...profile.preferences, ...preferencesUpdates }
    };
    set({ profile: updatedUser });

    const result = await userUseCase.updatePreferences(profile.uid, preferencesUpdates);
    set({ isLoading: false });

    if (!result.isSuccess) {
      set({ profile, error: result.error?.message || 'Failed to update preferences' });
      throw result.error;
    }
  },

  updateUserProfile: async (profileUpdates) => {
    const profile = get().profile;
    if (!profile) return;

    set({ isLoading: true, error: null });
    // Optimistic update
    const updatedUser = {
      ...profile,
      ...profileUpdates
    };
    set({ profile: updatedUser });

    const result = await userUseCase.updateProfile(profile.uid, profileUpdates);
    set({ isLoading: false });

    if (!result.isSuccess) {
      // Rollback
      set({ profile, error: result.error?.message || 'Failed to update profile' });
      throw result.error;
    }
  },

  completeActivity: async (xpEarned, activityType, activityId) => {
    const profile = get().profile;
    if (!profile) return;

    set({ isLoading: true, error: null });
    const result = await userUseCase.completeActivity(
      profile.uid,
      profile.progress,
      xpEarned,
      activityType,
      activityId
    );

    if (result.isSuccess) {
      const updatedUser = {
        ...profile,
        progress: result.data
      };
      set({ profile: updatedUser, isLoading: false });
      return result.data;
    } else {
      set({ error: result.error?.message || 'Failed to complete activity', isLoading: false });
      throw result.error;
    }
  },

  clearProfile: () => set({ profile: null, error: null, isLoading: false }),

  reset: () => set({ profile: null, error: null, isLoading: false }),
}));
