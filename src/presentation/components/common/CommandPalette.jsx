import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Command, ArrowRight, Hash, BookOpen, Terminal, MessageSquare,
  History, FolderGit2, LayoutDashboard, Calendar, StickyNote, Bookmark,
  Trophy, Download, Upload, Zap, Moon, Sun, X, WifiOff
} from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import Fuse from 'fuse.js';

const iconMap = {
  'nav-dashboard': LayoutDashboard,
  'nav-courses': BookOpen,
  'nav-compiler': Terminal,
  'nav-interviews': MessageSquare,
  'nav-revision': History,
  'nav-projects': FolderGit2,
  'nav-assistant': Zap,
  'nav-calendar': Calendar,
  'nav-notes': StickyNote,
  'nav-bookmarks': Bookmark,
  'nav-timeline': Hash,
  'nav-achievements': Trophy,
  'nav-downloads': Download,
  'nav-exports': Upload,
  'cmd-theme': Moon,
  'cmd-sidebar': Command,
};

const typeColors = {
  topic: 'text-brand-400 bg-brand-950',
  problem: 'text-amber-400 bg-amber-950',
  project: 'text-purple-400 bg-purple-950',
  flashcard: 'text-green-400 bg-green-950',
  interview_question: 'text-red-400 bg-red-950/60',
  course: 'text-cyan-400 bg-cyan-950',
  career_roadmap: 'text-orange-400 bg-orange-950',
  resume_template: 'text-pink-400 bg-pink-950',
  portfolio_template: 'text-indigo-400 bg-indigo-950',
};

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();
  const { toggleTheme } = useThemeStore();

  const [commandIndex, setCommandIndex] = useState([]);
  const [globalSearchIndex, setGlobalSearchIndex] = useState([]);
  const [indexesLoaded, setIndexesLoaded] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const contentFuseRef = useRef(null);
  const commandFuseRef = useRef(null);

  // Monitor network online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Lazy load search indexes when palette is open
  useEffect(() => {
    if (!isOpen) return;
    if (indexesLoaded) return;
    
    let active = true;
    const fetchIndexes = async () => {
      try {
        const [cmdRes, searchRes] = await Promise.all([
          fetch('/generated/search/command-index.json').then(r => r.json()),
          fetch('/generated/search/global-search-index.json').then(r => r.json())
        ]);
        if (!active) return;
        setCommandIndex(cmdRes);
        setGlobalSearchIndex(searchRes);
        setIndexesLoaded(true);
      } catch (err) {
        console.error('Failed to load command palette indexes:', err);
      }
    };
    fetchIndexes();
    return () => { active = false; };
  }, [isOpen, indexesLoaded]);

  // Re-build Fuse instances when indexes load
  useEffect(() => {
    if (indexesLoaded) {
      contentFuseRef.current = new Fuse(globalSearchIndex, {
        keys: ['title', 'description', 'type', 'keywords', 'tags'],
        threshold: 0.3,
        includeScore: true
      });
      commandFuseRef.current = new Fuse(commandIndex, {
        keys: ['name', 'category', 'keywords'],
        threshold: 0.35,
        includeScore: true
      });
    }
  }, [indexesLoaded, globalSearchIndex, commandIndex]);

  const commandResults = query
    ? (commandFuseRef.current ? commandFuseRef.current.search(query).map(r => ({ ...r.item, _kind: 'command' })) : [])
    : commandIndex.map(c => ({ ...c, _kind: 'command' }));

  const contentResults = query
    ? (contentFuseRef.current ? contentFuseRef.current.search(query).slice(0, 8).map(r => ({ ...r.item, _kind: 'content' })) : [])
    : [];

  const results = [...commandResults.slice(0, query ? 4 : 10), ...contentResults];

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  const executeItem = useCallback((item) => {
    // If offline and item does not support offline mode, ignore execution
    if (!isOnline && item.offlineSupported === false) {
      return;
    }

    if (item._kind === 'command') {
      if (item.action === 'toggleTheme') {
        toggleTheme();
      } else if (item.route) {
        navigate(item.route);
      }
    } else if (item.route) {
      navigate(item.route);
    }
    onClose();
  }, [navigate, toggleTheme, onClose, isOnline]);

  useEffect(() => {
    const handler = (e) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected(s => Math.min(s + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected(s => Math.max(s - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selected]) executeItem(results[selected]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, results, selected, executeItem, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.children[selected];
    el?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  const getItemIcon = (item) => {
    if (item._kind === 'command') {
      const Icon = iconMap[item.id] || Command;
      return <Icon className="h-4 w-4 flex-shrink-0" />;
    }
    return <Hash className="h-4 w-4 flex-shrink-0 text-text/40" />;
  };

  const getTypeBadge = (item) => {
    if (item._kind === 'command') return null;
    const cls = typeColors[item.type] || 'text-text/50 bg-surface-tertiary';
    return (
      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${cls}`}>
        {item.type?.replace(/_/g, ' ')}
      </span>
    );
  };

  // Detect mobile for bottom sheet layout
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* ── Desktop: Centered modal | Mobile: Bottom sheet ── */}
          <motion.div
            role="dialog"
            aria-label="Command palette"
            aria-modal="true"
            {...(isMobile
              ? {
                  initial: { y: '100%' },
                  animate: { y: 0 },
                  exit: { y: '100%' },
                  transition: { type: 'spring', damping: 30, stiffness: 300 },
                  className: 'fixed bottom-0 inset-x-0 z-[90] max-h-[85dvh] flex flex-col',
                }
              : {
                  initial: { opacity: 0, scale: 0.96, y: -10 },
                  animate: { opacity: 1, scale: 1, y: 0 },
                  exit: { opacity: 0, scale: 0.95, y: -10 },
                  transition: { duration: 0.15, ease: 'easeOut' },
                  className: 'fixed inset-x-0 top-[10vh] z-[90] mx-auto w-full max-w-2xl px-4',
                })}
          >
            <div className={`bg-surface-secondary border border-surface-border shadow-2xl overflow-hidden flex flex-col ${
              isMobile ? 'rounded-t-2xl max-h-[85dvh]' : 'rounded-2xl'
            }`}>
              {/* Mobile drag handle */}
              {isMobile && (
                <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                  <div className="w-10 h-1 rounded-full bg-surface-tertiary" />
                </div>
              )}

              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 border-b border-surface-border flex-shrink-0">
                <Search className="h-5 w-5 text-text/40 flex-shrink-0" aria-hidden="true" />
                <input
                  ref={inputRef}
                  id="command-palette-input"
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search commands, pages, content..."
                  className="flex-1 py-4 bg-transparent text-sm text-text placeholder-text/30 outline-none min-h-[44px]"
                  aria-label="Command palette search input"
                  aria-autocomplete="list"
                  aria-controls="command-palette-list"
                  aria-activedescendant={results[selected] ? `cmd-item-${selected}` : undefined}
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="p-2 rounded text-text/40 hover:text-text transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                {!isMobile && (
                  <kbd className="hidden sm:flex items-center gap-1 text-[10px] text-text/30 font-mono bg-surface px-1.5 py-0.5 rounded border border-surface-border">
                    Esc
                  </kbd>
                )}
                {isMobile && (
                  <button
                    onClick={onClose}
                    aria-label="Close"
                    className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-surface-tertiary text-text/60"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Results */}
              <div
                id="command-palette-list"
                role="listbox"
                ref={listRef}
                className="overflow-y-auto py-2 flex-1"
                style={{ maxHeight: isMobile ? '60dvh' : '60vh' }}
                aria-label="Command palette results"
              >
                {results.length === 0 ? (
                  <div className="px-4 py-8 text-center text-text/30 text-sm">
                    No results found for &ldquo;{query}&rdquo;
                  </div>
                ) : (
                  <>
                    {!query && (
                      <p className="px-4 pt-1 pb-2 text-[10px] uppercase tracking-widest text-text/30 font-semibold">
                        Navigation
                      </p>
                    )}
                    {query && commandResults.length > 0 && contentResults.length > 0 && (
                      <p className="px-4 pt-1 pb-1 text-[10px] uppercase tracking-widest text-text/30 font-semibold">
                        Commands
                      </p>
                    )}
                    {results.map((item, idx) => {
                      const isSelected = idx === selected;
                      const isOfflineDisabled = !isOnline && item.offlineSupported === false;
                      const sep = query && item._kind === 'content' && (idx === 0 || results[idx - 1]._kind !== 'content');
                      return (
                        <React.Fragment key={item.id || idx}>
                          {sep && (
                            <p className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-widest text-text/30 font-semibold">
                              Content
                            </p>
                          )}
                          <div
                            id={`cmd-item-${idx}`}
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => executeItem(item)}
                            onMouseEnter={() => setSelected(idx)}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors min-h-[48px] ${
                              isSelected
                                ? 'bg-brand-950/60 text-brand-300'
                                : 'text-text/80 hover:bg-surface-tertiary/50'
                            } ${isOfflineDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                          >
                            <span className={isSelected ? 'text-brand-400' : 'text-text/40'}>
                              {getItemIcon(item)}
                            </span>
                            <span className="flex-1 text-sm font-medium truncate">{item.name || item.title}</span>
                            {isOfflineDisabled && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-red-950/60 text-red-400 border border-red-900/40 flex items-center gap-1 flex-shrink-0">
                                <WifiOff className="h-3 w-3" />
                                Offline Only
                              </span>
                            )}
                            {getTypeBadge(item)}
                            {isSelected && (
                              <ArrowRight className="h-3.5 w-3.5 text-brand-400 flex-shrink-0" />
                            )}
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-surface-border flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3 text-[10px] text-text/30">
                  {!isMobile && (
                    <>
                      <span className="flex items-center gap-1"><kbd className="font-mono bg-surface px-1 py-0.5 rounded border border-surface-border">↑↓</kbd> navigate</span>
                      <span className="flex items-center gap-1"><kbd className="font-mono bg-surface px-1 py-0.5 rounded border border-surface-border">↵</kbd> open</span>
                    </>
                  )}
                  {isMobile && <span>Tap to open</span>}
                </div>
                <span className="text-[10px] text-text/20">{results.length} results</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
