import React from 'react';

export function SectionHeader({
  title,
  description,
  actions,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 ${className}`} {...props}>
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-text/65 mt-1">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

export default SectionHeader;
