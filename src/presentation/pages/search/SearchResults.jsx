import React, { useState } from 'react';
import { Search, BookOpen, Terminal, MessageSquare, ShieldAlert, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SearchResults() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Mock search dataset
  const allResults = [
    {
      id: 'res-1',
      title: 'HashMap Internals & Collision Resolution',
      excerpt: 'Explains load factors, buckets, linked lists, and red-black tree conversions (threshold 8).',
      type: 'lesson',
      topicCode: 'V1-C5-T1',
      keywords: ['hashmap', 'concurrency', 'collision']
    },
    {
      id: 'res-2',
      title: 'Two Sum using HashMap',
      excerpt: 'Optimize Two Sum array search using an auxiliary HashMap to reach O(N) complexity.',
      type: 'problem',
      topicCode: 'V1-C5-T1',
      keywords: ['hashmap', 'arrays', 'optimization']
    },
    {
      id: 'res-3',
      title: 'How does HashMap handle collisions?',
      excerpt: 'Popular intermediate technical interview question exploring hashing functions and equals() contract.',
      type: 'interview-question',
      topicCode: 'V1-C5-T1',
      keywords: ['hashmap', 'interview']
    },
    {
      id: 'res-4',
      title: 'NullPointerException (NPE) Guide',
      excerpt: 'Comprehensive guide covering what throws NPE, JVM stack/heap frames, and Optional solutions.',
      type: 'error-guide',
      topicCode: 'V1-C8-T3',
      keywords: ['nullpointerexception', 'exception']
    }
  ];

  const filteredResults = query
    ? allResults.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.excerpt.toLowerCase().includes(query.toLowerCase()) ||
          r.keywords.some((k) => k.includes(query.toLowerCase()))
      )
    : [];

  const getIcon = (type) => {
    switch (type) {
      case 'lesson':
        return BookOpen;
      case 'problem':
        return Terminal;
      case 'interview-question':
        return MessageSquare;
      default:
        return ShieldAlert;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Search Engine</h1>
        <p className="text-slate-400 text-sm">Instant fuzzy search across all lessons, coding problems, error guides, and interview banks</p>
      </div>

      {/* Input bar */}
      <div className="relative">
        <Search className="absolute left-4 top-4.5 h-5 w-5 text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for HashMap, inheritance, ArrayList, NullPointerException..."
          className="w-full bg-slate-900 border border-slate-800 focus:border-brand-500 rounded-2xl py-4 pl-12 pr-4 text-slate-100 placeholder:text-slate-500 text-base shadow-xl outline-none transition-colors"
          autoFocus
        />
      </div>

      {/* Search results */}
      {query ? (
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">
            Found {filteredResults.length} matches
          </div>

          {filteredResults.length > 0 ? (
            <div className="space-y-3">
              {filteredResults.map((res) => {
                const Icon = getIcon(res.type);
                return (
                  <div
                    key={res.id}
                    onClick={() => navigate('/courses')}
                    className="group bg-slate-900 border border-slate-800 hover:border-brand-700 p-5 rounded-xl flex justify-between items-center gap-4 transition-smooth cursor-pointer"
                  >
                    <div className="flex gap-4">
                      <div className="shrink-0 p-3 bg-slate-950 border border-slate-850 rounded-lg text-brand-400 group-hover:text-brand-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="font-bold text-slate-100 group-hover:text-white transition-colors">{res.title}</h3>
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-850 uppercase">
                            {res.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{res.excerpt}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4.5 w-4.5 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-sm">
              No results found for "{query}". Try another search term.
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-slate-900 rounded-2xl p-8 text-center max-w-lg mx-auto">
          <BrainCardIcon className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-400">Discover Instantly</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Type anything above to pull resources instantly from our comprehensive knowledge base.
          </p>
        </div>
      )}
    </div>
  );
}

function BrainCardIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="M12 6v12" />
      <path d="M8 10h8" />
    </svg>
  );
}
