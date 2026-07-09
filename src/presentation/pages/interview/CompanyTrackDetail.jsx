import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Play, BookOpen, MapPin, Building2, ChevronRight,
  Code2, Users, Layers, Briefcase, AlertCircle, Bookmark,
  CheckCircle2, Clock
} from 'lucide-react';
import { container } from '../../../infrastructure/di/container';
import { useAuthStore } from '../../store/useAuthStore';

const CATEGORY_META = {
  Technical: { icon: Code2, color: 'text-sky-400', bg: 'bg-sky-950/60', border: 'border-sky-900' },
  Behavioral: { icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-950/60', border: 'border-emerald-900' },
  SystemDesign: { icon: Layers, color: 'text-violet-400', bg: 'bg-violet-950/60', border: 'border-violet-900' },
  HR: { icon: Briefcase, color: 'text-amber-400', bg: 'bg-amber-950/60', border: 'border-amber-900' },
};

export default function CompanyTrackDetail() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const uid = user?.uid || 'anonymous';

  const [isLoading, setIsLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [roadmap, setRoadmap] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [bookmarks, setBookmarks] = useState(new Set());

  const interviewUseCase = container.resolve('InterviewUseCase');

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [companies, questionsData, roadmapData, bookmarkData] = await Promise.all([
          interviewUseCase.getCompanies(),
          interviewUseCase.getQuestionsByCompany(companyId),
          interviewUseCase.getRoadmap(companyId),
          interviewUseCase.getBookmarks(uid),
        ]);
        const found = companies.find(c => c.id === companyId);
        setCompany(found || { id: companyId, name: companyId, difficulty: 'Service', rounds: [] });
        setQuestions(questionsData);
        setRoadmap(roadmapData || []);
        setBookmarks(new Set(bookmarkData.map(b => b.questionId)));
      } catch (err) {
        console.warn('[CompanyTrackDetail] Load error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [companyId, uid]);

  const handleStart = async (mode = 'company') => {
    try {
      const session = await interviewUseCase.startSession(uid, {
        trackId: companyId,
        trackName: company?.name || companyId,
        mode,
        count: 15,
      });
      navigate(`/interviews/session/${session.id}`);
    } catch (err) {
      console.error('[CompanyTrackDetail] Failed to start session:', err);
    }
  };

  const handleToggleBookmark = async (questionId) => {
    const newState = await interviewUseCase.toggleBookmark(uid, questionId);
    setBookmarks(prev => {
      const updated = new Set(prev);
      if (newState) updated.add(questionId);
      else updated.delete(questionId);
      return updated;
    });
  };

  if (isLoading) return <TrackDetailSkeleton />;

  const byCategory = questions.reduce((acc, q) => {
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push(q);
    return acc;
  }, {});

  const TABS = ['overview', 'questions', 'tips'];

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/interviews')}
          className="flex items-center gap-1.5 text-xs text-text/40 hover:text-text/80 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Interview Platform
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-text/20" />
        <span className="text-xs text-text/70 font-semibold">{company?.name}</span>
      </div>

      {/* Hero Panel */}
      <div className="relative bg-surface-secondary border border-surface-border rounded-2xl p-6 md:p-8 overflow-hidden shadow-xl">
        <div className="absolute top-[-30%] right-[-5%] w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-violet-950 border border-violet-800 rounded-xl">
                <Building2 className="h-6 w-6 text-violet-300" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-text">{company?.name} Interview Track</h1>
                <span className="text-xs text-text/40 font-medium">Difficulty: {company?.difficulty}</span>
              </div>
            </div>
            <p className="text-text/60 text-sm leading-relaxed max-w-xl">
              Comprehensive preparation covering {questions.length} questions across {company?.rounds?.length || 0} rounds.
              Focus areas: {(company?.focus || []).join(', ') || 'General engineering skills'}.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {(company?.rounds || []).map(r => (
                <span key={r} className="text-[11px] px-3 py-1 rounded-full bg-surface border border-surface-border text-text/60 font-medium">
                  {r}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 shrink-0 min-w-[180px]">
            <button
              onClick={() => handleStart('company')}
              className="btn-primary py-3 flex items-center justify-center gap-2 text-sm font-bold cursor-pointer"
              id={`start-session-${companyId}`}
            >
              <Play className="h-4 w-4 fill-current" />
              Start Full Track
            </button>
            <button
              onClick={() => handleStart('Technical')}
              className="btn-secondary py-2.5 flex items-center justify-center gap-2 text-sm font-semibold cursor-pointer"
            >
              <Code2 className="h-4 w-4" />
              Technical Only
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Total Questions', value: questions.length },
            { label: 'Interview Rounds', value: company?.rounds?.length || 0 },
            { label: 'Prep Time', value: `${company?.estimatedPreparationHours || 20}h` },
            { label: 'Bookmarked', value: bookmarks.size },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface border border-surface-border rounded-xl p-3 text-center">
              <div className="text-[10px] text-text/40 font-bold uppercase tracking-wider">{label}</div>
              <div className="text-lg font-extrabold text-text mt-1">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer
              ${activeTab === tab
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                : 'bg-surface border border-surface-border text-text/60 hover:text-text hover:border-brand-500'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {Object.entries(byCategory).map(([cat, qs]) => {
            const meta = CATEGORY_META[cat] || CATEGORY_META.Technical;
            const Icon = meta.icon;
            return (
              <div key={cat} className="bg-surface-secondary border border-surface-border rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2.5 ${meta.bg} border ${meta.border} rounded-lg`}>
                    <Icon className={`h-4 w-4 ${meta.color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-text text-sm">{cat} Questions</h3>
                    <p className="text-[10px] text-text/40">{qs.length} questions</p>
                  </div>
                  <button
                    onClick={() => handleStart(cat)}
                    className="ml-auto text-[11px] px-3 py-1.5 bg-surface border border-surface-border hover:border-brand-500 text-text/70 hover:text-text rounded-lg transition-all font-semibold cursor-pointer flex items-center gap-1.5"
                  >
                    <Play className="h-3 w-3" />
                    Practice
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {qs.slice(0, 4).map(q => (
                    <div key={q.id} className="text-xs text-text/60 flex items-start gap-2 py-1.5">
                      <div className="h-4 w-4 shrink-0 rounded-full border border-surface-border flex items-center justify-center mt-0.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-text/20" />
                      </div>
                      <span className="truncate">{q.question}</span>
                    </div>
                  ))}
                  {qs.length > 4 && (
                    <button
                      onClick={() => setActiveTab('questions')}
                      className="text-[10px] text-brand-400 font-semibold hover:underline text-left ml-6"
                    >
                      +{qs.length - 4} more in Questions tab
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Questions Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          {Object.entries(byCategory).map(([cat, qs]) => {
            const meta = CATEGORY_META[cat] || CATEGORY_META.Technical;
            const Icon = meta.icon;
            return (
              <div key={cat} className="bg-surface-secondary border border-surface-border rounded-2xl overflow-hidden">
                <div className={`flex items-center gap-2 px-5 py-3 ${meta.bg} border-b border-surface-border`}>
                  <Icon className={`h-4 w-4 ${meta.color}`} />
                  <span className="text-xs font-bold text-text/80">{cat}</span>
                  <span className="ml-auto text-[10px] text-text/40">{qs.length} questions</span>
                </div>
                <div className="divide-y divide-surface-border">
                  {qs.map(q => (
                    <div key={q.id} className="px-5 py-4 flex items-start gap-3 hover:bg-surface/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text/90 leading-relaxed">{q.question}</p>
                        {q.difficulty && (
                          <span className={`mt-1.5 inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold border
                            ${q.difficulty === 'Hard' ? 'text-red-400 bg-red-950 border-red-900' :
                              q.difficulty === 'Medium' ? 'text-amber-400 bg-amber-950 border-amber-900' :
                              'text-green-400 bg-green-950 border-green-900'}`}>
                            {q.difficulty}
                          </span>
                        )}
                        {q.tags && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {q.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-surface border border-surface-border text-text/40 font-medium">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleToggleBookmark(q.id)}
                        className="shrink-0 p-1.5 hover:bg-surface border border-transparent hover:border-amber-800 rounded-lg transition-all cursor-pointer"
                        aria-label={bookmarks.has(q.id) ? 'Remove bookmark' : 'Bookmark question'}
                      >
                        <Bookmark className={`h-4 w-4 transition-colors ${bookmarks.has(q.id) ? 'fill-amber-400 text-amber-400' : 'text-text/30'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tips Tab ─────────────────────────────────────────────────────── */}
      {activeTab === 'tips' && (
        <div className="bg-surface-secondary border border-surface-border rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-text flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-400" />
            Preparation Tips for {company?.name}
          </h3>
          {roadmap.length === 0 ? (
            <div className="space-y-3">
              {[
                'Research recent engineering blog posts and product launches.',
                'Practice STAR-format behavioral answers (Situation, Task, Action, Result).',
                'Review system design fundamentals: load balancing, caching, DB sharding.',
                'Focus on problem-solving clarity: explain your thought process aloud.',
                'Prepare 3–5 impactful stories about past projects.'
              ].map((tip, i) => (
                <div key={i} className="flex gap-3 items-start text-sm text-text/70">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {roadmap.map((step, i) => (
                <div key={i} className="flex gap-3 items-start text-sm text-text/70">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TrackDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-4 w-32 bg-surface-secondary rounded" />
      <div className="h-64 bg-surface-secondary border border-surface-border rounded-2xl" />
      <div className="flex gap-2">
        {[1,2,3].map(i => <div key={i} className="h-10 w-24 bg-surface-secondary rounded-xl" />)}
      </div>
      <div className="space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-32 bg-surface-secondary border border-surface-border rounded-2xl" />)}
      </div>
    </div>
  );
}
