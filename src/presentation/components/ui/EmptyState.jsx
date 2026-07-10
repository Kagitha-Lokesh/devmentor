import React from 'react';
import { Button } from './Button';

export function EmptyState({
  title = 'No results found',
  description = 'Try adjusting your filters or search terms to find what you are looking for.',
  icon: Icon,
  actionLabel,
  onActionClick,
  className = '',
  ...props
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-surface-border rounded-xl bg-surface-secondary/40 max-w-md mx-auto ${className}`}
      {...props}
    >
      {Icon && (
        <div className="p-3.5 bg-surface rounded-full border border-surface-border text-text/60 mb-4 shadow-sm animate-pulse-soft">
          <Icon className="w-6 h-6 stroke-[1.5]" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-text mb-1">
        {title}
      </h3>
      <p className="text-xs text-text/60 leading-relaxed mb-5">
        {description}
      </p>
      {actionLabel && onActionClick && (
        <Button onClick={onActionClick} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
