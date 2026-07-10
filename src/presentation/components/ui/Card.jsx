import React from 'react';

/**
 * Standardized Design System Card component.
 * Supports default, hoverable, and interactive variants.
 * Handles key down keyboard actions when configured as interactive button role.
 */
export function Card({
  children,
  onClick,
  variant = 'default', // 'default' | 'hover' | 'interactive'
  className = '',
  role,
  tabIndex,
  ...props
}) {
  const baseStyle = "bg-surface border border-surface-border rounded-xl p-5 shadow-sm transition-all duration-200 ease-out";
  
  const variants = {
    default: "",
    hover: "hover:border-brand-500 hover:shadow-md hover:translate-y-[-1px] cursor-pointer",
    interactive: "hover:border-brand-500 hover:bg-surface-secondary active:bg-surface-tertiary cursor-pointer active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
  };

  const isInteractive = variant === 'interactive' || !!onClick;
  const currentVariant = variants[variant] || (isInteractive ? variants.interactive : variants.default);

  const handleKeyDown = (e) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      role={role || (isInteractive ? 'button' : undefined)}
      tabIndex={tabIndex ?? (isInteractive ? 0 : undefined)}
      className={`${baseStyle} ${currentVariant} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
