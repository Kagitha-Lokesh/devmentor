import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  Briefcase, BrainCircuit, BarChart3, Bookmark, Clock,
  Play, ChevronRight, Target, Flame, CheckCircle2,
  AlertCircle, Building2, Code2, Users, Layers, TrendingUp
} from 'lucide-react';
import { container } from '../../../infrastructure/di/container';
import { useAuthStore } from '../../store/useAuthStore';

const CATEGORY_META = {
  Technical: { label: 'Technical', icon: Code2, color: 'text-sky-400', bg: 'bg-sky-950', border: 'border-sky-900' },
  Behavioral: { label: 'Behavioral', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-950', border: 'border-emerald-900' },
  SystemDesign: { label: 'System Design', icon: Layers, color: 'text-violet-400', bg: 'bg-violet-950', border: 'border-violet-900' },
  HR: { label: 'HR / Fit', icon: Briefcase, color: 'text-amber-400', bg: 'bg-amber-950', border: 'border-amber-900' },
};

const DIFFICULTY_BADGE = {
  FAANG: 'text-red-400 bg-red-950 border-red-800',
  Product: 'text-orange-400 bg-orange-950 border-orange-800',
  Service: 'text-green-400 bg-green-950 border-green-800',
};

export default function Interviews() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const uid = user?.uid || 'anonymous';

  const [isLoading, setIsLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [manifest, setManifest] = useState(null);

  const interviewUseCase = container.resolve('InterviewUseCase');

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [companiesData, statsData, sessionsData] = await Promise.all([
          interviewUseCase.getCompanies(),
          interviewUseCase.getStatistics(uid),
          interviewUseCase.listSessions(uid),
        ]);
        setCompanies(companiesData);
        setStats(statsData);
        setSessions(sessionsData);

        // Load manifest from generated file
        const mf = await fetch('/generated/interview-manifest.json')
          .then(r => r.json())
          .catch(() => null);
        setManifest(mf);
      } catch (err) {
        console.warn('[Interviews] Load error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [uid]);

  // If a sub-route is active, render its content via Outlet
  const isSubRoute = location.pathname !== '/interviews' && !location.pathname.endsWith('/interviews/');
  if (isSubRoute) {
    return <Outlet />;
  }

  if (isLoading) {
    return <InterviewsDashboardSkeleton />;
  }

  const readinessScore = stats
    ? Math.min(100, Math.round((stats.sessionsCompleted * 5) + (stats.averageConfidence * 10)))
    : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="relative bg-surface-secondary border border-surface-border rounded-2xl p-6 md:p-8 overflow-hidden shadow-xl">
        <div className="absolute top-[-20%] right-[-10%] w-[280px] h-[280px] bg-violet-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-950 border border-violet-800 rounded-full text-violet-300 text-xs font-semibold mb-3">
              <BrainCircuit className="h-3 w-3" />
              <span>Interview Preparation Platform</span>
            </div>
            <h1 className="text-3xl font-extrabold text-text tracking-tight">Mock Interview Engine</h1>
            <p className="text-text/60 mt-2 text-sm max-w-xl">
              Prepare systematically with company-specific tracks, STAR-format behavioral scenarios, system design fundamentals, and deterministic self-evaluation.
            </p>
          </div>
          <div className="shrink-0 flex gap-4 w-full md:w-auto">
            <div className="flex-1 md:flex-initial bg-surface border border-surface-border rounded-xl p-4 text-center min-w-[120px]">
              <div className="text-xs text-text/40 font-medium">Readiness</div>
              <div className="text-2xl font-extrabold text-violet-400 mt-1">{readinessScore}%</div>
            </div>
            <div className="flex-1 md:flex-initial bg-surface border border-surface-border rounded-xl p-4 text-center min-w-[120px]">
              <div className="text-xs text-text/40 font-medium">Sessions</div>
              <div className="text-2xl font-extrabold text-text mt-1">{stats?.sessionsCompleted || 0}</div>
            </div>
            <div className="flex-1 md:flex-initial bg-surface border border-surface-border rounded-xl p-4 text-center min-w-[120px]">
              <div className="text-xs text-text/40 font-medium">Answered</div>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">{stats?.questionsAnswered || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Stat Bar ─────────────────────────────────────────────── */}
      {manifest && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Company Tracks', value: manifest.companiesCount, icon: Building2, color: 'text-violet-400', bg: 'bg-violet-950', border: 'border-violet-900' },
            { label: 'Total Questions', value: manifest.totalQuestions, icon: BrainCircuit, color: 'text-sky-400', bg: 'bg-sky-950', border: 'border-sky-900' },
            { label: 'Behavioral Scenarios', value: manifest.behavioralCount, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-950', border: 'border-emerald-900' },
            { label: 'System Design', value: manifest.systemDesignCount, icon: Layers, color: 'text-amber-400', bg: 'bg-amber-950', border: 'border-amber-900' },
          ].map(({ label, value, icon: Icon, color, bg, border }) => (
            <div key={label} className="bg-surface-secondary border border-surface-border rounded-xl p-4 flex items-center gap-4">
              <div className={`p-3 ${bg} ${color} border ${border} rounded-lg`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-text/40 uppercase font-bold tracking-wider block">{label}</span>
                <h4 className="text-lg font-bold text-text">{value}</h4>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Main Grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT: Company Tracks + Practice Modes */}
        <div className="lg:col-span-2 space-y-8">

          {/* Company Tracks */}
          <div className="bg-surface-secondary border border-surface-border rounded-2xl p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-text flex items-center gap-2">
                <Building2 className="h-5 w-5 text-violet-400" />
                Company Preparation Tracks
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {companies.map((company) => (
                <div
                  key={company.id}
                  onClick={() => navigate(`/interviews/company/${company.id}`)}
                  className="group p-4 bg-surface border border-surface-border hover:border-violet-500 rounded-xl cursor-pointer transition-all hover:shadow-lg hover:shadow-violet-500/5"
                  role="button"
                  aria-label={`Open ${company.name} preparation track`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-text text-sm">{company.name}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${DIFFICULTY_BADGE[company.difficulty] || DIFFICULTY_BADGE.Service}`}>
                      {company.difficulty}
                    </span>
                  </div>
                  <div className="text-[10px] text-text/40 font-semibold uppercase tracking-wider mb-2">
                    ~{company.estimatedPreparationHours}h prep
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(company.focus || []).slice(0, 3).map((f) => (
                      <span key={f} className="text-[9px] px-2 py-0.5 rounded-full bg-surface-secondary border border-surface-border text-text/50 font-medium">
                        {f}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] text-text/30 font-mono">
                      {(company.rounds || []).length} rounds
                    </div>
                    <ChevronRight className="h-4 w-4 text-text/20 group-hover:text-violet-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Practice Modes */}
          <div className="bg-surface-secondary border border-surface-border rounded-2xl p-6">
            <h2 className="text-lg font-bold text-text flex items-center gap-2 mb-5">
              <Target className="h-5 w-5 text-brand-400" />
              Practice by Category
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(CATEGORY_META).map(([key, meta]) => {
                const Icon = meta.icon;
                const count = manifest ? manifest[`${key.toLowerCase()}Count`] || manifest[`${key}Count`] : 0;
                return (
                  <div
                    key={key}
                    onClick={() => navigate('/interviews/session/new', { state: { mode: key, trackId: 'general', trackName: meta.label } })}
                    className="group flex items-center gap-4 p-4 bg-surface border border-surface-border hover:border-brand-500 rounded-xl cursor-pointer transition-all"
                    role="button"
                    aria-label={`Start ${meta.label} practice`}
                  >
                    <div className={`p-3 ${meta.bg} ${meta.color} border ${meta.border} rounded-lg shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-text text-sm">{meta.label}</h3>
                      <p className="text-[10px] text-text/40 mt-0.5">{count || '—'} questions available</p>
                    </div>
                    <Play className="h-4 w-4 text-text/20 group-hover:text-brand-400 transition-colors shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT: Stats + Recent Sessions */}
        <div className="space-y-6">

          {/* Readiness Breakdown */}
          <div className="bg-surface-secondary border border-surface-border rounded-2xl p-6">
            <h3 className="text-sm font-bold text-text flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-brand-400" />
              Category Progress
            </h3>
            {stats && Object.entries(CATEGORY_META).map(([key, meta]) => {
              const Icon = meta.icon;
              const count = stats.categoryBreakdown?.[key] || 0;
              const total = manifest ? (manifest[`${key.toLowerCase()}Count`] || manifest[`${key}Count`] || 1) : 1;
              const pct = Math.min(100, Math.round((count / total) * 100));
              return (
                <div key={key} className="mb-4">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-text/80 mb-1.5">
                    <span className={`flex items-center gap-1.5 ${meta.color}`}>
                      <Icon className="h-3.5 w-3.5" />
                      {meta.label}
                    </span>
                    <span>{count} answered</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface border border-surface-border rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-brand-500 rounded-full transition-all"
                    />
                  </div>
                </div>
              );
            })}
            <div className="mt-4 pt-4 border-t border-surface-border space-y-2 text-xs">
              <div className="flex justify-between text-text/60">
                <span>Avg Confidence</span>
                <span className="font-bold text-text">{stats ? (stats.averageConfidence * 20).toFixed(0) : 0}%</span>
              </div>
              <div className="flex justify-between text-text/60">
                <span>Avg Self-Rating</span>
                <span className="font-bold text-text">{stats ? stats.averageSelfRating.toFixed(1) : '—'} / 5</span>
              </div>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="bg-surface-secondary border border-surface-border rounded-2xl p-6">
            <h3 className="text-sm font-bold text-text flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-brand-400" />
              Recent Sessions
            </h3>
            {sessions.length === 0 ? (
              <p className="text-xs text-text/40 italic text-center py-4">No sessions completed yet. Start your first mock interview!</p>
            ) : (
              <div className="space-y-3">
                {sessions.slice(0, 5).map((s) => (
                  <div
                    key={s.id}
                    className="flex gap-3 items-start p-2.5 bg-surface/50 border border-surface-border rounded-xl"
                  >
                    <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <div className="text-xs">
                      <span className="font-bold text-text block">{s.trackName}</span>
                      <span className="text-text/40 text-[10px] block mt-0.5">
                        {Object.keys(s.answers || {}).length} answered
                        {s.completedAt ? ` · ${new Date(s.completedAt).toLocaleDateString()}` : ' · In progress'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Start */}
          <div className="bg-gradient-to-br from-violet-900/30 to-slate-950 border border-violet-700/60 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-amber-400" />
              <h3 className="text-sm font-bold text-text">Quick Practice</h3>
            </div>
            <p className="text-xs text-text/50 leading-relaxed">
              15-minute mixed session — 10 questions across all categories.
            </p>
            <button
              onClick={() => navigate('/interviews/session/new', {
                state: { mode: 'Mixed', trackId: 'general', trackName: 'Quick Practice', count: 10 }
              })}
              className="w-full btn-primary py-3 text-sm font-bold cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="h-4 w-4 fill-current" />
              Begin Quick Session
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

function InterviewsDashboardSkeleton() {
  return (
    <div className="space-y-8 pb-12 animate-pulse">
      <div className="h-44 bg-surface-secondary border border-surface-border rounded-2xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-20 bg-surface-secondary border border-surface-border rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 bg-surface-secondary border border-surface-border rounded-2xl" />
          <div className="h-48 bg-surface-secondary border border-surface-border rounded-2xl" />
        </div>
        <div className="space-y-4">
          <div className="h-56 bg-surface-secondary border border-surface-border rounded-2xl" />
          <div className="h-40 bg-surface-secondary border border-surface-border rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
