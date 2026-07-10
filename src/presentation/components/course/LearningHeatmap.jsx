/**
 * LearningHeatmap — Extracted activity heatmap component
 * Accepts heatmapDays array (already computed in Dashboard).
 * Reusable in Dashboard, Profile, and Progress Hub.
 */
import React from 'react';

const INTENSITY_CLASSES = [
  'bg-surface-secondary',
  'bg-brand-500/20',
  'bg-brand-500/40',
  'bg-brand-500/65',
  'bg-brand-500',
];

function getIntensity(count) {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function LearningHeatmap({ heatmapDays = [], className = '' }) {
  const grouped = [];
  let week = [];

  // Pad to start on correct weekday
  if (heatmapDays.length > 0) {
    const firstDay = new Date(heatmapDays[0].date).getDay();
    for (let i = 0; i < firstDay; i++) {
      week.push(null);
    }
  }

  for (const day of heatmapDays) {
    week.push(day);
    if (week.length === 7) {
      grouped.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    grouped.push(week);
  }

  return (
    <div className={`${className}`}>
      <div className="flex gap-0.5 mb-1">
        {DAYS.map((d, i) => (
          <div key={i} className="w-[14px] text-center text-[9px] text-text/25 font-bold">{d}</div>
        ))}
      </div>
      <div className="flex flex-col gap-0.5">
        {grouped.map((week, wi) => (
          <div key={wi} className="flex gap-0.5">
            {week.map((day, di) => {
              if (!day) {
                return <div key={di} className="w-[14px] h-[14px]" />;
              }
              const level = getIntensity(day.count);
              const dateStr = day.date instanceof Date
                ? day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : '';
              return (
                <div
                  key={di}
                  title={`${dateStr}: ${day.count} activities`}
                  className={`w-[14px] h-[14px] rounded-[3px] transition-colors ${INTENSITY_CLASSES[level]}`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-2 justify-end">
        <span className="text-[9px] text-text/30 font-semibold">Less</span>
        {INTENSITY_CLASSES.map((cls, i) => (
          <div key={i} className={`w-3 h-3 rounded-[2px] ${cls}`} />
        ))}
        <span className="text-[9px] text-text/30 font-semibold">More</span>
      </div>
    </div>
  );
}

export default LearningHeatmap;
