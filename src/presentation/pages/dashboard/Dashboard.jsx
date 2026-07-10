import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Flame,
  TrendingUp,
  Compass,
  Terminal,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  BarChart2,
  Calendar,
  Layers,
  ChevronRight,
  BrainCircuit,
  AlertCircle,
  MessageSquare,
  Target,
  Zap,
  FolderGit2,
  Trophy,
  ArrowRight
} from 'lucide-react';

import { container } from '../../../infrastructure/di/container';
import { useAuthStore } from '../../store/useAuthStore';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

// Learning OS Components
import { YouAreHere } from '../../components/course/YouAreHere';
import { SkillRadar } from '../../components/course/SkillRadar';
import { LearningHeatmap } from '../../components/course/LearningHeatmap';
import { CurrentFocusCard } from '../../components/course/CurrentFocusCard';
import { TodaysQueue } from '../../components/course/TodaysQueue';
import { RemainingRoadmap } from '../../components/course/RemainingRoadmap';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // DI Resolvers
  const graphRepo = container.resolve('IKnowledgeGraphRepository');
  const progressRepo = container.resolve('IProgressRepository');
  const masteryRepo = container.resolve('IMasteryRepository');
  const activityRepo = container.resolve('IActivityRepository');
  const recommendationEngine = container.resolve('IRecommendationEngine');
  const problemRepo = container.resolve('IProblemRepository');

  // Page States
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [weakTopics, setWeakTopics] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [weeklyMinutes, setWeeklyMinutes] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [streakDays, setStreakDays] = useState(0);
  const [studyMinutesToday, setStudyMinutesToday] = useState(0);
  const [masteryOverview, setMasteryOverview] = useState(0);
  const [volumeCompletion, setVolumeCompletion] = useState([]);
  const [heatmapDays, setHeatmapDays] = useState([]);
  const [revisionQueue, setRevisionQueue] = useState(null);
  const [graphData, setGraphData] = useState([]);

  // Learning OS state
  const [hubData, setHubData] = useState(null); // { overall, modules, readinessMap }
  const [currentFocus, setCurrentFocus] = useState(null);
  const [todaysQueue, setTodaysQueue] = useState([]);
  const [remainingRoadmap, setRemainingRoadmap] = useState({ modules: [], totalHours: 0 });
  const [estimatedCompletion, setEstimatedCompletion] = useState(null);
  const [resumeBanner, setResumeBanner] = useState(null); // { title, slug } if in-progress topic

  // Projects Platform States
  const [activeProject, setActiveProject] = useState(null);
  const [activeProjectProgress, setActiveProjectProgress] = useState(null);
  const [nextProjectTask, setNextProjectTask] = useState(null);
  const [suggestedProject, setSuggestedProject] = useState(null);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const loadDashboardData = async () => {
      setIsLoading(true);
      const uid = user.uid;

      try {
        const [graph, progressList, masteryList, activitiesList] = await Promise.all([
          graphRepo.getGraph(),
          progressRepo.listProgress(uid),
          masteryRepo.listMastery(uid),
          activityRepo.listActivities(uid),
          problemRepo.listProblems()
        ]);

        // 1. Resolve Recommendations list
        setGraphData(graph);
        const recs = await recommendationEngine.getRecommendations({
          uid,
          graph,
          progressList,
          masteryList
        });
        setRecommendations(recs);

        // ── Learning OS Hub Computations (no new repo calls) ───────────────
        try {
          const progressHubUseCase = container.resolve('ProgressHubUseCase');

          // Weighted progress + module readiness
          const hub = progressHubUseCase.computeWeightedProgress(graph, progressList, masteryList);
          setHubData(hub);

          // Current focus topic
          const focus = progressHubUseCase.computeCurrentFocus(graph, progressList);
          setCurrentFocus(focus);

          // Today's queue
          const queue = progressHubUseCase.computeTodaysQueue(graph, progressList, masteryList, recs);
          setTodaysQueue(queue);

          // Remaining roadmap
          const remaining = progressHubUseCase.computeRemainingRoadmap(graph, progressList);
          setRemainingRoadmap(remaining);

          // Estimated completion
          const est = progressHubUseCase.computeEstimatedCompletion(graph, progressList, activitiesList);
          setEstimatedCompletion(est);

          // Smart Resume Banner: if there's an in-progress topic
          if (focus) {
            setResumeBanner({ title: focus.node.title, slug: focus.node.slug });
          }
        } catch (hubErr) {
          console.warn('Learning OS hub computation error:', hubErr.message);
        }
        // ──────────────────────────────────────────────────────────────────

        // 2. Identify Weak Topics (mastery < 70)
        const weak = [];
        masteryList.forEach((m) => {
          if (m.score > 0 && m.score < 70) {
            const node = graph.find(n => n.id === m.topicId);
            if (node) {
              weak.push({
                id: node.id,
                slug: node.slug,
                title: node.title,
                score: m.score
              });
            }
          }
        });
        setWeakTopics(weak);

        // 3. Overall composite mastery index
        if (masteryList.length > 0) {
          const sum = masteryList.reduce((acc, m) => acc + m.score, 0);
          setMasteryOverview(Math.round(sum / masteryList.length));
        } else {
          setMasteryOverview(0);
        }

        // 4. Progress by Volume completion calculation
        const totalByVol = {};
        const completedByVol = {};
        
        graph.forEach((node) => {
          const v = node.volume;
          totalByVol[v] = (totalByVol[v] || 0) + 1;
          const userProg = progressList.find(p => p.topicId === node.id);
          if (userProg && userProg.lessonCompleted) {
            completedByVol[v] = (completedByVol[v] || 0) + 1;
          }
        });

        const volumesMeta = Object.keys(totalByVol).map((v) => {
          const total = totalByVol[v];
          const completed = completedByVol[v] || 0;
          return {
            num: v,
            total,
            completed,
            percentage: Math.round((completed / total) * 100)
          };
        }).sort((a, b) => a.num - b.num);
        setVolumeCompletion(volumesMeta);

        // 5. Study minutes today & weekly chart
        let minutesToday = 0;
        const tempWeekly = [0, 0, 0, 0, 0, 0, 0];
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        activitiesList.forEach((act) => {
          const date = new Date(act.timestamp);
          if (date >= startOfDay) {
            minutesToday += act.duration / 60;
          }
          // Diff in days for weekly chart
          const diffTime = startOfDay.getTime() - date.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays >= 0 && diffDays < 7) {
            tempWeekly[6 - diffDays] += act.duration / 60;
          }
        });
        setStudyMinutesToday(Math.round(minutesToday));
        setWeeklyMinutes(tempWeekly.map(Math.round));

        // 6. Streak calculator
        let currentStreak = 0;
        let checkDate = new Date(startOfDay);
        
        const activityDates = new Set(
          activitiesList.map(act => {
            const date = new Date(act.timestamp);
            return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          })
        );

        while (true) {
          const formatted = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
          if (activityDates.has(formatted)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            // Check if user missed today but solved yesterday
            if (currentStreak === 0) {
              const yesterday = new Date(startOfDay);
              yesterday.setDate(yesterday.getDate() - 1);
              const formattedYest = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;
              if (activityDates.has(formattedYest)) {
                checkDate = yesterday;
                continue;
              }
            }
            break;
          }
        }
        setStreakDays(currentStreak);

        // 7. Heatmap calculations (last 28 days)
        const heatmapList = [];
        for (let i = 27; i >= 0; i--) {
          const d = new Date(startOfDay);
          d.setDate(d.getDate() - i);
          const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          const count = activitiesList.filter(act => {
            const actDate = new Date(act.timestamp);
            return `${actDate.getFullYear()}-${actDate.getMonth()}-${actDate.getDate()}` === key;
          }).length;

          heatmapList.push({
            date: d,
            count
          });
        }
        setHeatmapDays(heatmapList);

        // 8. Recent activities log feed (last 5)
        setRecentActivities(activitiesList.slice(0, 5));

        // 9. Load revision due queue for dashboard panel
        try {
          const revisionUseCase = container.resolve('RevisionUseCase');
          const rq = await revisionUseCase.getRevisionQueue(uid);
          setRevisionQueue(rq);
        } catch {}

        // 10. Load projects data
        try {
          const projectUseCase = container.resolve('ProjectUseCase');
          const allProj = await projectUseCase.listProjects();
          const allProg = await projectUseCase.listUserProgress(uid);

          // Find active project
          const activeProg = allProg.find(p => ['Started', 'InProgress', 'Blocked', 'ReadyForReview'].includes(p.health));
          
          if (activeProg) {
            const projDetails = await projectUseCase.getProjectDetails(activeProg.projectId);
            setActiveProject(projDetails);
            setActiveProjectProgress(activeProg);

            // Find next uncompleted task in sequence
            let nextTask = null;
            for (const m of projDetails.milestones) {
              const reqTasks = (m.tasks || []).filter(t => !t.isOptional);
              const uncompleted = reqTasks.find(t => !activeProg.completedTasks.includes(t.id));
              if (uncompleted) {
                nextTask = {
                  ...uncompleted,
                  milestoneTitle: m.title
                };
                break;
              }
            }
            setNextProjectTask(nextTask);
          } else {
            // Suggest first project if none is active
            if (allProj.length > 0) {
              setSuggestedProject(allProj[0]);
            }
          }
        } catch (err) {
          console.warn('Failed loading project metrics:', err);
        }

        // Fetch aggregate statistics from static learning-statistics.json
        const stats = await fetch('/generated/learning-statistics.json').then(r => r.json());
        setStatistics(stats);

      } catch (err) {
        console.warn('Failed loading intelligence panel records:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="space-y-8 pb-12" aria-busy="true">
        {/* Welcome greeting skeleton */}
        <Skeleton className="h-44 rounded-2xl" />
        
        {/* Grid panel skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-32 rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-56 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const displayName = user?.displayName || 'Developer';
  const totalCompletionPercent = volumeCompletion.length > 0 
    ? Math.round(volumeCompletion.reduce((sum, v) => sum + v.percentage, 0) / volumeCompletion.length)
    : 0;

  const nextRec = recommendations[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Greetings banner */}
      <div className="relative bg-surface-secondary border border-surface-border rounded-2xl p-6 md:p-8 overflow-hidden shadow-xl">
        <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-brand-500/10 rounded-full blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-950 border border-brand-800 rounded-full text-brand-300 text-xs font-semibold mb-3">
              <Sparkles className="h-3 w-3 animate-pulse" />
              <span>Learning Intelligence path active</span>
            </div>
            <h1 className="text-3xl font-extrabold text-text tracking-tight">Welcome back, {displayName}</h1>
            <p className="text-text/60 mt-2 text-sm md:text-base max-w-xl">
              "Mastery is not about syntax; it is about building clean architectures, profiling bottlenecks, and optimizing latency."
            </p>
          </div>
          
          <div className="shrink-0 flex gap-4 w-full md:w-auto">
            <div className="flex-1 md:flex-initial bg-surface border border-surface-border rounded-xl p-4 text-center min-w-[120px]">
              <div className="text-xs text-text/40 font-medium">Mastery Index</div>
              <div className="text-2xl font-extrabold text-text mt-1 flex items-center justify-center gap-1.5">
                <TrendingUp className="h-5 w-5 text-brand-400" />
                {masteryOverview}%
              </div>
            </div>
            <div className="flex-1 md:flex-initial bg-surface border border-surface-border rounded-xl p-4 text-center min-w-[120px]">
              <div className="text-xs text-text/40 font-medium">Daily Streak</div>
              <div className="text-2xl font-extrabold text-amber-500 mt-1 flex items-center justify-center gap-1.5">
                <Flame className="h-5 w-5 fill-current text-amber-500" />
                {streakDays} <span className="text-xs text-text/50 font-medium">days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Smart Resume Banner ─────────────────────────────────────────── */}
      {resumeBanner && (
        <div className="flex items-center gap-4 bg-brand-500/8 border border-brand-500/25 rounded-2xl p-4">
          <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse flex-shrink-0" />
          <p className="text-sm flex-1 text-text/70">
            <span className="font-bold text-text">Welcome back.</span> You left off on{' '}
            <span className="text-brand-500 font-bold">{resumeBanner.title}</span>.
          </p>
          <button
            onClick={() => navigate(`/courses/java/topics/${resumeBanner.slug}`)}
            className="btn-primary py-1.5 px-4 text-xs whitespace-nowrap flex items-center gap-2"
          >
            Resume <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── Developer Progress Hub ──────────────────────────────────────── */}
      {hubData && (
        <div className="space-y-6">
          {/* End Goal + Overall ring */}
          <div className="bg-surface-secondary border border-surface-border rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-widest text-brand-500 mb-1">Goal</p>
              <h2 className="text-xl font-extrabold text-text">Full Stack Java Developer</h2>
              {estimatedCompletion && estimatedCompletion.estimatedDate && (
                <p className="text-xs text-text/40 mt-1">
                  Est. completion: <span className="font-semibold text-text/60">
                    {estimatedCompletion.estimatedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  {' '} · {estimatedCompletion.remainingTopics} topics remaining
                  {' '} · ~{remainingRoadmap.totalHours}h of study
                </p>
              )}
              {/* Overall progress bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs font-semibold text-text/50 mb-1.5">
                  <span>Overall Progress</span>
                  <span className="text-brand-500 font-black">{hubData.overall}%</span>
                </div>
                <div className="h-2.5 bg-surface-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${hubData.overall}%` }}
                  />
                </div>
              </div>
            </div>
            {/* Mastery + Streak mini stats */}
            <div className="flex gap-3 flex-shrink-0">
              <div className="bg-surface border border-surface-border rounded-xl p-4 text-center min-w-[100px]">
                <div className="text-xs text-text/40 font-medium">Mastery</div>
                <div className="text-2xl font-extrabold text-brand-500 mt-1 flex items-center justify-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  {masteryOverview}%
                </div>
              </div>
              <div className="bg-surface border border-surface-border rounded-xl p-4 text-center min-w-[100px]">
                <div className="text-xs text-text/40 font-medium">Streak</div>
                <div className="text-2xl font-extrabold text-amber-500 mt-1 flex items-center justify-center gap-1">
                  <Flame className="h-4 w-4 fill-current" />
                  {streakDays}d
                </div>
              </div>
            </div>
          </div>

          {/* 3-column OS grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Col 1: You Are Here + Current Focus */}
            <div className="space-y-4">
              <div className="bg-surface-secondary border border-surface-border rounded-2xl p-5">
                <h3 className="text-xs font-black uppercase tracking-widest text-text/40 mb-4">You Are Here</h3>
                <YouAreHere modules={hubData.modules} />
              </div>
              <CurrentFocusCard focus={currentFocus} />
            </div>

            {/* Col 2: Today's Queue */}
            <div className="bg-surface-secondary border border-surface-border rounded-2xl p-5">
              <h3 className="text-xs font-black uppercase tracking-widest text-text/40 mb-4">Today's Queue</h3>
              <TodaysQueue queue={todaysQueue} />
            </div>

            {/* Col 3: Skill Radar + Remaining */}
            <div className="space-y-4">
              <div className="bg-surface-secondary border border-surface-border rounded-2xl p-5">
                <h3 className="text-xs font-black uppercase tracking-widest text-text/40 mb-3">Skill Radar</h3>
                <SkillRadar readinessMap={hubData.readinessMap} size={220} />
              </div>
              <div className="bg-surface-secondary border border-surface-border rounded-2xl p-5">
                <h3 className="text-xs font-black uppercase tracking-widest text-text/40 mb-3">Remaining</h3>
                <RemainingRoadmap modules={remainingRoadmap.modules} totalHours={remainingRoadmap.totalHours} />
              </div>
            </div>
          </div>

          {/* Activity Heatmap */}
          <div className="bg-surface-secondary border border-surface-border rounded-2xl p-5">
            <h3 className="text-xs font-black uppercase tracking-widest text-text/40 mb-4">Activity Heatmap</h3>
            <LearningHeatmap heatmapDays={heatmapDays} />
          </div>
        </div>
      )}

      {/* Target goals dashboard progress indicator */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-secondary border border-surface-border rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-brand-950 text-brand-400 border border-brand-800 rounded-lg">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-text/40 uppercase font-bold tracking-wider">Studied Today</span>
            <h4 className="text-lg font-bold text-text">{studyMinutesToday} mins</h4>
          </div>
        </div>

        <div className="bg-surface-secondary border border-surface-border rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-green-950 text-green-400 border border-green-800 rounded-lg">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-text/40 uppercase font-bold tracking-wider">Syllabus Progress</span>
            <h4 className="text-lg font-bold text-text">{totalCompletionPercent}% Completed</h4>
          </div>
        </div>

        <div className="bg-surface-secondary border border-surface-border rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-950 text-blue-400 border border-blue-800 rounded-lg">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-text/40 uppercase font-bold tracking-wider">Mastery Modules</span>
            <h4 className="text-lg font-bold text-text">{statistics?.topics || 0} Topics</h4>
          </div>
        </div>

        <div className="bg-surface-secondary border border-surface-border rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-950 text-amber-400 border border-amber-800 rounded-lg">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-text/40 uppercase font-bold tracking-wider">Coding Tasks</span>
            <h4 className="text-lg font-bold text-text">{statistics?.practiceProblems || 0} Challenges</h4>
          </div>
        </div>
      </div>

      {/* Main dashboard splits layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Recommendations, Weak topics list, Heatmap */}
        <div className="lg:col-span-2 space-y-8">

          {/* ─── Projects Progression Widget ─── */}
          {activeProject ? (
            <div className="bg-surface-secondary border border-surface-border rounded-2xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute top-[-40%] right-[-10%] w-[200px] h-[200px] bg-brand-500/5 rounded-full blur-[60px]" />
              
              <div className="flex justify-between items-start gap-4 flex-col sm:flex-row">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-brand-950 border border-brand-800 rounded-full text-brand-300 text-[10px] font-bold uppercase tracking-wider">
                    <FolderGit2 className="h-3 w-3" />
                    <span>Current Active Project</span>
                  </div>
                  <h3 className="text-xl font-black text-text tracking-tight mt-1">{activeProject.title}</h3>
                  <p className="text-xs text-text/50">Track: {activeProject.track.toUpperCase()} · Mode: {activeProject.templateType}</p>
                </div>
                
                <div className="bg-surface border border-surface-border rounded-xl px-4 py-2 text-center shrink-0 w-full sm:w-auto">
                  <span className="text-[10px] text-text/40 font-semibold block uppercase">Completion</span>
                  <span className="text-xl font-extrabold text-brand-400 mt-0.5 block">
                    {activeProjectProgress.completionPercent(activeProject.totalTasks)}%
                  </span>
                </div>
              </div>

              {/* Next suggested project task */}
              {nextProjectTask && (
                <div className="mt-5 p-4 bg-surface/50 border border-surface-border rounded-xl space-y-2">
                  <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider block">Recommended Next Task</span>
                  <h4 className="text-sm font-bold text-text">{nextProjectTask.title}</h4>
                  <p className="text-xs text-text/60 line-clamp-2 leading-relaxed">{nextProjectTask.description}</p>
                  
                  <div className="pt-2 flex justify-between items-center text-[10px] text-text/40">
                    <span>Milestone: {nextProjectTask.milestoneTitle}</span>
                    <span>~{nextProjectTask.estimatedMinutes} mins remaining</span>
                  </div>
                </div>
              )}

              <div className="mt-5 flex gap-3 flex-col sm:flex-row">
                <button
                  onClick={() => navigate(`/projects/${activeProject.id}`)}
                  className="btn-primary text-xs py-2.5 px-4 flex-1 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Resume Building
                </button>
                <button
                  onClick={() => navigate('/projects')}
                  className="bg-surface border border-surface-border text-text/80 hover:bg-surface-tertiary text-xs py-2.5 px-4 rounded-xl flex-1 flex items-center justify-center cursor-pointer transition-colors"
                >
                  Browse Catalog
                </button>
              </div>
            </div>
          ) : suggestedProject ? (
            <div className="bg-surface-secondary border border-surface-border rounded-2xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute top-[-40%] right-[-10%] w-[200px] h-[200px] bg-brand-500/5 rounded-full blur-[60px]" />
              
              <div className="flex justify-between items-start gap-4 flex-col sm:flex-row">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-green-950/60 border border-green-800 rounded-full text-green-300 text-[10px] font-bold uppercase tracking-wider">
                    <Trophy className="h-3 w-3" />
                    <span>Syllabus Project Suggestion</span>
                  </div>
                  <h3 className="text-xl font-black text-text tracking-tight mt-1">{suggestedProject.title}</h3>
                  <p className="text-xs text-text/50">Track: {suggestedProject.track.toUpperCase()} · Mode: {suggestedProject.templateType}</p>
                </div>
              </div>

              <p className="text-xs text-text/60 mt-3 leading-relaxed">
                {suggestedProject.description}
              </p>

              <div className="mt-5 flex gap-3 flex-col sm:flex-row">
                <button
                  onClick={() => navigate(`/projects/${suggestedProject.id}`)}
                  className="btn-primary text-xs py-2.5 px-4 flex-1 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Start Building Project
                </button>
                <button
                  onClick={() => navigate('/projects')}
                  className="bg-surface border border-surface-border text-text/80 hover:bg-surface-tertiary text-xs py-2.5 px-4 rounded-xl flex-1 flex items-center justify-center cursor-pointer transition-colors"
                >
                  Browse Catalog
                </button>
              </div>
            </div>
          ) : null}
          
          {/* Active continue learning recommendation card */}
          {nextRec && (
            <div className="relative bg-gradient-to-r from-brand-900/40 to-slate-950 border border-brand-500 rounded-2xl p-6 shadow-lg">
              <div className="absolute top-2 right-4 text-[10px] uppercase tracking-widest text-brand-400 font-bold bg-brand-950 border border-brand-800 px-2 py-0.5 rounded-full">
                RECOMMENDED NEXT LESSON
              </div>
              <h3 className="text-xl font-bold text-text flex items-center gap-2 mt-2">
                <Compass className="h-5 w-5 text-brand-400 animate-spin-slow" />
                {nextRec.title}
              </h3>
              <p className="text-xs text-text/70 mt-2 leading-relaxed">
                {nextRec.description}
              </p>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => {
                    if (nextRec.type === 'WeakTopicRefresher' || nextRec.problemId) {
                      navigate(`/compiler`);
                    } else {
                      const node = graphData.find(n => n.id === nextRec.topicId);
                      const courseId = node?.paths?.lesson?.split('/')[1] || 'java';
                      const slug = node?.slug || nextRec.topicId;
                      navigate(`/courses/${courseId}/topics/${slug}`);
                    }
                  }}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1 cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Start Learning
                </button>
              </div>
            </div>
          )}

          {/* Weak Topics Gaps Review Panel */}
          <div className="bg-surface-secondary border border-surface-border rounded-2xl p-6">
            <h3 className="text-lg font-bold text-text flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
              Focus Areas & Weak Topics
            </h3>
            <p className="text-xs text-text/50 mb-4">
              These topics have mastery index scores below 70%. We recommend revising code exercises to strengthen your profile.
            </p>
            
            {weakTopics.length === 0 ? (
              <div className="p-4 bg-surface/30 border border-surface-border rounded-xl text-center text-xs text-text/40 italic">
                Excellent work! You have no weak topic gaps in your study logs.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {weakTopics.map(w => (
                  <div 
                    key={w.id} 
                    onClick={() => navigate(`/courses`)}
                    className="p-3 bg-surface border border-surface-border hover:border-brand-500 rounded-xl cursor-pointer transition-all flex justify-between items-center"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-text">{w.title}</h4>
                      <span className="text-[10px] text-amber-400 block mt-1 font-semibold">Mastery: {w.score}%</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-text/30" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Revision Due Today Panel */}
          <div className="bg-surface-secondary border border-surface-border rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-text flex items-center gap-2">
                <BrainCircuit className="h-4.5 w-4.5 text-brand-400" />
                Revision Due Today
              </h3>
              <button
                onClick={() => navigate('/revision')}
                className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-0.5 cursor-pointer transition-colors"
              >
                View All <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {!revisionQueue ? (
              <div className="p-4 text-center text-xs text-text/40 italic">Loading revision queue...</div>
            ) : (revisionQueue.today.length + revisionQueue.overdue.length) === 0 ? (
              <div className="p-4 bg-surface/30 border border-surface-border rounded-xl text-center text-xs text-text/40 italic">
                No revisions due today. Stay consistent to keep your memory sharp!
              </div>
            ) : (
              <div className="space-y-3">
                {revisionQueue.overdue.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-red-950/20 border border-red-900/60 rounded-xl">
                    <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                    <span className="text-xs text-red-300 font-semibold">
                      {revisionQueue.overdue.length} overdue topic{revisionQueue.overdue.length !== 1 ? 's' : ''} — review now to restore streak
                    </span>
                  </div>
                )}
                {(revisionQueue.today.slice(0, 3)).map((item) => (
                  <div
                    key={item.topicId}
                    onClick={() => navigate(`/revision/flashcards/${item.topicId}`)}
                    className="flex justify-between items-center p-3 bg-surface/50 border border-surface-border hover:border-brand-500 rounded-xl cursor-pointer transition-all"
                  >
                    <div>
                      <span className="text-xs font-bold text-text block">{item.topicId}</span>
                      <span className="text-[10px] text-text/40 mt-0.5 block">{item.cardsDue} cards due</span>
                    </div>
                    <span className="text-[10px] text-brand-400 font-bold uppercase">Start →</span>
                  </div>
                ))}
                <button
                  onClick={() => navigate('/revision')}
                  className="w-full py-2.5 btn-primary text-xs font-bold cursor-pointer"
                >
                  Open Revision Dashboard
                </button>
              </div>
            )}
          </div>

          {/* Learning Heatmap Activity Grid */}
          <div className="bg-surface-secondary border border-surface-border rounded-2xl p-6">
            <h3 className="text-sm font-bold text-text flex items-center gap-2 mb-4">
              <Calendar className="h-4.5 w-4.5 text-brand-400" />
              Mastery Heatmap (Last 4 Weeks)
            </h3>
            
            <div className="flex flex-wrap items-center gap-1.5">
              {heatmapDays.map((day, idx) => {
                let colorClass = 'bg-surface';
                if (day.count > 0 && day.count <= 2) colorClass = 'bg-brand-950 text-brand-500 border border-brand-900';
                else if (day.count > 2 && day.count <= 4) colorClass = 'bg-brand-900/60 text-brand-300';
                else if (day.count > 4) colorClass = 'bg-brand-500 text-slate-950';

                return (
                  <div
                    key={idx}
                    title={`${day.date.toDateString()}: ${day.count} activities logged`}
                    className={`h-7 w-7 rounded flex items-center justify-center text-[10px] font-bold font-mono transition-all hover:scale-105 cursor-default ${colorClass}`}
                  >
                    {day.date.getDate()}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 flex justify-between items-center text-[10px] text-text/40 font-mono">
              <span>28 Days Ago</span>
              <div className="flex gap-2">
                <span>Color key:</span>
                <span className="text-text/20">Empty</span>
                <span className="text-brand-400 font-bold">Medium</span>
                <span className="text-brand-500 font-bold">High</span>
              </div>
              <span>Today</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Ask Assistant, Daily Goal, Weekly summary, volume progression, recent log feed */}
        <div className="space-y-8">

          {/* ─── Ask Assistant Widget ─── */}
          <div className="bg-gradient-to-br from-brand-950/80 to-slate-950 border border-brand-700/60 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            {/* Glow orb */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-brand-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-brand-900 border border-brand-700 rounded-lg">
                  <MessageSquare className="h-4 w-4 text-brand-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text">AI Learning Assistant</h3>
                  <p className="text-[10px] text-text/40">Offline · Rule-Based · Free</p>
                </div>
              </div>

              {/* Quick-action prompt chips */}
              <div className="space-y-2 mb-4">
                {[
                  { label: 'Explain my weakest topic', icon: BrainCircuit },
                  { label: 'What should I study today?', icon: Compass },
                  { label: 'Give me a coding hint', icon: Terminal },
                ].map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    onClick={() => navigate('/assistant', { state: { query: label } })}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-surface/60 border border-surface-border hover:border-brand-500 hover:bg-brand-950/40 rounded-xl text-xs text-text/80 font-medium transition-all text-left cursor-pointer group"
                  >
                    <Icon className="h-3.5 w-3.5 text-brand-400 shrink-0 group-hover:scale-110 transition-transform" />
                    {label}
                    <ChevronRight className="h-3 w-3 text-text/20 ml-auto group-hover:text-brand-400 transition-colors" />
                  </button>
                ))}
              </div>

              <button
                onClick={() => navigate('/assistant')}
                className="w-full btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="h-3.5 w-3.5" />
                Open Full Assistant
              </button>
            </div>
          </div>

          {/* ─── Daily Study Checkpoint ─── */}
          <div className="bg-surface-secondary border border-surface-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-green-950 border border-green-800 rounded-lg">
                <Target className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text">Daily Checkpoint</h3>
                <p className="text-[10px] text-text/40">Your goals for today</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Study time goal */}
              {(() => {
                const goalMin = 60;
                const pct = Math.min(100, Math.round((studyMinutesToday / goalMin) * 100));
                const done = studyMinutesToday >= goalMin;
                return (
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs text-text/70 font-medium flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-brand-400" />
                        Study Time
                      </span>
                      <span className={`text-[10px] font-bold ${done ? 'text-green-400' : 'text-text/40'}`}>
                        {studyMinutesToday}/{goalMin} min {done ? '✓' : ''}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-surface border border-surface-border rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`h-full rounded-full transition-all ${done ? 'bg-green-500' : 'bg-brand-500'}`}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Revision goal */}
              {(() => {
                const total = revisionQueue ? (revisionQueue.today.length + revisionQueue.overdue.length) : 0;
                const done = total === 0 && revisionQueue !== null;
                return (
                  <div
                    className="flex justify-between items-center px-3 py-2 bg-surface/50 border border-surface-border rounded-xl cursor-pointer hover:border-brand-500 transition-all"
                    onClick={() => navigate('/revision')}
                  >
                    <span className="text-xs text-text/70 font-medium flex items-center gap-1.5">
                      <BrainCircuit className="h-3 w-3 text-brand-400" />
                      Revision Queue
                    </span>
                    <span className={`text-xs font-bold ${done ? 'text-green-400' : 'text-amber-400'}`}>
                      {revisionQueue === null ? '...' : done ? 'All clear ✓' : `${total} due`}
                    </span>
                  </div>
                );
              })()}

              {/* Streak status */}
              <div className="flex justify-between items-center px-3 py-2 bg-surface/50 border border-surface-border rounded-xl">
                <span className="text-xs text-text/70 font-medium flex items-center gap-1.5">
                  <Flame className="h-3 w-3 text-amber-400" />
                  Streak Status
                </span>
                <span className={`text-xs font-bold ${streakDays > 0 ? 'text-amber-400' : 'text-text/30'}`}>
                  {streakDays > 0 ? `${streakDays} day${streakDays !== 1 ? 's' : ''} 🔥` : 'Start today'}
                </span>
              </div>

              {/* Mastery goal */}
              <div className="flex justify-between items-center px-3 py-2 bg-surface/50 border border-surface-border rounded-xl">
                <span className="text-xs text-text/70 font-medium flex items-center gap-1.5">
                  <TrendingUp className="h-3 w-3 text-brand-400" />
                  Mastery Index
                </span>
                <span className={`text-xs font-bold ${
                  masteryOverview >= 80 ? 'text-green-400'
                  : masteryOverview >= 50 ? 'text-brand-400'
                  : 'text-amber-400'
                }`}>
                  {masteryOverview}%
                </span>
              </div>
            </div>
          </div>

          {/* Weekly Summary bar chart */}
          <div className="bg-surface-secondary border border-surface-border rounded-2xl p-6">
            <h3 className="text-sm font-bold text-text flex items-center gap-2 mb-4">
              <BarChart2 className="h-4.5 w-4.5 text-brand-400" />
              Weekly Study Time
            </h3>
            
            <div className="h-28 flex items-end justify-between gap-2 pt-2 border-b border-surface-border pb-1">
              {weeklyMinutes.map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[9px] text-text/50 font-bold font-mono">{val}m</span>
                  <div 
                    style={{ height: `${Math.min(90, Math.max(10, (val / 60) * 100))}%` }}
                    className="w-full bg-brand-500 rounded-t transition-all hover:bg-brand-400" 
                  />
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center text-[9px] text-text/40 font-mono pt-2">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>

          {/* Volume progress bars */}
          <div className="bg-surface-secondary border border-surface-border rounded-2xl p-6">
            <h3 className="text-sm font-bold text-text flex items-center gap-2 mb-4">
              <Layers className="h-4.5 w-4.5 text-brand-400" />
              Volume Completions
            </h3>
            <div className="space-y-4">
              {volumeCompletion.map((vol) => (
                <div key={vol.num} className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold text-text/80">
                    <span>Volume {vol.num}: Lesson Tracks</span>
                    <span>{vol.completed}/{vol.total} ({vol.percentage}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface border border-surface-border rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${vol.percentage}%` }}
                      className="h-full bg-brand-500 rounded-full transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity log feed */}
          <div className="bg-surface-secondary border border-surface-border rounded-2xl p-6">
            <h3 className="text-sm font-bold text-text flex items-center gap-2 mb-4">
              <Clock className="h-4.5 w-4.5 text-brand-400" />
              Recent Activity Feed
            </h3>
            
            <div className="space-y-3">
              {recentActivities.length === 0 ? (
                <p className="text-text/40 italic text-xs py-4 text-center">No recent activities logged.</p>
              ) : (
                recentActivities.map((act) => (
                  <div key={act.id} className="flex gap-2.5 items-start p-2 bg-surface/50 border border-surface-border rounded-xl">
                    <div className="h-2 w-2 rounded-full bg-brand-500 shrink-0 mt-1.5" />
                    <div className="text-xs">
                      <span className="font-bold text-text block">{act.type}</span>
                      <span className="text-[10px] text-text/40 block mt-0.5">
                        {act.timestamp.toLocaleDateString()} at {act.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
