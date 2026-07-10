import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Target, Flag,
  BookOpen, Star, BarChart3, Play, Trophy
} from 'lucide-react';
import { container } from '../../../infrastructure/di/container';
import { useAuthStore } from '../../store/useAuthStore';

const CONFIDENCE_LABELS = ['Unsure', 'Slightly Confident', 'Confident', 'Very Confident', 'Mastered'];
const SELF_RATING_LABELS = ['Poor', 'Below Average', 'Average', 'Good', 'Excellent'];

function pad(n) { return String(n).padStart(2, '0'); }

export default function MockSession() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const uid = user?.uid || 'anonymous';
  const interviewUseCase = container.resolve('InterviewUseCase');

  const [phase, setPhase] = useState('loading'); // loading | ready | active | review | completed
  const [session, setSession] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [checkedPoints, setCheckedPoints] = useState({});
  const [notes, setNotes] = useState({});
  const [selfRating, setSelfRating] = useState({});
  const [confidenceRating, setConfidenceRating] = useState({});
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  // Load or create session
  useEffect(() => {
    async function init() {
      setPhase('loading');
      let s;
      if (sessionId === 'new') {
        const state = location.state || {};
        s = await interviewUseCase.startSession(uid, {
          trackId: state.trackId || 'general',
          trackName: state.trackName || 'Quick Practice',
          mode: state.mode || 'Mixed',
          count: state.count || 10,
        });
      } else {
        s = await interviewUseCase.listSessions(uid)
          .then(list => list.find(x => x.id === sessionId))
          .catch(() => null);
      }
      if (!s) { navigate('/interviews'); return; }
      setSession(s);
      setPhase(s.status === 'Completed' ? 'completed' : 'ready');
    }
    init();
  }, [sessionId, uid]);

  // Timer while active
  useEffect(() => {
    if (phase === 'active') {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const currentQuestion = session?.questions?.[qIndex];
  const totalQuestions = session?.questions?.length || 0;

  const togglePoint = (qId, point) => {
    setCheckedPoints(prev => {
      const existing = prev[qId] || [];
      return {
        ...prev,
        [qId]: existing.includes(point)
          ? existing.filter(p => p !== point)
          : [...existing, point]
      };
    });
  };

  const submitAnswer = async () => {
    const qId = currentQuestion.id;
    try {
      await interviewUseCase.submitAnswer(uid, session.id, qId, {
        checkedPoints: checkedPoints[qId] || [],
        notes: notes[qId] || '',
        selfRating: selfRating[qId] || 3,
        confidenceRating: confidenceRating[qId] || 3,
        answeredAt: new Date(),
      });
    } catch (err) {
      console.warn('[MockSession] Submit answer error:', err);
    }
  };

  const handleNext = async () => {
    await submitAnswer();
    if (qIndex < totalQuestions - 1) {
      setQIndex(q => q + 1);
      setPhase('active');
    } else {
      setPhase('review');
    }
  };

  const handleComplete = async () => {
    try {
      const completed = await interviewUseCase.completeSession(uid, session.id);
      setSession(completed);
      setPhase('completed');
    } catch (err) {
      console.error('[MockSession] Complete error:', err);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 border-4 border-surface-border border-t-brand-500 rounded-full animate-spin" />
        <p className="text-sm text-text/50">Preparing your interview session…</p>
      </div>
    );
  }

  // ── Ready Screen ─────────────────────────────────────────────────────────
  if (phase === 'ready') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-12">
        <button
          onClick={() => navigate('/interviews')}
          className="flex items-center gap-1.5 text-xs text-text/40 hover:text-text/80 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Interview Platform
        </button>

        <div className="bg-surface-secondary border border-surface-border rounded-2xl p-8 text-center space-y-6">
          <div className="inline-flex p-5 bg-violet-950 border border-violet-800 rounded-2xl shadow-xl shadow-violet-900/30">
            <Target className="h-10 w-10 text-violet-300" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-text">{session?.trackName}</h1>
            <p className="text-text/50 text-sm mt-2">
              {totalQuestions} questions · Self-evaluation mode · No AI dependency
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'Questions', value: totalQuestions },
              { label: 'Mode', value: 'Checklist' },
              { label: 'Est. Time', value: `${Math.ceil(totalQuestions * 2)}m` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-surface border border-surface-border rounded-xl p-3">
                <div className="text-[10px] text-text/40 font-bold uppercase tracking-wider">{label}</div>
                <div className="text-base font-extrabold text-text mt-1">{value}</div>
              </div>
            ))}
          </div>

          <div className="bg-surface/50 border border-surface-border rounded-xl p-4 text-left space-y-2">
            <h3 className="text-xs font-bold text-text/60 uppercase tracking-wider">How it works</h3>
            {[
              'Read each question carefully and think through your answer.',
              'Check which key points you covered in your mental or verbal answer.',
              'Rate your confidence and overall performance (1–5).',
              'Review your results and see what to improve next.',
            ].map((s, i) => (
              <div key={i} className="flex gap-2 items-start text-xs text-text/60">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{s}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setPhase('active')}
            id="begin-mock-session"
            className="w-full btn-primary py-4 text-base font-extrabold cursor-pointer flex items-center justify-center gap-2"
          >
            <Play className="h-5 w-5 fill-current" />
            Begin Session
          </button>
        </div>
      </div>
    );
  }

  // ── Active Question ───────────────────────────────────────────────────────
  if (phase === 'active') {
    const q = currentQuestion;
    const qId = q?.id;
    const checked = checkedPoints[qId] || [];
    const completionPct = q?.keyPoints?.length ? Math.round((checked.length / q.keyPoints.length) * 100) : 0;

    return (
      <div className="max-w-3xl mx-auto space-y-5 pb-12">
        {/* Header Bar */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/interviews')} className="text-text/40 hover:text-text/80 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 h-1.5 bg-surface-secondary border border-surface-border rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.round(((qIndex + 1) / totalQuestions) * 100)}%` }}
              className="h-full bg-brand-500 rounded-full transition-all"
            />
          </div>
          <span className="text-xs text-text/40 font-mono whitespace-nowrap shrink-0">
            {pad(Math.floor(elapsed / 60))}:{pad(elapsed % 60)}
          </span>
          <span className="text-xs font-bold text-text/60 whitespace-nowrap shrink-0">
            {qIndex + 1} / {totalQuestions}
          </span>
        </div>

        {/* Question Card */}
        <div className="bg-surface-secondary border border-surface-border rounded-2xl p-6 space-y-5">
          {/* Category Badge */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-surface border border-surface-border text-text/40 font-semibold uppercase tracking-wider">
              {q?.category}
            </span>
            {q?.difficulty && (
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-semibold
                ${q.difficulty === 'Hard' ? 'text-red-400 bg-red-950 border-red-800' :
                  q.difficulty === 'Medium' ? 'text-amber-400 bg-amber-950 border-amber-800' :
                  'text-green-400 bg-green-950 border-green-800'}`}>
                {q.difficulty}
              </span>
            )}
          </div>

          {/* Question Text */}
          <div className="bg-surface/50 border border-surface-border rounded-xl p-5">
            <p className="text-base font-semibold text-text leading-relaxed">{q?.question}</p>
          </div>

          {/* Context hint */}
          {q?.context && (
            <div className="flex gap-2 items-start text-xs text-text/50 bg-surface/40 border border-surface-border rounded-xl px-4 py-3">
              <BookOpen className="h-3.5 w-3.5 shrink-0 mt-0.5 text-brand-400" />
              <span>{q.context}</span>
            </div>
          )}

          {/* Key Points Checklist */}
          {q?.keyPoints?.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-text/60 uppercase tracking-wider">Key Points to Cover</h3>
                <span className="text-xs font-bold text-brand-400">{completionPct}% covered</span>
              </div>
              <div className="space-y-2">
                {q.keyPoints.map((point, i) => (
                  <label
                    key={i}
                    className="flex gap-3 items-start cursor-pointer group p-2.5 rounded-xl hover:bg-surface/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={checked.includes(point)}
                      onChange={() => togglePoint(qId, point)}
                      className="mt-0.5 h-4 w-4 rounded border-surface-border text-brand-500 cursor-pointer accent-brand-500"
                    />
                    <span className={`text-sm leading-relaxed transition-colors ${checked.includes(point) ? 'text-text/80 line-through decoration-text/30' : 'text-text/70'}`}>
                      {point}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-text/40 uppercase tracking-wider mb-1.5 block">
              Personal Notes (optional)
            </label>
            <textarea
              value={notes[qId] || ''}
              onChange={e => setNotes(prev => ({ ...prev, [qId]: e.target.value }))}
              rows={3}
              placeholder="Write key takeaways, examples you used, or things to review later…"
              className="w-full bg-surface border border-surface-border rounded-xl px-4 py-3 text-sm text-text/80 placeholder-text/30 focus:outline-none focus:ring-2 focus:ring-brand-500/40 resize-none transition-all"
            />
          </div>
        </div>

        {/* Self Evaluation */}
        <div className="bg-surface-secondary border border-surface-border rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Confidence */}
          <div>
            <h3 className="text-xs font-bold text-text/60 uppercase tracking-wider mb-3">Confidence Level</h3>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(v => (
                <button
                  key={v}
                  onClick={() => setConfidenceRating(prev => ({ ...prev, [qId]: v }))}
                  className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer
                    ${(confidenceRating[qId] || 3) >= v
                      ? 'bg-sky-600 border-sky-500 text-primary shadow-lg shadow-sky-600/20'
                      : 'bg-surface border-surface-border text-text/40 hover:border-sky-700'}`}
                >
                  {v}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-text/30 mt-1.5 text-center">
              {CONFIDENCE_LABELS[(confidenceRating[qId] || 3) - 1]}
            </p>
          </div>

          {/* Self Rating */}
          <div>
            <h3 className="text-xs font-bold text-text/60 uppercase tracking-wider mb-3">Self Rating</h3>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(v => (
                <button
                  key={v}
                  onClick={() => setSelfRating(prev => ({ ...prev, [qId]: v }))}
                  className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer
                    ${(selfRating[qId] || 3) >= v
                      ? 'bg-brand-600 border-brand-500 text-primary shadow-lg shadow-brand-600/20'
                      : 'bg-surface border-surface-border text-text/40 hover:border-brand-700'}`}
                >
                  <Star className={`h-3.5 w-3.5 mx-auto ${(selfRating[qId] || 3) >= v ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
            <p className="text-[10px] text-text/30 mt-1.5 text-center">
              {SELF_RATING_LABELS[(selfRating[qId] || 3) - 1]}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 justify-between">
          <button
            onClick={() => { if (qIndex > 0) setQIndex(q => q - 1); }}
            disabled={qIndex === 0}
            className="flex items-center gap-2 px-5 py-3 bg-surface border border-surface-border text-text/60 rounded-xl text-sm font-semibold disabled:opacity-30 hover:border-text/40 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Previous
          </button>

          {qIndex < totalQuestions - 1 ? (
            <button
              onClick={handleNext}
              id="next-question-btn"
              className="flex items-center gap-2 px-6 py-3 btn-primary text-sm font-bold cursor-pointer ml-auto"
            >
              Submit & Next <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => { submitAnswer(); setPhase('review'); }}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-600 border border-emerald-600 text-primary text-sm font-bold rounded-xl transition-all cursor-pointer ml-auto"
            >
              Review Answers <Flag className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Review Screen ─────────────────────────────────────────────────────────
  if (phase === 'review') {
    const answered = session?.questions?.filter(q => selfRating[q.id]).length || 0;
    const avgRating = answered
      ? Object.values(selfRating).reduce((s, v) => s + v, 0) / Object.keys(selfRating).length
      : 0;
    const avgConf = Object.keys(confidenceRating).length
      ? Object.values(confidenceRating).reduce((s, v) => s + v, 0) / Object.keys(confidenceRating).length
      : 0;

    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-12">
        <div className="bg-surface-secondary border border-surface-border rounded-2xl p-8 text-center space-y-4">
          <div className="inline-flex p-5 bg-emerald-950 border border-emerald-800 rounded-2xl">
            <BarChart3 className="h-10 w-10 text-emerald-300" />
          </div>
          <h1 className="text-2xl font-extrabold text-text">Session Summary</h1>
          <p className="text-text/50 text-sm">{session?.trackName}</p>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Answered', value: answered, suffix: `/ ${totalQuestions}` },
              { label: 'Avg Rating', value: avgRating.toFixed(1), suffix: '/ 5' },
              { label: 'Avg Confidence', value: avgConf.toFixed(1), suffix: '/ 5' },
            ].map(({ label, value, suffix }) => (
              <div key={label} className="bg-surface border border-surface-border rounded-xl p-3">
                <div className="text-[10px] text-text/40 font-bold uppercase tracking-wider">{label}</div>
                <div className="text-xl font-extrabold text-text mt-0.5">{value}</div>
                <div className="text-[10px] text-text/30">{suffix}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Per-question summary */}
        <div className="bg-surface-secondary border border-surface-border rounded-2xl divide-y divide-surface-border overflow-hidden">
          <div className="px-5 py-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-brand-400" />
            <h3 className="text-sm font-bold text-text/80">Answers Review</h3>
          </div>
          {session?.questions?.map((q, i) => {
            const checked = checkedPoints[q.id] || [];
            const pct = q.keyPoints?.length ? Math.round((checked.length / q.keyPoints.length) * 100) : 0;
            const rating = selfRating[q.id] || 0;
            return (
              <div key={q.id} className="px-5 py-4 flex items-start gap-4">
                <span className="text-xs text-text/30 font-mono shrink-0 mt-0.5">Q{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text/80 truncate">{q.question}</p>
                  <div className="flex gap-3 mt-1.5 text-[10px] text-text/40">
                    <span>{pct}% covered</span>
                    <span className="text-text/20">·</span>
                    <span>Rating: {rating}/5</span>
                    <span className="text-text/20">·</span>
                    <span>{q.category}</span>
                  </div>
                </div>
                <div className={`shrink-0 h-2 w-2 rounded-full mt-2 ${pct >= 75 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} />
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/interviews')}
            className="flex-1 btn-secondary py-3 text-sm font-semibold cursor-pointer"
          >
            Back to Dashboard
          </button>
          <button
            onClick={handleComplete}
            id="finalize-session-btn"
            className="flex-1 btn-primary py-3 text-sm font-bold cursor-pointer flex items-center justify-center gap-2"
          >
            <Trophy className="h-4 w-4" />
            Save & Complete
          </button>
        </div>
      </div>
    );
  }

  // ── Completed Screen ──────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="bg-surface-secondary border border-surface-border rounded-2xl p-8 text-center space-y-6">
        <div className="inline-flex p-5 bg-amber-950 border border-amber-800 rounded-2xl shadow-xl shadow-amber-900/30">
          <Trophy className="h-10 w-10 text-amber-300" />
        </div>
        <h1 className="text-2xl font-extrabold text-text">Session Completed!</h1>
        <p className="text-text/50 text-sm max-w-xs mx-auto">
          Your results have been saved. Keep practicing to improve your readiness score!
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate('/interviews')}
            className="btn-secondary px-6 py-3 text-sm font-semibold cursor-pointer"
          >
            Dashboard
          </button>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary px-6 py-3 text-sm font-bold cursor-pointer flex items-center gap-2"
          >
            <Play className="h-4 w-4 fill-current" />
            Restart Session
          </button>
        </div>
      </div>
    </div>
  );
}
