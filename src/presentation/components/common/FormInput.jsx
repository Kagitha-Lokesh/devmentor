import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const FormInput = React.forwardRef((
  {
    label,
    name,
    type = 'text',
    placeholder,
    error,
    icon: Icon,
    disabled = false,
    autoComplete,
    ...rest
  },
  ref
) => {
  const inputId  = `input-${name}`;
  const errorId  = `error-${name}`;
  const isPassword = type === 'password';
  const [showPassword, setShowPassword] = useState(false);
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700"
        >
          {label}
        </label>
      )}

      <div className="relative rounded-lg shadow-sm">
        {/* Leading icon */}
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Icon className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          name={name}
          type={resolvedType}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          className={`
            w-full px-3 py-2.5 bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-50
            border rounded-lg text-sm text-slate-100 dark:text-slate-100 light:text-slate-900
            placeholder:text-slate-500 focus:outline-none transition-all duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
            ${Icon ? 'pl-10' : 'pl-3.5'}
            ${isPassword ? 'pr-10' : 'pr-3.5'}
            ${
              error
                ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-slate-800 dark:border-slate-800 light:border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
            }
          `}
          {...rest}
        />

        {/* Show / Hide password toggle */}
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(v => !v)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword
              ? <EyeOff className="h-4 w-4" aria-hidden="true" />
              : <Eye    className="h-4 w-4" aria-hidden="true" />}
          </button>
        )}
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs text-red-500 dark:text-red-400 mt-1 font-medium animate-slide-up"
        >
          {error.message || error}
        </p>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';
export default FormInput;
