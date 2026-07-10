import React, { useId } from 'react';

export function Switch({
  label,
  id,
  checked,
  onChange,
  disabled = false,
  className = '',
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text/85 select-none cursor-pointer">
          {label}
        </label>
      )}
      <button
        id={inputId}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        onKeyDown={handleKeyDown}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:ring-offset-2 ${
          checked ? 'bg-brand-600' : 'bg-surface-tertiary'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        {...props}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export default Switch;
