import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock, CheckCircle2, Star, Target, Zap, BookOpen, Terminal, FolderGit2, MessageSquare } from 'lucide-react';
import { useAchievementsStore } from '../../store/useAchievementsStore';
import { useAuthStore } from '../../store/useAuthStore';

const CATEGORY_ICONS = {
  learning: BookOpen, coding: Terminal, projects: FolderGit2,
  interviews: MessageSquare, streak: Zap, social: Star,
};

const RARITY_STYLES = {
  common: 'border-surface-border text-text/50',
  uncommon: 'border-green-700/60 text-green-400',
  rare: 'border-brand-700/60 text-brand-400',
  epic: 'border-purple-700/60 text-purple-400',
  legendary: 'border-yellow-700/60 text-yellow-400',
};

const RARITY_GLOW = {
  common: '',
  uncommon: 'shadow-green-900/30',
  rare: 'shadow-brand-900/30',
  epic: 'shadow-purple-900/30',
  legendary: 'shadow-yellow-900/30',
};

function AchievementCard({ achievement }) {
  const pct = achievement.target > 0 ? Math.min(100, (achievement.progress / achievement.target) * 100) : 0;
  const isComplete = pct >= 100;
  const rarity = achievement.rarity || 'common';
  const CategoryIcon = CATEGORY_ICONS[achievement.category] || Trophy;
  const rarityStyle = RARITY_STYLES[rarity] || RARITY_STYLES.common;
  const glowClass = isComplete ? RARITY_GLOW[rarity] : '';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative p-5 border rounded-2xl transition-all duration-300 ${
        isComplete
          ? `bg-gradient-to-br from-surface-secondary to-surface border-current/20 shadow-lg ${glowClass} ${rarityStyle}`
          : 'bg-surface-secondary border-surface-border opacity-70'
      }`}
    >
      {/* Completed Badge */}
      {isComplete && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 className="h-5 w-5 text-green-400" aria-label="Completed" />
        </div>
      )}
      {!isComplete && pct === 0 && (
        <div className="absolute top-3 right-3">
          <Lock className="h-4 w-4 text-text/20" aria-label="Locked" />
        </div>
      )}

      {/* Icon */}
      <div className={`inline-flex p-3 rounded-xl mb-3 border ${rarityStyle} bg-surface/50`}>
        {isComplete
          ? <Trophy className="h-6 w-6" aria-hidden="true" />
          : <CategoryIcon className="h-6 w-6 text-text/30" aria-hidden="true" />}
      </div>

      <h3 className={`text-sm font-bold mb-1 ${isComplete ? '' : 'text-text/50'}`}>{achievement.title}</h3>
      <p className={`text-xs mb-3 leading-relaxed ${isComplete ? 'text-text/60' : 'text-text/30'}`}>{achievement.description}</p>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px]">
          <span className={isComplete ? 'text-text/50' : 'text-text/30'}>
            {achievement.progress} / {achievement.target}
          </span>
          <span className={isComplete ? 'font-bold' : 'text-text/30'}>{Math.round(pct)}%</span>
        </div>
        <div className="h-1.5 bg-surface rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
            className={`h-full rounded-full ${isComplete ? 'bg-gradient-to-r from-brand-600 to-brand-400' : 'bg-surface-tertiary'}`}
          />
        </div>
      </div>

      {/* Rarity Badge */}
      <div className="mt-3 flex items-center justify-between">
        <span className={`text-[10px] uppercase tracking-widest font-semibold ${rarityStyle} px-2 py-0.5 rounded-full border`}>
          {rarity}
        </span>
        {achievement.completionDate && (
          <span className="text-[10px] text-text/25">
            {new Date(achievement.completionDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function AchievementsPage() {
  const { user } = useAuthStore();
  const { achievements, isLoading, loadAchievements } = useAchievementsStore();

  useEffect(() => {
    if (user?.uid) loadAchievements(user.uid);
  }, [user?.uid]);

  const completed = achievements.filter(a => (a.progress / (a.target || 1)) >= 1);
  const inProgress = achievements.filter(a => a.progress > 0 && (a.progress / (a.target || 1)) < 1);
  const locked = achievements.filter(a => a.progress === 0);
  const totalPct = achievements.length > 0 ? Math.round((completed.length / achievements.length) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Achievements</h1>
        <p className="text-sm text-text/50 mt-0.5">Track your milestones and celebrate your progress.</p>
      </div>

      {/* Summary Banner */}
      {!isLoading && achievements.length > 0 && (
        <div className="p-6 bg-gradient-to-r from-brand-950 via-purple-950/30 to-surface-secondary border border-brand-800/40 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-900/50 border border-brand-700/50 rounded-xl">
                <Trophy className="h-6 w-6 text-brand-300" />
              </div>
              <div>
                <p className="text-sm font-bold text-text">{completed.length} of {achievements.length} Unlocked</p>
                <p className="text-xs text-text/40">{inProgress.length} in progress</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-brand-300">{totalPct}%</div>
              <div className="text-xs text-text/40">completion</div>
            </div>
          </div>
          <div className="h-2 bg-surface/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${totalPct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-brand-600 to-purple-500 rounded-full"
            />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-16 text-text/30 text-sm">Loading achievements...</div>
      ) : achievements.length === 0 ? (
        <div className="text-center py-20 text-text/30">
          <Trophy className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No achievements defined yet.</p>
        </div>
      ) : (
        <>
          {/* In Progress */}
          {inProgress.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-4 w-4 text-brand-400" />
                <h2 className="text-sm font-semibold text-text">In Progress ({inProgress.length})</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {inProgress.map(a => <AchievementCard key={a.id} achievement={a} />)}
              </div>
            </section>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <h2 className="text-sm font-semibold text-text">Completed ({completed.length})</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {completed.map(a => <AchievementCard key={a.id} achievement={a} />)}
              </div>
            </section>
          )}

          {/* Locked */}
          {locked.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Lock className="h-4 w-4 text-text/30" />
                <h2 className="text-sm font-semibold text-text/50">Locked ({locked.length})</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {locked.map(a => <AchievementCard key={a.id} achievement={a} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
