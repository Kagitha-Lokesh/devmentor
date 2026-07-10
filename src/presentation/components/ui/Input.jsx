import React, { useId } from 'react';

/**
 * Standardized Input component.
 * Includes label, helper text, error styling, custom class merges, and touch-target sizing.
 */
export function Input({
  label,
  error,
  helperText,
  id,
  type = 'text',
  className = '',
  required = false,
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
      <input
        id={inputId}
        type={type}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : (helperText ? helperId : undefined)}
        className={`w-full px-3 py-2.5 bg-surface border border-surface-border rounded-lg text-text placeholder:text-text/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-150 ease-out min-h-[44px] ${
          error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
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

export default Input;
