/**
 * TodaysQueue — Learning OS ordered task queue
 * Shows the day's prioritized learning tasks, each one a clickable card
 * that navigates to the correct route and tab automatically.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Code, HelpCircle, Layers, ArrowRight, Play, CheckCircle } from 'lucide-react';

const ICON_MAP = {
  BookOpen,
  Code,
  HelpCircle,
  Layers,
  ArrowRight,
};

const TYPE_COLORS = {
  lesson:     { bg: 'bg-blue-500/10',    border: 'border-blue-500/20',   text: 'text-blue-500',   dot: 'bg-blue-500' },
  practice:   { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20',text: 'text-emerald-500',dot: 'bg-emerald-500' },
  quiz:       { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',  text: 'text-amber-500',  dot: 'bg-amber-500' },
  flashcards: { bg: 'bg-purple-500/10',  border: 'border-purple-500/20', text: 'text-purple-500', dot: 'bg-purple-500' },
  interview:  { bg: 'bg-pink-500/10',    border: 'border-pink-500/20',   text: 'text-pink-500',   dot: 'bg-pink-500' },
  next:       { bg: 'bg-brand-500/10',   border: 'border-brand-500/20',  text: 'text-brand-500',  dot: 'bg-brand-500' },
};

export function TodaysQueue({ queue = [], completedIds = new Set() }) {
  const navigate = useNavigate();

  if (queue.length === 0) {
    return (
      <div className="text-center py-6">
        <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
        <p className="text-sm font-bold text-emerald-500">Today's queue is clear!</p>
        <p className="text-xs text-text/40 mt-1">Great work. Keep the streak going tomorrow.</p>
      </div>
    );
  }

  return (
    <ol className="space-y-2" aria-label="Today's learning queue">
      {queue.map((item, i) => {
        const colors = TYPE_COLORS[item.type] || TYPE_COLORS.next;
        const Icon = ICON_MAP[item.icon] || ArrowRight;
        const isDone = completedIds.has(item.topicId + item.type);

        return (
          <li key={`${item.topicId}-${item.type}`}>
            <button
              onClick={() => navigate(`${item.route}${item.tab ? `?tab=${item.tab}` : ''}`)}
              disabled={isDone}
              className={`
                w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all duration-200
                ${isDone
                  ? 'opacity-50 cursor-default bg-surface-secondary border-surface-border'
                  : `${colors.bg} ${colors.border} hover:scale-[1.01] hover:shadow-sm cursor-pointer`
                }
              `}
              aria-label={item.title}
            >
              {/* Step number */}
              <span className={`
                w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0
                ${isDone ? 'bg-emerald-500/20 text-emerald-500' : `${colors.bg} ${colors.text}`}
              `}>
                {isDone ? '✓' : i + 1}
              </span>

              {/* Icon */}
              <Icon className={`h-4 w-4 flex-shrink-0 ${isDone ? 'text-text/30' : colors.text}`} />

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate ${isDone ? 'text-text/40 line-through' : 'text-text'}`}>
                  {item.title}
                </p>
                {item.subtitle && (
                  <p className="text-xs text-text/40 truncate">{item.subtitle}</p>
                )}
              </div>

              {/* Arrow */}
              {!isDone && (
                <ArrowRight className={`h-4 w-4 flex-shrink-0 ${colors.text}`} />
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export default TodaysQueue;
