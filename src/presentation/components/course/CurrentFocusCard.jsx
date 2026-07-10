/**
 * CurrentFocusCard — Learning OS always-visible focus anchor
 * Shows the most recently active topic with time estimate and continue CTA.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, ChevronRight, Zap } from 'lucide-react';

export function CurrentFocusCard({ focus, className = '' }) {
  const navigate = useNavigate();

  if (!focus) {
    return (
      <div className={`rounded-2xl border border-surface-border bg-surface-secondary p-4 ${className}`}>
        <p className="text-xs font-bold uppercase tracking-widest text-text/30 mb-2">Current Focus</p>
        <p className="text-sm text-text/50">No lesson in progress. Start your next topic.</p>
      </div>
    );
  }

  const { node, progress, estimatedMinutesRemaining } = focus;

  const handleResume = () => {
    navigate(`/courses/java/topics/${node.slug}`);
  };

  return (
    <div
      className={`
        rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-500/5 to-transparent
        p-4 cursor-pointer group hover:border-brand-500/60 transition-all duration-200
        ${className}
      `}
      onClick={handleResume}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleResume()}
      aria-label={`Resume ${node.title}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-500">
            Current Focus
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-text/30 group-hover:text-brand-500 transition-colors" />
      </div>

      {/* Topic info */}
      <h3 className="font-bold text-text text-sm leading-tight mb-1">{node.title}</h3>
      <p className="text-xs text-text/40 mb-3 line-clamp-1">{node.description}</p>

      {/* Stats row */}
      <div className="flex items-center gap-4 mb-3">
        <span className="flex items-center gap-1 text-xs text-text/50">
          <Clock className="h-3.5 w-3.5" />
          {estimatedMinutesRemaining} min left
        </span>
        <span className="flex items-center gap-1 text-xs text-text/50">
          <Zap className="h-3.5 w-3.5" />
          {node.difficulty || 'Intermediate'}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-surface-border rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-brand-500 rounded-full transition-all"
          style={{ width: `${progress?.readingPercentage || 0}%` }}
        />
      </div>

      {/* CTA */}
      <button
        className="flex items-center gap-2 text-xs font-bold text-brand-500 hover:text-brand-400 transition-colors"
        onClick={e => { e.stopPropagation(); handleResume(); }}
      >
        <Play className="h-3.5 w-3.5" />
        Continue →
      </button>
    </div>
  );
}

export default CurrentFocusCard;
