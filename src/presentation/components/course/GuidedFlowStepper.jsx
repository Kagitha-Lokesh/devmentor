/**
 * GuidedFlowStepper — Learning OS horizontal step indicator
 * Shows the 6-step learning flow and auto-highlights current position.
 */
import React from 'react';
import { BookOpen, Code, HelpCircle, Layers, CheckCircle, BookMarked } from 'lucide-react';

const STEPS = [
  { id: 'lesson',     label: 'Lesson',     icon: BookOpen,     tab: 'lesson' },
  { id: 'examples',   label: 'Practice',   icon: Code,         tab: 'examples' },
  { id: 'quiz',       label: 'Quiz',       icon: HelpCircle,   tab: 'quiz' },
  { id: 'flashcards', label: 'Flashcards', icon: Layers,       tab: 'flashcards' },
  { id: 'interview',  label: 'Interview',  icon: BookMarked,   tab: 'interview' },
  { id: 'complete',   label: 'Complete',   icon: CheckCircle,  tab: null },
];

function resolveStepStatus(stepId, progress) {
  if (!progress) return 'upcoming';
  switch (stepId) {
    case 'lesson':
      if (progress.lessonCompleted) return 'done';
      if (progress.readingPercentage > 0) return 'active';
      return 'upcoming';
    case 'examples':
      if (progress.practiceCompleted) return 'done';
      if (progress.lessonCompleted) return 'active';
      return 'upcoming';
    case 'quiz':
      if (progress.quizPassed) return 'done';
      if (progress.practiceCompleted) return 'active';
      return 'upcoming';
    case 'flashcards':
      if (progress.flashcardsReviewed) return 'done';
      if (progress.quizPassed) return 'active';
      return 'upcoming';
    case 'interview':
      if (progress.isFullyComplete) return 'done';
      if (progress.flashcardsReviewed) return 'active';
      return 'upcoming';
    case 'complete':
      return progress.isFullyComplete ? 'done' : 'upcoming';
    default:
      return 'upcoming';
  }
}

export function GuidedFlowStepper({ progress, activeTab, onStepClick }) {
  return (
    <div className="flex items-center gap-0 mb-6 overflow-x-auto scrollbar-hide" role="list" aria-label="Learning flow progress">
      {STEPS.map((step, i) => {
        const status = resolveStepStatus(step.id, progress);
        const isActive = activeTab === step.tab || (step.tab === null && progress?.isFullyComplete);
        const Icon = step.icon;
        const isClickable = step.tab && (status === 'done' || status === 'active');

        return (
          <React.Fragment key={step.id}>
            <button
              role="listitem"
              aria-current={isActive ? 'step' : undefined}
              onClick={() => isClickable && onStepClick && onStepClick(step.tab)}
              disabled={!isClickable}
              className={`
                flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-[70px] transition-all duration-200
                ${isActive
                  ? 'bg-brand-500/15 text-brand-500'
                  : status === 'done'
                  ? 'text-emerald-500 hover:bg-emerald-500/10 cursor-pointer'
                  : 'text-text/30 cursor-default'}
              `}
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
                ${status === 'done'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : isActive
                  ? 'border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/20'
                  : 'border-text/15 bg-surface-secondary'}
              `}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                {step.label}
              </span>
            </button>

            {i < STEPS.length - 1 && (
              <div className={`
                h-0.5 flex-1 min-w-[16px] transition-colors duration-300
                ${resolveStepStatus(STEPS[i + 1].id, progress) !== 'upcoming' || status === 'done'
                  ? 'bg-brand-500/30'
                  : 'bg-surface-border'}
              `} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default GuidedFlowStepper;
