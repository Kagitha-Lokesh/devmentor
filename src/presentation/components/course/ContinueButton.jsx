/**
 * ContinueButton — Learning OS smart CTA
 * Automatically determines the next action using LearningUseCase.resolveContinueAction().
 * Never asks the user where to go next.
 */
import React from 'react';
import { ArrowRight, BookOpen, Code, HelpCircle, Layers } from 'lucide-react';
import { container } from '../../../infrastructure/di/container';

const ACTION_ICONS = {
  reading:    BookOpen,
  lesson:     BookOpen,
  practice:   Code,
  quiz:       HelpCircle,
  flashcards: Layers,
  next:       ArrowRight,
};

export function ContinueButton({ progress, topic, onTabChange, onNextTopic, className = '' }) {
  const learningUseCase = container.resolve('LearningUseCase');
  const { action, label, targetTab } = learningUseCase.resolveContinueAction(progress, topic);

  const Icon = ACTION_ICONS[action] || ArrowRight;

  const handleClick = () => {
    if (action === 'next') {
      onNextTopic?.();
    } else if (targetTab) {
      onTabChange?.(targetTab);
      // Smooth scroll to tab content
      setTimeout(() => {
        document.getElementById('tab-content-area')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm
        bg-brand-500 text-primary hover:bg-brand-600 active:scale-95
        shadow-lg shadow-brand-500/25 transition-all duration-200
        ${className}
      `}
      aria-label={label}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

export default ContinueButton;
