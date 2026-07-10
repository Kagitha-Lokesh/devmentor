import React from 'react';

export function Tooltip({
  children,
  content,
  position = 'top', // 'top' | 'bottom' | 'left' | 'right'
  className = '',
  ...props
}) {
  if (!content) return children;

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2"
  };

  const currentPosition = positions[position] || positions.top;

  return (
    <div className={`relative group inline-block ${className}`} {...props}>
      {children}
      <div
        className={`absolute z-50 scale-95 opacity-0 pointer-events-none group-hover:scale-100 group-hover:opacity-100 transition-all duration-150 ease-out bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium px-2 py-1 rounded shadow-md whitespace-nowrap ${currentPosition}`}
        role="tooltip"
      >
        {content}
      </div>
    </div>
  );
}

export default Tooltip;
