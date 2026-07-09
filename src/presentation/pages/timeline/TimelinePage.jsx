import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, BookOpen, Terminal, MessageSquare, FolderGit2,
  Bookmark, StickyNote, Trophy, Star, Filter, Clock
} from 'lucide-react';
import { useTimelineStore } from '../../store/useTimelineStore';
import { useAuthStore } from '../../store/useAuthStore';

const EVENT_CONFIG = {
  lesson_completed: { icon: BookOpen, color: 'text-brand-400', bg: 'bg-brand-950 border-brand-800', label: 'Lesson Completed' },
  problem_solved: { icon: Terminal, color: 'text-amber-400', bg: 'bg-amber-950 border-amber-800', label: 'Problem Solved' },
  interview_practiced: { icon: MessageSquare, color: 'text-red-400', bg: 'bg-red-950 border-red-800', label: 'Interview Practice' },
  project_milestone: { icon: FolderGit2, color: 'text-purple-400', bg: 'bg-purple-950 border-purple-800', label: 'Project Milestone' },
  bookmark_added: { icon: Bookmark, color: 'text-cyan-400', bg: 'bg-cyan-950 border-cyan-800', label: 'Bookmark Added' },
  note_created: { icon: StickyNote, color: 'text-green-400', bg: 'bg-green-950 border-green-800', label: 'Note Created' },
  achievement_unlocked: { icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-950 border-yellow-800', label: 'Achievement Unlocked' },
  streak_maintained: { icon: Star, color: 'text-orange-400', bg: 'bg-orange-950 border-orange-800', label: 'Streak Maintained' },
};

const ALL_TYPES = ['all', ...Object.keys(EVENT_CONFIG)];

function TimelineItem({ event, isLast }) {
  const config = EVENT_CONFIG[event.type] || { icon: Activity, color: 'text-text/60', bg: 'bg-surface border-surface-border', label: event.type };
  const Icon = config.icon;
  const ts = event.timestamp ? new Date(event.timestamp) : new Date();
  const timeStr = ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = ts.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      className="flex gap-4 group">
      {/* Connector */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`p-2 rounded-xl border ${config.bg} z-10`}>
          <Icon className={`h-4 w-4 ${config.color}`} aria-hidden="true" />
        </div>
        {!isLast && <div className="w-px flex-1 bg-surface-border/50 mt-1" />}
      </div>
      {/* Content */}
      <div className="pb-6 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className={`text-xs font-semibold ${config.color} uppercase tracking-wide`}>{config.label}</span>
            <p className="text-sm font-medium text-text mt-0.5">{event.title}</p>
            {event.description && <p className="text-xs text-text/50 mt-0.5 line-clamp-2">{event.description}</p>}
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xs text-text/40">{dateStr}</div>
            <div className="text-[10px] text-text/25">{timeStr}</div>
          </div>
        </div>
        {event.metadata && Object.keys(event.metadata).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(event.metadata).map(([k, v]) => (
              <span key={k} className="text-[10px] px-1.5 py-0.5 bg-surface border border-surface-border rounded text-text/40">
                {k}: {String(v)}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-surface-secondary border border-surface-border rounded-xl">
      <div className={`p-2.5 rounded-xl ${color}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <div className="text-xl font-bold text-text">{value}</div>
        <div className="text-xs text-text/50">{label}</div>
      </div>
    </div>
  );
}

function groupByDate(events) {
  const groups = {};
  events.forEach(evt => {
    const ts = evt.timestamp ? new Date(evt.timestamp) : new Date();
    const key = ts.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(evt);
  });
  return groups;
}

export default function TimelinePage() {
  const [typeFilter, setTypeFilter] = useState('all');
  const { user } = useAuthStore();
  const { events, stats, isLoading, loadEvents } = useTimelineStore();

  useEffect(() => {
    if (user?.uid) loadEvents(user.uid);
  }, [user?.uid]);

  const filtered = typeFilter === 'all' ? events : events.filter(e => e.type === typeFilter);
  const grouped = groupByDate(filtered);

  const STAT_CARDS = [
    { label: 'Total Events', value: stats?.total || 0, icon: Activity, color: 'bg-brand-950 text-brand-400' },
    { label: 'Lessons Done', value: stats?.byType?.lesson_completed || 0, icon: BookOpen, color: 'bg-cyan-950 text-cyan-400' },
    { label: 'Problems Solved', value: stats?.byType?.problem_solved || 0, icon: Terminal, color: 'bg-amber-950 text-amber-400' },
    { label: 'Achievements', value: stats?.byType?.achievement_unlocked || 0, icon: Trophy, color: 'bg-yellow-950 text-yellow-400' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Learning Timeline</h1>
        <p className="text-sm text-text/50 mt-0.5">A chronological record of your learning journey.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STAT_CARDS.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-text/30" />
        {ALL_TYPES.map(t => {
          const label = t === 'all' ? 'All Events' : EVENT_CONFIG[t]?.label || t;
          return (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${
                typeFilter === t ? 'bg-brand-900 text-brand-300 border-brand-700' : 'text-text/50 border-surface-border hover:text-text'
              }`}>
              {label}
            </button>
          );
        })}
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="text-center py-16 text-text/30 text-sm">Loading timeline...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-text/30">
          <Activity className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No timeline events yet.</p>
          <p className="text-xs mt-1 text-text/20">Your activity will appear here as you learn.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([date, dayEvents]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-text/40 uppercase tracking-wider">
                  <Clock className="h-3.5 w-3.5" /> {date}
                </div>
                <div className="flex-1 h-px bg-surface-border/50" />
                <span className="text-[10px] text-text/25">{dayEvents.length} event{dayEvents.length > 1 ? 's' : ''}</span>
              </div>
              <div>
                {dayEvents.map((evt, i) => (
                  <TimelineItem key={evt.id || i} event={evt} isLast={i === dayEvents.length - 1} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
