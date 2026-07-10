import React from 'react';

export function Divider({
  className = '',
  orientation = 'horizontal', // 'horizontal' | 'vertical'
  ...props
}) {
  const isHorizontal = orientation === 'horizontal';
  return (
    <div
      role="none"
      className={`bg-surface-border shrink-0 ${
        isHorizontal ? 'h-[1px] w-full my-4' : 'w-[1px] h-full mx-4'
      } ${className}`}
      {...props}
    />
  );
}

export default Divider;
