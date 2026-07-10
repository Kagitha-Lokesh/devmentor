import React, { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Terminal,
  LogOut,
  X,
  GraduationCap,
  History,
  Search,
  MessageSquare,
  FolderGit2,
  Calendar,
  StickyNote,
  Bookmark,
  Activity,
  Trophy,
  Download,
  Upload,
  Zap,
  Command
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useUserStore } from '../../store/useUserStore';

export default function Sidebar({ isOpen, toggleSidebar, onOpenCommandPalette }) {
  const { signOut } = useAuthStore();
  const { profile } = useUserStore();
  const sidebarRef = useRef(null);

  const coreItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Courses', path: '/courses', icon: BookOpen },
    { name: 'Practice Sandbox', path: '/compiler', icon: Terminal },
    { name: 'Mock Interviews', path: '/interviews', icon: MessageSquare },
    { name: 'Spaced Revision', path: '/revision', icon: History },
    { name: 'Guided Projects', path: '/projects', icon: FolderGit2 },
    { name: 'AI Assistant', path: '/assistant', icon: Zap },
  ];

  const productivityItems = [
    { name: 'Search', path: '/search', icon: Search },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Notes', path: '/notes', icon: StickyNote },
    { name: 'Bookmarks', path: '/bookmarks', icon: Bookmark },
    { name: 'Timeline', path: '/timeline', icon: Activity },
  ];

  const insightItems = [
    { name: 'Achievements', path: '/achievements', icon: Trophy },
    { name: 'Downloads', path: '/downloads', icon: Download },
    { name: 'Export Center', path: '/exports', icon: Upload },
  ];

  // ── Close on Escape key ──
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') toggleSidebar();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, toggleSidebar]);

  // ── Focus trap: keep focus inside sidebar when open on mobile ──
  useEffect(() => {
    if (!isOpen || window.innerWidth >= 1024) return;

    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const focusableSelectors = [
      'a[href]', 'button:not([disabled])', 'input', 'select', 'textarea',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    const focusableEls = Array.from(sidebar.querySelectorAll(focusableSelectors));
    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];

    // Focus first element when opened
    firstEl?.focus();

    const trapFocus = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl?.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl?.focus();
        }
      }
    };

    document.addEventListener('keydown', trapFocus);
    return () => document.removeEventListener('keydown', trapFocus);
  }, [isOpen]);

  // ── Prevent body scroll when sidebar drawer is open on mobile ──
  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 1024) toggleSidebar();
  };

  return (
    <>
      {/* ── Mobile Backdrop Overlay ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar Container ── */}
      <aside
        ref={sidebarRef}
        aria-label="Main Navigation"
        aria-hidden={!isOpen && window.innerWidth < 1024}
        className={`fixed inset-y-0 left-0 z-50 flex flex-col justify-between bg-surface-secondary border-r border-surface-border transition-transform duration-300 ease-in-out
          w-[280px] sm:w-[260px]
          ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0 lg:shadow-none'}
        `}
        style={{ width: 'var(--sidebar-width)' }}
      >
        {/* ── Top: Logo + Close Button ── */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-5 border-b border-surface-border flex-shrink-0" style={{ height: 'var(--topbar-height)' }}>
            <div className="flex items-center gap-3">
              <div className="bg-brand-950 border border-brand-800 text-brand-400 p-2 rounded-xl flex-shrink-0">
                <GraduationCap className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-text flex items-center gap-1">
                DevMentor
                <span className="text-brand-400 text-xs px-1.5 py-0.5 rounded bg-brand-950 border border-brand-800 font-normal">
                  AI
                </span>
              </span>
            </div>
            <button
              onClick={toggleSidebar}
              aria-label="Close sidebar"
              className="p-2 rounded-lg hover:bg-surface-tertiary text-text/60 hover:text-text transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* ── Navigation Links ── */}
          <nav
            className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-4"
            aria-label="Sidebar navigation"
          >
            {/* Core */}
            <div>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-text/25">Core</p>
              <div className="space-y-0.5">
                {coreItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      end={item.path === '/'}
                      className={({ isActive }) => isActive ? 'nav-item-active' : 'nav-item'}
                      onClick={closeSidebarOnMobile}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                      <span className="truncate">{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>

            {/* Productivity */}
            <div>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-text/25">Productivity</p>
              <div className="space-y-0.5">
                {productivityItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      className={({ isActive }) => isActive ? 'nav-item-active' : 'nav-item'}
                      onClick={closeSidebarOnMobile}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                      <span className="truncate">{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>

            {/* Insights */}
            <div>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-text/25">Insights</p>
              <div className="space-y-0.5">
                {insightItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      className={({ isActive }) => isActive ? 'nav-item-active' : 'nav-item'}
                      onClick={closeSidebarOnMobile}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                      <span className="truncate">{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>

        {/* ── Bottom: Command Palette + User ── */}
        <div className="p-3 border-t border-surface-border bg-surface/20 space-y-2 flex-shrink-0">
          {/* Command Palette Shortcut */}
          <button
            onClick={() => { onOpenCommandPalette(); closeSidebarOnMobile(); }}
            aria-label="Open command palette"
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium text-text/40 hover:text-text hover:bg-surface-tertiary/60 transition-colors group min-h-[44px]"
          >
            <Command className="h-4 w-4 flex-shrink-0" />
            Command Palette
            <kbd className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded border border-surface-border bg-surface group-hover:border-brand-800 group-hover:text-brand-400 transition-colors hidden sm:block">
              Ctrl K
            </kbd>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface/50 border border-surface-border">
            <div className="h-8 w-8 rounded-full bg-brand-950 border border-brand-800 text-brand-400 font-bold text-sm flex items-center justify-center flex-shrink-0">
              {profile?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-xs font-semibold text-text truncate">{profile?.displayName || 'Learner'}</p>
              <p className="text-[10px] text-text/50 truncate">{profile?.email}</p>
            </div>
          </div>

          {/* Sign Out */}
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-500/10 transition-all duration-150 cursor-pointer min-h-[44px]"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
