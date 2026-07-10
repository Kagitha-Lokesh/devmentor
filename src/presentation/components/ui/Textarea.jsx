import React, { useId } from 'react';

export function Textarea({
  label,
  error,
  helperText,
  id,
  className = '',
  required = false,
  rows = 4,
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text/85 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        required={required}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : (helperText ? helperId : undefined)}
        className={`w-full px-3 py-2.5 bg-surface border border-surface-border rounded-lg text-text placeholder:text-text/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-150 ease-out min-h-[44px] ${
          error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={helperId} className="text-xs text-text/50 mt-1.5">
          {helperText}
        </p>
      )}
    </div>
  );
}

export default Textarea;
