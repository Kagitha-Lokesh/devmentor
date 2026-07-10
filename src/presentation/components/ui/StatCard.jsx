import React from 'react';
import { Card } from './Card';

export function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  trend, // { value, isPositive }
  className = '',
  ...props
}) {
  return (
    <Card className={`relative overflow-hidden ${className}`} {...props}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-text/50 uppercase tracking-wider mb-1.5">
            {title}
          </p>
          <h4 className="text-2xl font-bold text-text mb-1">
            {value}
          </h4>
          {subtext && (
            <p className="text-xs text-text/60">
              {subtext}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`text-xs font-semibold ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-[10px] text-text/40">vs last period</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-surface-secondary border border-surface-border text-text/60 rounded-xl shadow-sm">
            <Icon className="w-5 h-5 stroke-[1.5]" />
          </div>
        )}
      </div>
    </Card>
  );
}

export default StatCard;
