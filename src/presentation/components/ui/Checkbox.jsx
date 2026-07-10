import React, { useId } from 'react';

export function Checkbox({
  label,
  id,
  className = '',
  checked,
  onChange,
  disabled = false,
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="flex items-start gap-3">
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={`w-4 h-4 rounded border-surface-border text-brand-600 focus:ring-brand-500/20 focus:ring-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1 ${className}`}
        {...props}
      />
      {label && (
        <label htmlFor={inputId} className="text-sm text-text/85 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
          {label}
        </label>
      )}
    </div>
  );
}

export default Checkbox;
