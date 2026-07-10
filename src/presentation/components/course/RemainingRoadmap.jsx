/**
 * RemainingRoadmap — Learning OS remaining work breakdown
 * Shows per-module remaining topics + estimated hours.
 */
import React from 'react';
import { Clock } from 'lucide-react';

export function RemainingRoadmap({ modules = [], totalHours = 0 }) {
  const nonEmpty = modules.filter(m => m.remaining > 0);

  if (nonEmpty.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-emerald-500 font-bold text-sm">🎉 Roadmap Complete!</p>
        <p className="text-text/40 text-xs mt-1">You've finished every module.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {nonEmpty.map(mod => (
        <div key={mod.key} className="flex items-center gap-3">
          {/* Color dot */}
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: mod.color || '#6366f1' }}
          />

          {/* Module name */}
          <span className="text-sm text-text/70 font-semibold flex-1 truncate">
            {mod.label}
          </span>

          {/* Remaining count */}
          <span className="text-xs font-bold text-text/50 tabular-nums">
            {mod.remaining} {mod.remaining === 1 ? 'topic' : 'topics'}
          </span>

          {/* Hours */}
          <span className="text-xs text-text/30 tabular-nums w-14 text-right flex-shrink-0">
            {mod.estimatedHours}h
          </span>
        </div>
      ))}

      <div className="border-t border-surface-border pt-3 mt-3 flex items-center justify-between">
        <span className="text-xs font-bold text-text/50 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          Total Remaining
        </span>
        <span className="text-sm font-black text-brand-500 tabular-nums">
          ~{totalHours} hours
        </span>
      </div>
    </div>
  );
}

export default RemainingRoadmap;
