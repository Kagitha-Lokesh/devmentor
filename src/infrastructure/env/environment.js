/**
 * Environment configuration wrapper.
 * Decouples environment variables from business logic.
 */

const mode = import.meta.env.MODE || 'development'; // 'development' | 'production' | 'test'

export const environment = {
  mode,
  isDev: mode === 'development',
  isProd: mode === 'production',
  isTest: mode === 'test',

  // Feature Flags
  isMock: import.meta.env.VITE_USE_MOCKS === 'true',
  useEmulator: import.meta.env.VITE_USE_EMULATOR === 'true',
  compilerProvider: import.meta.env.VITE_COMPILER_PROVIDER || 'piston',

  get analyticsEnabled() {
    // Disable analytics in test environments or if mocks are enabled
    return this.isProd && !this.isMock;
  },

  get loggingEnabled() {
    return !this.isTest;
  },

  get offlineEnabled() {
    return true; // PWA Service worker cache allowed
  }
};
