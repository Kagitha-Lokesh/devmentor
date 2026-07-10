import React from 'react';

export function Skeleton({
  className = '',
  ...props
}) {
  return (
    <div
      className={`bg-surface-tertiary rounded relative overflow-hidden animate-pulse ${className}`}
      {...props}
    >
      <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_1.6s_infinite]" />
    </div>
  );
}

export default Skeleton;
