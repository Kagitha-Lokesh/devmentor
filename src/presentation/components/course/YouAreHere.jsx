/**
 * YouAreHere — Learning OS full-stack roadmap progress visualization
 * Shows every module as a progress bar with "◄ YOU ARE HERE" marker.
 */
import React from 'react';
import curriculumWeights from '../../../shared/config/curriculum-weights.json';

const MODULE_KEYS = Object.entries(curriculumWeights)
  .filter(([k]) => k !== '_meta')
  .sort((a, b) => (a[1].order || 0) - (b[1].order || 0));

const JOURNEY_LABELS = ['Foundation', 'Java', 'DSA', 'SQL', 'Spring Boot', 'React', 'Projects', 'Interview', 'Job Ready'];

export function YouAreHere({ modules = {}, currentModuleKey = null }) {
  // Find the "current" module: highest module with partial progress
  const activeKey = currentModuleKey ?? (() => {
    let lastPartial = null;
    for (const [key] of MODULE_KEYS) {
      const mod = modules[key];
      if (mod && mod.completion > 0 && mod.completion < 100) {
        lastPartial = key;
      }
    }
    return lastPartial || MODULE_KEYS[0]?.[0];
  })();

  return (
    <div className="space-y-2.5" aria-label="Full Stack Roadmap Progress">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-px flex-1 bg-surface-border" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-text/30">Full Stack Journey</span>
        <div className="h-px flex-1 bg-surface-border" />
      </div>

      {MODULE_KEYS.map(([key, config]) => {
        const mod = modules[key];
        const completion = mod?.completion ?? 0;
        const isActive = key === activeKey;
        const isLocked = completion === 0 && !isActive;
        const isDone = completion === 100;

        return (
          <div key={key} className="flex items-center gap-3">
            {/* Label */}
            <span className={`
              text-xs font-bold w-24 flex-shrink-0 text-right
              ${isDone ? 'text-emerald-500' : isActive ? 'text-brand-500' : isLocked ? 'text-text/25' : 'text-text/60'}
            `}>
              {config.label.split(' ')[0]}
            </span>

            {/* Progress bar */}
            <div className="flex-1 relative h-2 bg-surface-secondary rounded-full overflow-visible">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isDone ? 'bg-emerald-500' : isActive ? 'bg-brand-500' : isLocked ? 'bg-surface-border' : 'bg-brand-500/50'
                }`}
                style={{ width: `${completion}%` }}
              />
              {/* Current position dot */}
              {isActive && completion > 0 && (
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-brand-500 border-2 border-default dark:border-surface shadow-lg animate-pulse"
                  style={{ left: `calc(${completion}% - 7px)` }}
                />
              )}
            </div>

            {/* Value */}
            <span className={`
              text-xs font-bold tabular-nums w-10 flex-shrink-0
              ${isDone ? 'text-emerald-500' : isActive ? 'text-brand-500' : 'text-text/30'}
            `}>
              {isDone ? '✓' : isLocked ? '—' : `${completion}%`}
            </span>

            {/* You Are Here badge */}
            {isActive && (
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-500 whitespace-nowrap flex-shrink-0 animate-pulse">
                ◄ HERE
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default YouAreHere;
