/**
 * LearningBreadcrumb — Learning OS navigation breadcrumb
 * Shows: Home > Course > Volume N > Chapter > Topic    N / Total
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export function LearningBreadcrumb({
  courseId = 'java',
  courseLabel = 'Java',
  volumeLabel,
  chapterLabel,
  topicTitle,
  topicIndex,
  totalTopics
}) {
  const crumbs = [
    { label: 'Home', to: '/', icon: Home },
    { label: courseLabel, to: '/courses' },
    volumeLabel ? { label: volumeLabel } : null,
    chapterLabel ? { label: chapterLabel } : null,
    topicTitle ? { label: topicTitle, current: true } : null
  ].filter(Boolean);

  return (
    <nav
      aria-label="Learning breadcrumb"
      className="flex items-center justify-between gap-2 mb-4"
    >
      <ol className="flex items-center gap-1 flex-wrap">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          const Icon = crumb.icon;
          return (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3 text-text/30 flex-shrink-0" />}
              {crumb.to && !isLast ? (
                <Link
                  to={crumb.to}
                  className="flex items-center gap-1 text-xs font-semibold text-text/40 hover:text-brand-500 transition-colors uppercase tracking-wider"
                >
                  {Icon && <Icon className="h-3 w-3" />}
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={`text-xs font-semibold uppercase tracking-wider truncate max-w-[160px] ${
                    isLast ? 'text-text/70' : 'text-text/40'
                  }`}
                >
                  {Icon && <Icon className="h-3 w-3 inline mr-1" />}
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {topicIndex != null && totalTopics != null && (
        <span className="text-xs font-bold text-text/40 whitespace-nowrap flex-shrink-0 tabular-nums">
          {topicIndex} / {totalTopics}
        </span>
      )}
    </nav>
  );
}

export default LearningBreadcrumb;
