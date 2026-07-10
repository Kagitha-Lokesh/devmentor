/**
 * TopicCompletionModal — Learning OS dopamine-boosting completion overlay
 * Shown when all topic objectives are complete (lesson + practice + quiz).
 * Animated entrance with XP, mastery, progress updates, and next topic CTA.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Zap, TrendingUp, Star, ArrowRight, X } from 'lucide-react';

function AnimatedNumber({ target, duration = 1200 }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - pct, 3);
      setValue(Math.round(eased * target));
      if (pct < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return <span className="tabular-nums">{value}</span>;
}

export function TopicCompletionModal({
  isOpen,
  onClose,
  topic,
  masteryScore,
  xpEarned = 120,
  moduleProgress,
  overallProgress,
  achievementsUnlocked = 0,
  nextTopic,
  onNextTopic
}) {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    onClose();
    if (nextTopic) {
      onNextTopic?.();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Topic Complete"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <div
        className="relative bg-surface rounded-2xl border border-surface-border shadow-2xl max-w-md w-full p-8 animate-[completionPop_0.4s_cubic-bezier(0.34,1.56,0.64,1)_both]"
        style={{
          ['--tw-shadow']: '0 25px 60px rgba(0,0,0,0.5)'
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text/30 hover:text-text/70 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center mx-auto mb-4 animate-[scaleBounce_0.5s_0.2s_both]">
            <CheckCircle className="h-10 w-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-text">Topic Complete!</h2>
          {topic && (
            <p className="text-text/50 text-sm mt-1">{topic.title}</p>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-surface-secondary rounded-xl p-3 text-center border border-surface-border">
            <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
              <Zap className="h-4 w-4" />
            </div>
            <div className="text-2xl font-black text-amber-400">
              +<AnimatedNumber target={xpEarned} />
            </div>
            <div className="text-[10px] font-semibold text-text/40 uppercase tracking-wider mt-0.5">XP</div>
          </div>

          <div className="bg-surface-secondary rounded-xl p-3 text-center border border-surface-border">
            <div className="flex items-center justify-center gap-1 text-brand-500 mb-1">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-2xl font-black text-brand-500">
              <AnimatedNumber target={masteryScore || 0} />%
            </div>
            <div className="text-[10px] font-semibold text-text/40 uppercase tracking-wider mt-0.5">Mastery</div>
          </div>

          <div className="bg-surface-secondary rounded-xl p-3 text-center border border-surface-border">
            <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
              <Star className="h-4 w-4" />
            </div>
            <div className="text-2xl font-black text-purple-400">
              +{achievementsUnlocked}
            </div>
            <div className="text-[10px] font-semibold text-text/40 uppercase tracking-wider mt-0.5">Badges</div>
          </div>
        </div>

        {/* Progress bars */}
        {(moduleProgress != null || overallProgress != null) && (
          <div className="space-y-3 mb-6">
            {moduleProgress != null && (
              <div>
                <div className="flex justify-between text-xs font-semibold text-text/50 mb-1.5">
                  <span>Module Progress</span>
                  <span><AnimatedNumber target={moduleProgress} />%</span>
                </div>
                <div className="h-2 bg-surface-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${moduleProgress}%` }}
                  />
                </div>
              </div>
            )}
            {overallProgress != null && (
              <div>
                <div className="flex justify-between text-xs font-semibold text-text/50 mb-1.5">
                  <span>Full Stack Progress</span>
                  <span><AnimatedNumber target={overallProgress} />%</span>
                </div>
                <div className="h-2 bg-surface-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Next topic */}
        {nextTopic && (
          <div className="border border-surface-border rounded-xl p-3 mb-4 bg-surface-secondary/50">
            <p className="text-xs text-text/40 font-semibold uppercase tracking-wider mb-1">Up Next</p>
            <p className="font-bold text-text text-sm">{nextTopic.title}</p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleNext}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-500 text-primary font-bold hover:bg-brand-600 active:scale-95 transition-all shadow-lg shadow-brand-500/25"
        >
          {nextTopic ? 'Continue →' : 'Back to Roadmap'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <style>{`
        @keyframes completionPop {
          from { opacity: 0; transform: scale(0.85) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes scaleBounce {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default TopicCompletionModal;
