import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter, ChevronDown, BookOpen, Terminal, MessageSquare, FolderGit2, Layers } from 'lucide-react';
import { useSearchStore } from '../../store/useSearchStore';
import { useAuthStore } from '../../store/useAuthStore';

const TYPE_OPTIONS = ['All', 'topic', 'problem', 'project', 'flashcard', 'interview_question', 'career_roadmap', 'resume_template', 'portfolio_template'];
const DIFFICULTY_OPTIONS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const typeIcons = {
  topic: BookOpen,
  problem: Terminal,
  interview_question: MessageSquare,
  project: FolderGit2,
  flashcard: Layers,
};

const typeColors = {
  topic: 'bg-brand-950 text-brand-300 border-brand-800',
  problem: 'bg-amber-950 text-amber-300 border-amber-800',
  project: 'bg-purple-950 text-purple-300 border-purple-800',
  flashcard: 'bg-green-950 text-green-300 border-green-800',
  interview_question: 'bg-red-950 text-red-300 border-red-800',
  career_roadmap: 'bg-orange-950 text-orange-300 border-orange-800',
  resume_template: 'bg-pink-950 text-pink-300 border-pink-800',
  portfolio_template: 'bg-indigo-950 text-indigo-300 border-indigo-800',
};

function ResultCard({ item, onClick }) {
  const Icon = typeIcons[item.type] || Search;
  const colorClass = typeColors[item.type] || 'bg-surface text-text/50 border-surface-border';
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onClick(item)}
      className="group flex items-start gap-4 p-4 bg-surface-secondary border border-surface-border rounded-xl hover:border-brand-800/60 hover:bg-brand-950/20 cursor-pointer transition-all duration-200"
    >
      <div className={`p-2 rounded-lg border ${colorClass} flex-shrink-0`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="text-sm font-semibold text-text group-hover:text-brand-300 transition-colors truncate">{item.title}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${colorClass}`}>
            {item.type?.replace(/_/g, ' ')}
          </span>
          {item.difficulty && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-tertiary text-text/40 border border-surface-border">
              {item.difficulty}
            </span>
          )}
        </div>
        <p className="text-xs text-text/50 line-clamp-2">{item.description}</p>
      </div>
    </motion.div>
  );
}

export default function GlobalSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [typeFilter, setTypeFilter] = useState('All');
  const [diffFilter, setDiffFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { results, recentSearches, isSearching, search, loadRecentSearches, addRecentSearch, clearResults } = useSearchStore();

  useEffect(() => {
    if (user?.uid) loadRecentSearches(user.uid);
    inputRef.current?.focus();
  }, [user?.uid]);

  useEffect(() => {
    const delay = setTimeout(() => {
      const filters = {};
      if (typeFilter !== 'All') filters.type = typeFilter;
      if (diffFilter !== 'All') filters.difficulty = diffFilter;
      if (query.trim()) {
        search(query, filters);
        if (user?.uid) addRecentSearch(user.uid, query.trim());
        setSearchParams({ q: query });
      } else {
        clearResults();
        setSearchParams({});
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [query, typeFilter, diffFilter]);

  const handleItemClick = (item) => {
    if (item.route) navigate(item.route);
  };

  const displayResults = results;
  const hasQuery = query.trim().length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Global Search</h1>
        <p className="text-sm text-text/50 mt-1">Search across all courses, problems, projects, interviews, and career assets.</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="flex items-center gap-3 px-4 py-3 bg-surface-secondary border border-surface-border rounded-xl focus-within:border-brand-700 transition-colors">
          <Search className="h-5 w-5 text-text/40 flex-shrink-0" />
          <input
            ref={inputRef}
            id="global-search-input"
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search lessons, problems, projects, interview questions..."
            className="flex-1 bg-transparent text-sm text-text placeholder-text/30 outline-none"
            aria-label="Global search input"
          />
          {query && (
            <button onClick={() => { setQuery(''); clearResults(); }} aria-label="Clear search" className="p-1 text-text/40 hover:text-text transition-colors">
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(v => !v)}
            aria-label="Toggle search filters"
            aria-expanded={showFilters}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
              showFilters || typeFilter !== 'All' || diffFilter !== 'All'
                ? 'bg-brand-950 text-brand-300 border-brand-800'
                : 'bg-surface text-text/50 border-surface-border hover:text-text'
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
            <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-2 p-4 bg-surface-secondary border border-surface-border rounded-xl flex flex-wrap gap-4"
            >
              <div>
                <label className="text-xs text-text/50 font-medium block mb-2">Content Type</label>
                <div className="flex flex-wrap gap-1.5">
                  {TYPE_OPTIONS.map(t => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        typeFilter === t ? 'bg-brand-900 text-brand-300 border-brand-700' : 'text-text/50 border-surface-border hover:text-text'
                      }`}
                    >
                      {t === 'All' ? 'All Types' : t.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-text/50 font-medium block mb-2">Difficulty</label>
                <div className="flex gap-1.5">
                  {DIFFICULTY_OPTIONS.map(d => (
                    <button
                      key={d}
                      onClick={() => setDiffFilter(d)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        diffFilter === d ? 'bg-brand-900 text-brand-300 border-brand-700' : 'text-text/50 border-surface-border hover:text-text'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recent Searches */}
      {!hasQuery && recentSearches.length > 0 && (
        <div>
          <p className="text-xs text-text/40 font-semibold uppercase tracking-wider mb-3">Recent Searches</p>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((s, i) => (
              <button
                key={i}
                onClick={() => setQuery(s)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-surface-secondary border border-surface-border rounded-full text-text/70 hover:text-text hover:border-brand-700 transition-colors"
              >
                <Search className="h-3 w-3" />
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {isSearching && (
        <div className="text-center py-12 text-text/40 text-sm">Searching...</div>
      )}
      {!isSearching && hasQuery && (
        <div>
          <p className="text-xs text-text/40 font-semibold uppercase tracking-wider mb-3">
            {displayResults.length} result{displayResults.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          </p>
          {displayResults.length === 0 ? (
            <div className="text-center py-16 text-text/30 text-sm">
              <Search className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>No results found.</p>
              <p className="text-xs mt-1">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <motion.div layout className="space-y-2">
              {displayResults.map((item, i) => (
                <ResultCard key={item.id || i} item={item} onClick={handleItemClick} />
              ))}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
