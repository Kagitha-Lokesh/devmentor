import React, { useId } from 'react';

export function Radio({
  label,
  id,
  name,
  value,
  checked,
  onChange,
  disabled = false,
  className = '',
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="flex items-center gap-3">
      <input
        id={inputId}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={`w-4 h-4 text-brand-600 border-surface-border focus:ring-brand-500/20 focus:ring-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
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

export default Radio;
