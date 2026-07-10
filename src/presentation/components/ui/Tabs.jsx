import React from 'react';

/**
 * Standardized Design System Tabs component.
 * Handles keyboard-only tab navigation, focus outlines, and active style transitions.
 */
export function Tabs({
  tabs = [], // [{ id, label, icon: Icon }]
  activeTab,
  onChange,
  className = '',
  ...props
}) {
  const handleKeyDown = (e, index) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    onChange(tabs[nextIndex].id);
    
    // Focus the target tab button
    const btn = document.getElementById(`tab-btn-${tabs[nextIndex].id}`);
    btn?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label="Content Tabs"
      className={`flex items-center gap-1 p-1 bg-surface-secondary border border-surface-border rounded-lg max-w-full overflow-x-auto ${className}`}
      {...props}
    >
      {tabs.map((tab, idx) => {
        const isActive = tab.id === activeTab;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            id={`tab-btn-${tab.id}`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tab-panel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20 focus-visible:bg-surface transition-all duration-[var(--duration-fast)] shrink-0 min-h-[40px] sm:min-h-[auto] ${
              isActive
                ? 'bg-surface text-brand-600 shadow-sm border border-surface-border dark:text-brand-300'
                : 'text-text/65 hover:text-text hover:bg-surface-secondary/70'
            }`}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
