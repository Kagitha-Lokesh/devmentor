import React from 'react';

export function Avatar({
  src,
  name = '',
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
  ...props
}) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base"
  };

  const currentSize = sizes[size] || sizes.md;

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-semibold border border-brand-200 dark:border-brand-900 shrink-0 select-none ${currentSize} ${className}`}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      ) : (
        <span>{initials || '?'}</span>
      )}
    </div>
  );
}

export default Avatar;
