import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Flame, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  HelpCircle, 
  ChevronRight, 
  Sparkles, 
  BrainCircuit, 
  FileText, 
  Network,
  Clock,
  TrendingUp,
  Percent,
  Layers,
  Search
} from 'lucide-react';
import { container } from '../../../infrastructure/di/container';
import { useAuthStore } from '../../store/useAuthStore';

export default function RevisionDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const uid = user?.uid || 'anonymous';

  const [isLoading, setIsLoading] = useState(true);
  const [queue, setQueue] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'overdue' | 'upcoming' | 'weak'

  const revisionUseCase = container.resolve('RevisionUseCase');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [q, stats] = await Promise.all([
          revisionUseCase.getRevisionQueue(uid),
          revisionUseCase.getRevisionStatistics(uid)
        ]);
        setQueue(q);
        setStatistics(stats);
      } catch (err) {
        console.error('Error loading revision dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [uid]);

  if (isLoading) {
    return <RevisionDashboardSkeleton />;
  }

  const todayCount = queue?.today?.length || 0;
  const overdueCount = queue?.overdue?.length || 0;
  const upcomingCount = queue?.upcoming?.length || 0;
  const weakCount = queue?.weakTopics?.length || 0;

  // Streak flame coloring logic
  const streak = statistics?.currentStreak || 0;
  const streakColor = streak > 0 ? 'text-amber-500 animate-pulse' : 'text-secondary';

  // Format Heatmap data (last 28 days)
  const heatmapDays = [];
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  // Group user's weekly review data
  const reviewMap = new Map();
  if (statistics?.weeklyData) {
    statistics.weeklyData.forEach((day) => {
      reviewMap.set(day.date, day.count);
    });
  }

  for (let i = 27; i >= 0; i--) {
    const d = new Date(todayDate);
    d.setDate(todayDate.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = reviewMap.get(dateStr) || 0;
    heatmapDays.push({ date: d, count });
  }

  const getHeatmapColor = (count) => {
    if (count === 0) return 'bg-surface border-default';
    if (count < 5) return 'bg-emerald-950/70 border-emerald-900/60 text-emerald-300';
    if (count < 15) return 'bg-emerald-800 border-emerald-700 text-emerald-100';
    return 'bg-emerald-500 border-emerald-400 text-primary font-bold';
  };

  const getActiveList = () => {
    if (activeTab === 'today') return queue?.today || [];
    if (activeTab === 'overdue') return queue?.overdue || [];
    if (activeTab === 'upcoming') return queue?.upcoming || [];
    if (activeTab === 'weak') return queue?.weakTopics || [];
    return [];
  };

  const activeList = getActiveList();

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface border border-default/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-100%] right-[-20%] w-[350px] h-[350px] bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-primary tracking-tight flex items-center gap-2">
            <BrainCircuit className="h-8 w-8 text-brand-400" />
            Spaced Revision & Memory
          </h1>
          <p className="text-muted text-sm max-w-xl">
            Retain knowledge forever using active recall and memory science. Your revisions automatically schedule dynamically.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-default rounded-xl">
          <Clock className="h-4.5 w-4.5 text-brand-400" />
          <span className="text-xs text-primary font-medium">Daily Goal: 15 Cards</span>
        </div>
      </div>

      {/* Main Stats Cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="bg-surface border border-default/60 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-xs text-muted font-bold uppercase tracking-wider">Review Streak</span>
            <div className="text-2xl font-black text-primary flex items-baseline gap-1">
              {streak} <span className="text-xs text-muted font-normal">days</span>
            </div>
          </div>
          <div className={`p-3 bg-surface border border-default rounded-xl ${streakColor}`}>
            <Flame className="h-6 w-6" />
          </div>
        </div>

        {/* Total Reviewed */}
        <div className="bg-surface border border-default/60 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-xs text-muted font-bold uppercase tracking-wider">Total Reviewed</span>
            <div className="text-2xl font-black text-primary">
              {statistics?.totalReviewed || 0}
            </div>
          </div>
          <div className="p-3 bg-surface border border-default rounded-xl text-muted">
            <Layers className="h-6 w-6" />
          </div>
        </div>

        {/* Retention rate */}
        <div className="bg-surface border border-default/60 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-xs text-muted font-bold uppercase tracking-wider">Average Recall</span>
            <div className="text-2xl font-black text-primary flex items-baseline gap-0.5">
              {statistics?.averageRetention || 0}<span className="text-sm font-semibold">%</span>
            </div>
          </div>
          <div className="p-3 bg-surface border border-default rounded-xl text-emerald-400">
            <Percent className="h-6 w-6" />
          </div>
        </div>

        {/* Total Cards Due */}
        <div className="bg-surface border border-default/60 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-xs text-muted font-bold uppercase tracking-wider">Cards Due Today</span>
            <div className="text-2xl font-black text-primary flex items-baseline gap-1">
              {todayCount + overdueCount}
              {overdueCount > 0 && (
                <span className="text-xs text-red-400 font-semibold">({overdueCount} Overdue)</span>
              )}
            </div>
          </div>
          <div className={`p-3 bg-surface border border-default rounded-xl ${todayCount + overdueCount > 0 ? 'text-red-400' : 'text-muted'}`}>
            <AlertCircle className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 columns: Active Queue list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex border-b border-default">
            <button 
              onClick={() => setActiveTab('today')}
              className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wider border-b-2 text-center transition-all ${
                activeTab === 'today' 
                  ? 'border-brand-500 text-brand-400' 
                  : 'border-transparent text-muted hover:text-primary'
              }`}
            >
              Due Today ({todayCount})
            </button>
            <button 
              onClick={() => setActiveTab('overdue')}
              className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wider border-b-2 text-center transition-all ${
                activeTab === 'overdue' 
                  ? 'border-red-500 text-red-405' 
                  : 'border-transparent text-muted hover:text-primary'
              }`}
            >
              Overdue ({overdueCount})
            </button>
            <button 
              onClick={() => setActiveTab('weak')}
              className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wider border-b-2 text-center transition-all ${
                activeTab === 'weak' 
                  ? 'border-amber-500 text-amber-400' 
                  : 'border-transparent text-muted hover:text-primary'
              }`}
            >
              Weak Focus ({weakCount})
            </button>
            <button 
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wider border-b-2 text-center transition-all ${
                activeTab === 'upcoming' 
                  ? 'border-muted text-muted' 
                  : 'border-transparent text-muted hover:text-primary'
              }`}
            >
              Upcoming ({upcomingCount})
            </button>
          </div>

          <div className="space-y-4">
            {activeList.length === 0 ? (
              <div className="bg-surface border border-default rounded-2xl p-12 text-center space-y-4 shadow-md">
                <div className="inline-flex p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-emerald-400">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary">Queue Cleared!</h3>
                  <p className="text-xs text-muted max-w-xs mx-auto mt-1">
                    {activeTab === 'today' 
                      ? "All caught up on today's scheduled topics. Your memory retention is solid!" 
                      : activeTab === 'overdue' 
                      ? "No overdue reviews. Great job keeping your memory fresh!"
                      : activeTab === 'weak'
                      ? "No weak focus areas identified. Your mastery scores are excellent!"
                      : "No upcoming reviews scheduled. Complete more course lessons to build your queue."}
                  </p>
                </div>
              </div>
            ) : (
              activeList.map((item) => (
                <RevisionQueueItem 
                  key={item.topicId} 
                  schedule={item} 
                  activeTab={activeTab} 
                  navigate={navigate} 
                />
              ))
            )}
          </div>
        </div>

        {/* Right column: Heatmap / Side widgets */}
        <div className="space-y-6">
          {/* Heatmap Widget */}
          <div className="bg-surface border border-default p-5 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 border-b border-default pb-2">
              <Calendar className="h-4.5 w-4.5 text-brand-400" />
              Memory Recall Heatmap
            </h3>
            <div className="grid grid-cols-7 gap-2 p-1.5 bg-surface rounded-xl">
              {heatmapDays.map((day, idx) => (
                <div
                  key={idx}
                  title={`${day.date.toDateString()}: ${day.count} cards reviewed`}
                  className={`w-full aspect-square rounded border transition-colors relative group cursor-pointer ${getHeatmapColor(day.count)}`}
                >
                  {/* Tooltip */}
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-surface border border-default text-[10px] text-primary rounded shadow-xl whitespace-nowrap z-50 pointer-events-none">
                    {day.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: {day.count} cards
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-muted font-semibold uppercase tracking-wider px-1">
              <span>Less Active</span>
              <span>More Active</span>
            </div>
          </div>

          {/* Quick instructions */}
          <div className="bg-surface border border-default p-5 rounded-2xl shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 border-b border-default pb-2">
              <HelpCircle className="h-4.5 w-4.5 text-brand-400" />
              How Spaced Revision Works
            </h3>
            <ol className="text-xs text-muted space-y-2 list-decimal list-inside leading-relaxed">
              <li>Review the flashcards when they become due.</li>
              <li>Rate your recall performance (Again, Hard, Good, Easy).</li>
              <li>The engine reschedules intervals dynamically based on your ease factor.</li>
              <li>Revising a topic actively upgrades its topic mastery index score.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

function RevisionQueueItem({ schedule, activeTab, navigate }) {
  const { topicId, overdueBy, cardsDue, priority } = schedule;
  const isOverdue = activeTab === 'overdue' || overdueBy > 0;
  
  // Resolve topic title/details from content registry 
  const [topicDetails, setTopicDetails] = useState(null);

  useEffect(() => {
    try {
      const graph = container.resolve('IKnowledgeGraphRepository');
      graph.getGraph().then((nodes) => {
        const node = nodes.find((n) => n.id === topicId);
        if (node) {
          setTopicDetails(node);
        }
      });
    } catch {}
  }, [topicId]);

  const handleStartFlashcards = () => {
    if (topicDetails) {
      navigate(`/revision/flashcards/${topicDetails.slug}`);
    }
  };

  const handleStartCheatSheet = () => {
    if (topicDetails) {
      navigate(`/revision/cheatsheet/${topicDetails.slug}`);
    }
  };

  const handleStartMindMap = () => {
    if (topicDetails) {
      navigate(`/revision/mindmap/${topicDetails.slug}`);
    }
  };

  return (
    <div className="bg-surface border border-default/80 rounded-2xl p-5 hover:border-default/80 transition-all shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden group">
      {/* Visual priority indicator */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${isOverdue ? 'bg-red-500' : 'bg-brand-500'}`} />

      <div className="space-y-1.5 pl-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-base font-bold text-primary group-hover:text-brand-300 transition-colors">
            {topicDetails ? topicDetails.title : `Topic ID: ${topicId}`}
          </h4>
          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-surface border border-default rounded text-muted">
            {topicDetails ? topicDetails.chapter.replace('chapter-', 'Chap ') : ''}
          </span>
          {isOverdue && (
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-red-950/60 border border-red-900/60 rounded text-red-400 flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {overdueBy}d Overdue
            </span>
          )}
        </div>
        <p className="text-xs text-muted max-w-md line-clamp-1">
          {topicDetails ? topicDetails.description : 'Static revision task scheduled.'}
        </p>
        <div className="flex gap-4 text-[10px] text-muted font-semibold uppercase tracking-wider">
          <span>Cards due: <strong className="text-muted">{cardsDue}</strong></span>
          <span>Priority score: <strong className="text-brand-400">{priority.toFixed(2)}</strong></span>
        </div>
      </div>

      {/* Buttons Actions toolbar */}
      <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0 border-t border-default md:border-transparent pt-3 md:pt-0">
        <button 
          onClick={handleStartFlashcards}
          className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-500 border border-brand-500 rounded-xl text-primary text-xs font-bold transition-all shadow-md shadow-brand-900/20 cursor-pointer"
        >
          <BrainCircuit className="h-3.5 w-3.5" />
          <span>Flashcards</span>
        </button>
        <button 
          onClick={handleStartCheatSheet}
          className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-surface hover:bg-surface border border-default rounded-xl text-primary hover:text-primary text-xs font-bold transition-all cursor-pointer"
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Cheat Sheet</span>
        </button>
        <button 
          onClick={handleStartMindMap}
          className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-surface hover:bg-surface border border-default rounded-xl text-primary hover:text-primary text-xs font-bold transition-all cursor-pointer"
        >
          <Network className="h-3.5 w-3.5" />
          <span>Mind Map</span>
        </button>
      </div>
    </div>
  );
}

function RevisionDashboardSkeleton() {
  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto animate-pulse">
      {/* Header banner skeleton */}
      <div className="bg-surface/50 border border-default/40 h-28 rounded-2xl" />

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface/50 border border-default/40 h-24 rounded-2xl" />
        ))}
      </div>

      {/* Queue list skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-surface/50 border border-default/40 h-10 rounded-xl" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-surface/50 border border-default/40 h-24 rounded-2xl" />
          ))}
        </div>
        <div className="space-y-4">
          <div className="bg-surface/50 border border-default/40 h-64 rounded-2xl" />
          <div className="bg-surface/50 border border-default/40 h-36 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
