import React, { useEffect, useState, useRef } from 'react';
import { Menu, Zap, Flame, WifiOff, Search, Sun, Moon, User, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../store/useThemeStore';
import { useUserStore } from '../../store/useUserStore';
import { useAuthStore } from '../../store/useAuthStore';

export default function Topbar({ toggleSidebar, onOpenCommandPalette }) {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { theme, toggleTheme } = useThemeStore();
  const { profile } = useUserStore();
  const { signOut } = useAuthStore();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);

    const handleEsc = (e) => {
      if (e.key === 'Escape') setUserDropdownOpen(false);
    };
    document.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const xp = profile?.progress?.xp ?? 0;
  const streak = profile?.progress?.streak ?? 0;

  return (
    <header
      className="fixed top-0 right-0 z-30 flex items-center justify-between px-3 sm:px-6 bg-surface-secondary border-b border-surface-border lg:left-sidebar"
      style={{
        left: 0,
        height: 'var(--topbar-height)',
      }}
    >
      {/* ── Left: hamburger + search ── */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle navigation sidebar"
          className="p-2 rounded-lg hover:bg-surface-tertiary text-text/60 hover:text-text cursor-pointer flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search bar — hidden on xs, visible from sm */}
        <button
          onClick={onOpenCommandPalette}
          aria-label="Open command palette and search"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-surface hover:bg-surface/80 border border-surface-border rounded-lg text-text/50 hover:text-text/70 text-xs transition-colors cursor-pointer max-w-[240px] lg:max-w-xs"
        >
          <Search className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="hidden md:inline truncate">Commands &amp; search...</span>
          <span className="inline md:hidden">Search...</span>
          <kbd className="hidden lg:flex bg-surface-tertiary px-1.5 py-0.5 rounded border border-surface-border text-[10px] font-mono text-text/60 ml-auto flex-shrink-0">
            Ctrl+K
          </kbd>
        </button>

        {/* Mobile search icon only */}
        <button
          onClick={onOpenCommandPalette}
          aria-label="Open search"
          className="sm:hidden p-2 rounded-lg hover:bg-surface-tertiary text-text/60 hover:text-text cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>

      {/* ── Right: stats + actions ── */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        {/* Offline Badge */}
        {!isOnline && (
          <div
            role="status"
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1 bg-red-900/20 dark:bg-red-950/50 border border-red-800/80 rounded-lg text-red-500 dark:text-red-400 text-xs font-semibold animate-pulse"
          >
            <WifiOff className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Offline Mode</span>
          </div>
        )}

        {/* Gamified stats — compact on mobile */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="flex items-center gap-1 sm:gap-1.5 bg-brand-950 border border-brand-800/60 rounded-full pl-1 sm:pl-1.5 pr-2 sm:pr-3 py-1">
            <div className="h-5 w-5 rounded-full bg-brand-600 text-white flex items-center justify-center flex-shrink-0">
              <Zap className="h-3 w-3 fill-current" />
            </div>
            <div className="text-xs font-bold text-brand-300">
              {xp} <span className="hidden sm:inline opacity-60 font-normal">XP</span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 bg-amber-950/60 border border-amber-800/50 rounded-full pl-1 sm:pl-1.5 pr-2 sm:pr-3 py-1">
            <div className="h-5 w-5 rounded-full bg-amber-600 text-white flex items-center justify-center flex-shrink-0">
              <Flame className="h-3 w-3 fill-current" />
            </div>
            <div className="text-xs font-bold text-amber-400">
              {streak} <span className="hidden sm:inline opacity-60 font-normal">days</span>
            </div>
          </div>
        </div>

        {/* Theme and User Actions */}
        <div className="flex items-center gap-1 sm:gap-2 border-l border-surface-border pl-2 sm:pl-4">
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-2 rounded-lg hover:bg-surface-tertiary text-text/60 hover:text-text cursor-pointer transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              aria-expanded={userDropdownOpen}
              aria-haspopup="true"
              aria-label="User account actions"
              className="h-9 w-9 rounded-full bg-brand-950 border border-brand-800 text-brand-400 font-bold text-xs flex items-center justify-center cursor-pointer hover:border-brand-600 transition-colors min-w-[44px] min-h-[44px]"
            >
              {profile?.email?.[0]?.toUpperCase() || 'U'}
            </button>

            {userDropdownOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2.5 w-48 bg-surface-secondary border border-surface-border rounded-xl shadow-xl py-1.5 z-50 animate-slide-up"
              >
                <div className="px-4 py-2 border-b border-surface-border">
                  <p className="text-xs text-text/40">Signed in as</p>
                  <p className="text-sm font-semibold text-text truncate">{profile?.displayName || 'Learner'}</p>
                </div>

                <button
                  role="menuitem"
                  onClick={() => { setUserDropdownOpen(false); navigate('/'); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-text/80 hover:text-text hover:bg-surface-tertiary text-left cursor-pointer transition-colors"
                >
                  <User className="h-4 w-4 text-text/60 flex-shrink-0" />
                  My Dashboard
                </button>

                <button
                  role="menuitem"
                  onClick={() => { setUserDropdownOpen(false); navigate('/preferences'); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-text/80 hover:text-text hover:bg-surface-tertiary text-left cursor-pointer transition-colors"
                >
                  <Settings className="h-4 w-4 text-text/60 flex-shrink-0" />
                  Preferences
                </button>

                <div className="border-t border-surface-border my-1" />

                <button
                  role="menuitem"
                  onClick={() => { setUserDropdownOpen(false); signOut(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 dark:text-red-400 hover:bg-red-500/10 text-left cursor-pointer transition-colors"
                >
                  <LogOut className="h-4 w-4 flex-shrink-0" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
