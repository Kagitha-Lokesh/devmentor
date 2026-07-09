import React from 'react';
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

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        aria-label="Main Navigation"
        className={`fixed inset-y-0 left-0 z-50 flex flex-col justify-between w-sidebar bg-surface-secondary border-r border-surface-border transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header Section */}
        <div>
          <div className="flex items-center justify-between h-topbar px-6 border-b border-surface-border">
            <div className="flex items-center gap-3">
              <div className="bg-brand-950 border border-brand-800 text-brand-400 p-2 rounded-xl">
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
              className="p-1 rounded-lg hover:bg-surface-tertiary text-text/60 hover:text-text lg:hidden cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-4 overflow-y-auto flex-1" aria-label="Sidebar navigation">
            {/* Core */}
            <div>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-text/25">Core</p>
              <div className="space-y-0.5">
                {coreItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink key={item.name} to={item.path} end={item.path === '/'}
                      className={({ isActive }) => isActive ? 'nav-item-active' : 'nav-item'}
                      onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {item.name}
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
                    <NavLink key={item.name} to={item.path}
                      className={({ isActive }) => isActive ? 'nav-item-active' : 'nav-item'}
                      onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {item.name}
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
                    <NavLink key={item.name} to={item.path}
                      className={({ isActive }) => isActive ? 'nav-item-active' : 'nav-item'}
                      onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {item.name}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>

        {/* User Profile & Logout Bottom Section */}
        <div className="p-3 border-t border-surface-border bg-surface/20 space-y-2">
          {/* Command Palette Shortcut */}
          <button
            onClick={onOpenCommandPalette}
            aria-label="Open command palette"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-text/40 hover:text-text hover:bg-surface-tertiary/60 transition-colors group"
          >
            <Command className="h-4 w-4" />
            Command Palette
            <kbd className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded border border-surface-border bg-surface group-hover:border-brand-800 group-hover:text-brand-400 transition-colors">
              Ctrl K
            </kbd>
          </button>

          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface/50 border border-surface-border">
            <div className="h-8 w-8 rounded-full bg-brand-950 border border-brand-800 text-brand-400 font-bold text-sm flex items-center justify-center flex-shrink-0">
              {profile?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-text truncate">{profile?.displayName || 'Learner'}</p>
              <p className="text-[10px] text-text/50 truncate">{profile?.email}</p>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-500/10 transition-all duration-150 cursor-pointer"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
