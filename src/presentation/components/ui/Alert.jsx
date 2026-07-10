import React from 'react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';

export function Alert({
  title,
  description,
  variant = 'info', // 'success' | 'warning' | 'error' | 'info'
  className = '',
  ...props
}) {
  const variants = {
    success: {
      container: "bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900/60 text-green-800 dark:text-green-300",
      icon: CheckCircle2
    },
    warning: {
      container: "bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/60 text-amber-800 dark:text-amber-300",
      icon: TriangleAlert
    },
    error: {
      container: "bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900/60 text-red-800 dark:text-red-300",
      icon: AlertCircle
    },
    info: {
      container: "bg-brand-50/50 border-brand-200 dark:bg-brand-950/20 dark:border-brand-900/60 text-brand-800 dark:text-brand-300",
      icon: Info
    }
  };

  const current = variants[variant] || variants.info;
  const Icon = current.icon;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 border rounded-xl text-sm leading-relaxed ${current.container} ${className}`}
      {...props}
    >
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <div>
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        {description && <p className="opacity-90">{description}</p>}
      </div>
    </div>
  );
}

export default Alert;
