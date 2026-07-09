import { create } from 'zustand';

export const useThemeStore = create((set, get) => ({
  theme: 'dark', // 'dark' | 'light'

  initTheme: () => {
    const saved = localStorage.getItem('devmentor_theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = saved || (systemPrefersDark ? 'dark' : 'light');
    
    set({ theme: initialTheme });
    get()._applyTheme(initialTheme);
  },

  setTheme: (theme) => {
    localStorage.setItem('devmentor_theme', theme);
    set({ theme });
    get()._applyTheme(theme);
  },

  toggleTheme: () => {
    const current = get().theme;
    const next = current === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  _applyTheme: (theme) => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }
}));
