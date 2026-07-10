import React from 'react';

/**
 * Standardized Design System Button component.
 * Supports primary, secondary, danger, outline, ghost, icon variants.
 * Handles disabled, loading, responsive touch targets, and full keyboard focus accessibility.
 */
export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'icon'
  size = 'md',        // 'sm' | 'md' | 'lg'
  isLoading = false,
  isDisabled = false,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  ...props
}) {
  const baseStyle = "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 ease-out cursor-pointer select-none active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 min-h-[44px] sm:min-h-[auto]";
  
  const variants = {
    primary: "bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white shadow-sm",
    secondary: "bg-surface hover:bg-surface-secondary active:bg-surface-tertiary text-text border border-surface-border",
    danger: "bg-red-600 hover:bg-red-500 active:bg-red-700 text-white shadow-sm",
    ghost: "hover:bg-surface-secondary active:bg-surface-tertiary text-text/85 hover:text-text",
    outline: "bg-transparent hover:bg-surface-secondary text-text border border-surface-border",
    icon: "p-2 hover:bg-surface-secondary text-text/80 hover:text-text rounded-lg min-h-[44px]"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3 text-base"
  };

  const currentVariant = variants[variant] || variants.primary;
  const currentSize = size === 'md' && variant === 'icon' ? '' : (sizes[size] || sizes.md);

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled || isLoading}
      className={`${baseStyle} ${currentVariant} ${currentSize} ${className}`}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!isLoading && Icon && iconPosition === 'left' && <Icon className="w-4 h-4 stroke-[2]" />}
      {children}
      {!isLoading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4 stroke-[2]" />}
    </button>
  );
}

export default Button;
