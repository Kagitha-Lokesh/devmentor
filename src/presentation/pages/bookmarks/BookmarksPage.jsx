import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bookmark, Search, Trash2, Star, Grid3x3, List,
  BookOpen, Terminal, MessageSquare, FolderGit2, Hash, ExternalLink, Tag
} from 'lucide-react';
import { useBookmarksStore } from '../../store/useBookmarksStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const TYPE_ICONS = {
  topic: BookOpen, problem: Terminal, interview: MessageSquare,
  project: FolderGit2, course: BookOpen,
};
const TYPE_COLORS = {
  topic: 'bg-brand-950 text-brand-400 border-brand-800',
  problem: 'bg-amber-950 text-amber-400 border-amber-800',
  interview: 'bg-red-950 text-red-400 border-red-800',
  project: 'bg-purple-950 text-purple-400 border-purple-800',
  course: 'bg-cyan-950 text-cyan-400 border-cyan-800',
};

function BookmarkCard({ bookmark, onDelete, onToggleFavorite, onNavigate, viewMode }) {
  const Icon = TYPE_ICONS[bookmark.targetType] || Bookmark;
  const colorClass = TYPE_COLORS[bookmark.targetType] || 'bg-surface text-text/50 border-surface-border';
  if (viewMode === 'list') {
    return (
      <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="group flex items-center gap-4 px-4 py-3 bg-surface-secondary border border-surface-border rounded-xl hover:border-brand-800/50 transition-all">
        <span className={`p-1.5 rounded-lg border ${colorClass} flex-shrink-0`}><Icon className="h-3.5 w-3.5" /></span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text truncate">{bookmark.title}</p>
          <p className="text-xs text-text/40">{bookmark.folder} · {bookmark.targetType?.replace(/_/g, ' ')}</p>
        </div>
        {bookmark.tags?.length > 0 && (
          <div className="hidden md:flex gap-1">
            {bookmark.tags.slice(0, 3).map((t, i) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 bg-surface border border-surface-border rounded text-text/40">#{t}</span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onToggleFavorite(bookmark.id)} title={bookmark.isFavorite ? 'Unfavorite' : 'Favorite'}
            className={`p-1.5 rounded-lg transition-colors ${bookmark.isFavorite ? 'text-yellow-400' : 'text-text/30 hover:text-yellow-400'}`}>
            <Star className="h-3.5 w-3.5" fill={bookmark.isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button onClick={() => onNavigate(bookmark)} className="p-1.5 text-text/30 hover:text-brand-400 rounded-lg transition-colors">
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => onDelete(bookmark.id)} className="p-1.5 text-text/30 hover:text-red-400 rounded-lg transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
      className="group relative p-4 bg-surface-secondary border border-surface-border rounded-xl hover:border-brand-800/60 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-3">
        <span className={`p-2 rounded-lg border ${colorClass}`}><Icon className="h-4 w-4" /></span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onToggleFavorite(bookmark.id)}
            className={`p-1.5 rounded-lg transition-colors ${bookmark.isFavorite ? 'text-yellow-400' : 'text-text/30 hover:text-yellow-400'}`}>
            <Star className="h-3.5 w-3.5" fill={bookmark.isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button onClick={() => onDelete(bookmark.id)} className="p-1.5 text-text/30 hover:text-red-400 rounded-lg transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <button onClick={() => onNavigate(bookmark)} className="w-full text-left">
        <p className="text-sm font-semibold text-text hover:text-brand-300 transition-colors truncate">{bookmark.title}</p>
        <p className="text-xs text-text/40 mt-0.5">{bookmark.folder}</p>
        {bookmark.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {bookmark.tags.slice(0, 4).map((t, i) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 bg-surface border border-surface-border rounded text-text/40 flex items-center gap-0.5">
                <Hash className="h-2.5 w-2.5" />{t}
              </span>
            ))}
          </div>
        )}
      </button>
    </motion.div>
  );
}

export default function BookmarksPage() {
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [folderFilter, setFolderFilter] = useState('All');
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { bookmarks, isLoading, loadBookmarks, removeBookmark, toggleFavorite } = useBookmarksStore();

  useEffect(() => {
    if (user?.uid) loadBookmarks(user.uid);
  }, [user?.uid]);

  const folders = ['All', ...new Set(bookmarks.map(b => b.folder || 'General'))];
  const filtered = bookmarks.filter(b => {
    const matchFolder = folderFilter === 'All' || b.folder === folderFilter;
    const matchQuery = !query || b.title?.toLowerCase().includes(query.toLowerCase()) ||
      b.tags?.some(t => t.toLowerCase().includes(query.toLowerCase()));
    return matchFolder && matchQuery;
  });
  const favorites = filtered.filter(b => b.isFavorite);
  const rest = filtered.filter(b => !b.isFavorite);
  const sortedFiltered = [...favorites, ...rest];

  const handleNavigate = (bookmark) => {
    if (bookmark.route) navigate(bookmark.route);
  };

  const handleDelete = async (id) => {
    if (!user?.uid) return;
    await removeBookmark(user.uid, id);
  };

  const handleToggleFavorite = async (id) => {
    if (!user?.uid) return;
    await toggleFavorite(user.uid, id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Bookmarks</h1>
          <p className="text-sm text-text/50 mt-0.5">{bookmarks.length} saved items across {folders.length - 1} folders.</p>
        </div>
        <div className="flex items-center gap-2 bg-surface-secondary border border-surface-border rounded-xl p-1">
          <button onClick={() => setViewMode('grid')} aria-label="Grid view"
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-brand-700 text-white' : 'text-text/40 hover:text-text'}`}>
            <Grid3x3 className="h-4 w-4" />
          </button>
          <button onClick={() => setViewMode('list')} aria-label="List view"
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-brand-700 text-white' : 'text-text/40 hover:text-text'}`}>
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-48 flex items-center gap-2 px-3 py-2 bg-surface-secondary border border-surface-border rounded-xl focus-within:border-brand-700 transition-colors">
          <Search className="h-4 w-4 text-text/30 flex-shrink-0" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search bookmarks..."
            className="flex-1 bg-transparent text-sm text-text placeholder-text/30 outline-none" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {folders.map(f => (
            <button key={f} onClick={() => setFolderFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                folderFilter === f ? 'bg-brand-900 text-brand-300 border-brand-700' : 'text-text/50 border-surface-border hover:text-text'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-16 text-text/30 text-sm">Loading bookmarks...</div>
      ) : sortedFiltered.length === 0 ? (
        <div className="text-center py-20 text-text/30">
          <Bookmark className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">{query ? 'No bookmarks match your search.' : 'No bookmarks yet.'}</p>
          <p className="text-xs mt-1 text-text/20">Add bookmarks from any lesson, problem, or project page.</p>
        </div>
      ) : (
        <motion.div layout className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}>
          {sortedFiltered.map(b => (
            <BookmarkCard key={b.id} bookmark={b} onDelete={handleDelete} onToggleFavorite={handleToggleFavorite}
              onNavigate={handleNavigate} viewMode={viewMode} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
