import React from 'react';

export function Badge({
  children,
  variant = 'brand', // 'brand' | 'success' | 'warning' | 'error' | 'xp' | 'neutral'
  className = '',
  ...props
}) {
  const baseStyle = "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border transition-all select-none";

  const variants = {
    brand: "bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950 dark:text-brand-300 dark:border-brand-900",
    success: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-900",
    warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
    error: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900",
    xp: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-900",
    neutral: "bg-surface-secondary text-text/70 border-surface-border"
  };

  const currentVariant = variants[variant] || variants.brand;

  return (
    <span className={`${baseStyle} ${currentVariant} ${className}`} {...props}>
      {children}
    </span>
  );
}

export default Badge;
