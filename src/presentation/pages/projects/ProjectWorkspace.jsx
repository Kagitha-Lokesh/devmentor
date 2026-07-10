import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sparkles, 
  Clock, 
  Layers, 
  BookOpen, 
  Compass, 
  CheckCircle2, 
  Lock, 
  HelpCircle,
  MessageSquare,
  Bookmark,
  ChevronRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileCode,
  AlertCircle
} from 'lucide-react';
import { container } from '../../../infrastructure/di/container';
import { useAuthStore } from '../../store/useAuthStore';
import { MarkdownRenderer } from '../../components/common/MarkdownRenderer';

export default function ProjectWorkspace() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const uid = user?.uid || 'anonymous';

  // Resolvers
  const projectUseCase = container.resolve('ProjectUseCase');
  const logger = container.resolve('ILogger');

  // Page States
  const [project, setProject] = useState(null);
  const [progress, setProgress] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview | requirements | architecture | resources
  const [activeMilestoneId, setActiveMilestoneId] = useState(null);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Markdown loads
  const [overviewMd, setOverviewMd] = useState('');
  const [requirementsMd, setRequirementsMd] = useState('');
  const [architectureMd, setArchitectureMd] = useState('');

  // Interactive task log notes input
  const [notesInput, setNotesInput] = useState('');
  const [taskError, setTaskError] = useState(null);

  // Auto-clear task error after 4s
  useEffect(() => {
    if (!taskError) return;
    const t = setTimeout(() => setTaskError(null), 4000);
    return () => clearTimeout(t);
  }, [taskError]);
  const [timeSpentInput, setTimeSpentInput] = useState('');
  const [showLogTimeModal, setShowLogTimeModal] = useState(false);

  useEffect(() => {
    async function loadWorkspace() {
      setIsLoading(true);
      try {
        const details = await projectUseCase.getProjectDetails(projectId);
        if (!details) {
          navigate('/projects');
          return;
        }
        setProject(details);

        // Load progress
        let prog = await projectUseCase.getUserProgress(uid, projectId);
        if (!prog) {
          prog = await projectUseCase.startProject(uid, projectId);
        }
        setProgress(prog);

        // Auto select first milestone
        if (details.milestones?.length > 0) {
          setActiveMilestoneId(details.milestones[0].id);
        }

        // Load Markdown content files in background
        if (details.paths?.overview) {
          const overviewText = await projectUseCase._getProjectRepo().getProjectMarkdown(details.paths.overview);
          setOverviewMd(overviewText || 'No overview available.');
        }
        if (details.paths?.requirements) {
          const reqsText = await projectUseCase._getProjectRepo().getProjectMarkdown(details.paths.requirements);
          setRequirementsMd(reqsText || 'No requirements specifications loaded.');
        }
        if (details.paths?.architecture) {
          const archText = await projectUseCase._getProjectRepo().getProjectMarkdown(details.paths.architecture);
          setArchitectureMd(archText || 'No architecture specifications loaded.');
        }
      } catch (err) {
        logger.warn(`[ProjectWorkspace] Failed to initialize project workspace: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    }
    loadWorkspace();
  }, [projectId, uid]);

  // Handle task checklist interaction
  const handleToggleTask = async (taskId, currentCompleted) => {
    try {
      let updated;
      if (currentCompleted) {
        updated = await projectUseCase.uncompleteTask(uid, projectId, taskId);
      } else {
        updated = await projectUseCase.completeTask(uid, projectId, taskId);
      }
      setProgress(updated);
    } catch (err) {
      setTaskError(err.message || 'Failed to update task. Please try again.');
    }
  };

  // Handle task notes save
  const handleSaveNotes = async (taskId) => {
    try {
      const updated = await projectUseCase.saveTaskNotes(uid, projectId, taskId, notesInput);
      setProgress(updated);
    } catch {}
  };

  // Handle time logging
  const handleLogTime = async (e) => {
    e.preventDefault();
    const mins = parseInt(timeSpentInput);
    if (isNaN(mins) || mins <= 0) return;
    try {
      const updated = await projectUseCase.logTimeSpent(uid, projectId, mins);
      setProgress(updated);
      setTimeSpentInput('');
      setShowLogTimeModal(false);
    } catch {}
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface pb-24" aria-busy="true">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <Layers className="h-10 w-10 text-brand-400 animate-spin-slow" />
          <span className="text-sm font-semibold text-text/60">Assembling workspace assets...</span>
        </div>
      </div>
    );
  }

  const activeMilestone = project.milestones.find(m => m.id === activeMilestoneId);
  const activeTask = activeMilestone?.tasks.find(t => t.id === activeTaskId);
  const totalTasksCount = project.totalTasks || 1;
  const completedPercent = progress ? progress.completionPercent(totalTasksCount) : 0;
  const isMilestoneLocked = (milestone) => {
    // If not first milestone and depends on previous, previous must be completed
    if (!milestone.dependsOn || milestone.dependsOn.length === 0) return false;
    return milestone.dependsOn.some(depId => {
      const prevM = project.milestones.find(x => x.id === depId);
      if (!prevM) return false;
      const requiredTasks = (prevM.tasks || []).filter(t => !t.isOptional);
      return !requiredTasks.every(t => progress.completedTasks.includes(t.id));
    });
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-surface border border-surface-border rounded-2xl overflow-hidden -mx-4 lg:-mx-8">
      {/* Task error toast */}
      {taskError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-red-950/90 border border-red-700/60 text-red-300 text-sm font-medium px-4 py-2.5 rounded-xl shadow-xl backdrop-blur-sm animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          {taskError}
        </div>
      )}
      {/* ─── SIDEBAR COLUMN (Milestones & Timeline Checklist) ─── */}
      <div className="w-full lg:w-96 border-r border-surface-border bg-surface-secondary flex flex-col justify-between shrink-0">
        
        {/* Header summary */}
        <div className="p-5 border-b border-surface-border">
          <button 
            onClick={() => navigate('/projects')}
            className="flex items-center gap-1.5 text-xs text-text/50 hover:text-brand-400 transition-colors font-semibold uppercase mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Project Tracks</span>
          </button>

          <h2 className="text-xl font-black text-text tracking-tight">{project.title}</h2>
          <span className="text-[10px] text-text/40 block mt-1 uppercase tracking-wider font-semibold">
            Track: {project.track.toUpperCase()} · Mode: {project.templateType}
          </span>

          {/* Progress gauge */}
          <div className="mt-4">
            <div className="flex justify-between items-center text-xs font-semibold mb-1">
              <span className="text-text/70">Milestones Completed</span>
              <span className="text-brand-400 font-bold">{completedPercent}%</span>
            </div>
            <div className="w-full h-2 bg-surface border border-surface-border rounded-full overflow-hidden">
              <div 
                style={{ width: `${completedPercent}%` }}
                className="h-full bg-brand-500 rounded-full transition-all duration-300"
              />
            </div>
          </div>

          {/* Time spent tracker */}
          <div className="mt-4 flex justify-between items-center bg-surface/50 border border-surface-border p-2.5 rounded-xl">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand-400" />
              <div className="text-left">
                <span className="text-[9px] text-text/40 block uppercase font-bold">Time Invested</span>
                <span className="text-xs font-bold text-text">{progress?.timeSpentMinutes || 0} minutes</span>
              </div>
            </div>
            <button
              onClick={() => setShowLogTimeModal(true)}
              className="text-[10px] bg-brand-950 hover:bg-brand-900 border border-brand-800 text-brand-400 px-2 py-1 rounded font-bold cursor-pointer transition-colors"
            >
              Log Time
            </button>
          </div>
        </div>

        {/* Milestone Timeline List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <h3 className="text-xs font-bold text-text/50 uppercase tracking-wider mb-2">Build Roadmap</h3>
          {project.milestones.map((m, idx) => {
            const locked = isMilestoneLocked(m);
            const active = m.id === activeMilestoneId;
            const completed = (m.tasks || []).filter(t => !t.isOptional).every(t => progress.completedTasks.includes(t.id));

            return (
              <div 
                key={m.id}
                onClick={() => { if (!locked) setActiveMilestoneId(m.id); }}
                className={`p-3 border rounded-xl transition-all cursor-pointer ${
                  active 
                    ? 'bg-brand-950/20 border-brand-500 shadow'
                    : locked 
                    ? 'border-surface-border/40 opacity-50 cursor-not-allowed'
                    : 'bg-surface/30 border-surface-border hover:border-brand-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-text/40">#{idx + 1}</span>
                    <h4 className={`text-sm font-bold ${active ? 'text-brand-400' : 'text-text'}`}>
                      {m.title}
                    </h4>
                  </div>
                  {locked ? (
                    <Lock className="h-3.5 w-3.5 text-text/30" />
                  ) : completed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 fill-current" />
                  ) : null}
                </div>

                <p className="text-[11px] text-text/50 mt-1 block line-clamp-2">
                  {m.description}
                </p>

                {/* Subtasks inside active milestone */}
                {active && (
                  <div className="mt-3 pt-3 border-t border-brand-500/20 space-y-2.5">
                    {m.tasks.map(t => {
                      const done = progress.completedTasks.includes(t.id);
                      return (
                        <div 
                          key={t.id}
                          className="flex items-start gap-2.5 hover:bg-surface/20 p-1.5 rounded transition-all"
                        >
                          <input 
                            type="checkbox"
                            checked={done}
                            onChange={() => handleToggleTask(t.id, done)}
                            className="mt-0.5 h-3.5 w-3.5 rounded accent-brand-500 border-surface-border cursor-pointer shrink-0"
                          />
                          <div className="flex-1 min-w-0" onClick={() => {
                            setActiveTaskId(t.id);
                            // SeedTest notes log inputs
                            setNotesInput(progress.notes?.[t.id] || '');
                          }}>
                            <span className={`text-xs block truncate ${
                              t.id === activeTaskId ? 'text-brand-300 font-bold border-b border-brand-800' : done ? 'line-through text-text/30' : 'text-text/70 hover:text-text'
                            }`}>
                              {t.title}
                            </span>
                            <span className="text-[9px] text-text/40 block mt-0.5">{t.estimatedMinutes} mins</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sync Status Banner */}
        <div className="p-3 bg-surface border-t border-surface-border text-[10px] text-text/40 text-center">
          Project Workspace cache active · Syncing background mutations.
        </div>
      </div>

      {/* ─── CENTRAL WORKSPACE TABS & CONTENT ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-surface-border bg-surface-secondary/80 backdrop-blur-md sticky top-0 z-20">
          {[
            { id: 'overview', label: 'Overview', icon: BookOpen },
            { id: 'requirements', label: 'Requirements', icon: Compass },
            { id: 'architecture', label: 'Architecture', icon: FileCode },
            { id: 'resources', label: 'Reference Resources', icon: Bookmark },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-6 py-4 text-xs font-bold border-b-2 tracking-wider uppercase transition-all cursor-pointer ${
                activeTab === tab.id 
                  ? 'border-brand-500 text-brand-400 bg-brand-950/10' 
                  : 'border-transparent text-text/50 hover:text-text hover:bg-surface-tertiary'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Display Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {activeTab === 'overview' && (
            <div className="prose prose-invert max-w-none">
              <MarkdownRenderer content={overviewMd} />
            </div>
          )}

          {activeTab === 'requirements' && (
            <div className="prose prose-invert max-w-none">
              <MarkdownRenderer content={requirementsMd} />
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="prose prose-invert max-w-none">
              <MarkdownRenderer content={architectureMd} />
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-text flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-brand-400" />
                Project Resource Catalogue
              </h3>
              <p className="text-xs text-text/50">
                A structured registry of reference documentation, tutorials, and guidelines.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {(project.resources || []).map(r => (
                  <a 
                    key={r.id} 
                    href={r.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-4 bg-surface-secondary border border-surface-border hover:border-brand-500 rounded-xl block transition-all"
                  >
                    <span className="text-[10px] text-brand-400 font-mono block uppercase mb-1">{r.type}</span>
                    <h4 className="text-sm font-bold text-text flex items-center gap-1">
                      {r.title}
                      <ExternalLink className="h-3 w-3 text-text/30" />
                    </h4>
                    <p className="text-xs text-text/60 mt-1">{r.description}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── RIGHT WORKSPACE DRAWER (Active Task Details & Engine Interactivity) ─── */}
      {activeTask && (
        <div className="w-full lg:w-96 border-l border-surface-border bg-surface-secondary/80 backdrop-blur-md p-6 flex flex-col justify-between shrink-0 overflow-y-auto">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[9px] text-brand-400 font-mono uppercase block mb-0.5">Active Checklist Task</span>
                <h3 className="text-base font-bold text-text">{activeTask.title}</h3>
              </div>
              <button 
                onClick={() => setActiveTaskId(null)}
                className="p-1 rounded text-text/40 hover:text-text hover:bg-surface-tertiary cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-text/70 leading-relaxed mb-6 bg-surface/30 p-3 border border-surface-border/60 rounded-xl">
              {activeTask.description}
            </p>

            {/* Acceptance criteria */}
            {activeTask.acceptanceCriteria?.length > 0 && (
              <div className="mb-6 space-y-2">
                <span className="text-[10px] text-text/40 font-bold uppercase tracking-wider">Acceptance Criteria</span>
                <div className="space-y-1.5">
                  {activeTask.acceptanceCriteria.map((c, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-text/80 bg-surface/10 p-2 rounded border border-surface-border/30">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related items index mapping */}
            {(activeTask.relatedLessons?.length > 0 || activeTask.relatedProblems?.length > 0 || activeTask.relatedQuestions?.length > 0) && (
              <div className="mb-6 space-y-3">
                <span className="text-[10px] text-text/40 font-bold uppercase tracking-wider block">Integrations Prereqs</span>
                
                {/* Related lesson courses mapping */}
                {activeTask.relatedLessons.map(lessonId => (
                  <div 
                    key={lessonId}
                    onClick={() => navigate('/courses')}
                    className="flex justify-between items-center p-2.5 bg-surface border border-surface-border hover:border-brand-500 rounded-xl cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-brand-400" />
                      <span className="text-xs text-text/80 font-medium">Concept: {lessonId}</span>
                    </div>
                    <ChevronRight className="h-3 w-3 text-text/30" />
                  </div>
                ))}

                {/* Related problems compiler mapping */}
                {activeTask.relatedProblems.map(probId => (
                  <div 
                    key={probId}
                    onClick={() => navigate(`/compiler/problems/${probId}`)}
                    className="flex justify-between items-center p-2.5 bg-surface border border-surface-border hover:border-brand-500 rounded-xl cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <FileCode className="h-4 w-4 text-brand-400" />
                      <span className="text-xs text-text/80 font-medium">Practice Problem: {probId}</span>
                    </div>
                    <ChevronRight className="h-3 w-3 text-text/30" />
                  </div>
                ))}

                {/* Related questions interview mapping */}
                {activeTask.relatedQuestions.map(qId => (
                  <div 
                    key={qId}
                    onClick={() => navigate(`/interviews`)}
                    className="flex justify-between items-center p-2.5 bg-surface border border-surface-border hover:border-brand-500 rounded-xl cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-brand-400" />
                      <span className="text-xs text-text/80 font-medium">Interview prep: {qId}</span>
                    </div>
                    <ChevronRight className="h-3 w-3 text-text/30" />
                  </div>
                ))}
              </div>
            )}

            {/* AI Assistant Context Hand-off */}
            <div className="bg-gradient-to-br from-brand-950/60 to-slate-900 border border-brand-800 p-4 rounded-xl mb-6">
              <h4 className="text-xs font-bold text-text flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-brand-300 animate-pulse" />
                Stuck on this Task?
              </h4>
              <p className="text-[10px] text-text/50 mt-1 leading-relaxed">
                Consult the Assistant with full context of this task including acceptance criteria, guidelines, and related lessons.
              </p>
              <button
                onClick={() => {
                  const preloadedQuery = `I am working on the project "${project.title}" (${project.id}). I am stuck on Milestone "${activeMilestone.title}", Task "${activeTask.title}". Task Description: ${activeTask.description}. Acceptance Criteria: ${activeTask.acceptanceCriteria?.join(', ')}. Please explain how I can solve this task and write a sample architecture layout.`;
                  navigate('/assistant', { state: { query: preloadedQuery } });
                }}
                className="mt-3 w-full py-2 bg-brand-900 hover:bg-brand-800 border border-brand-700 text-brand-300 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Consult Assistant
              </button>
            </div>

            {/* Task Solution Notes & Drafts persistence */}
            <div className="space-y-2">
              <span className="text-[10px] text-text/40 font-bold uppercase tracking-wider block">Solution Code & Notes</span>
              <textarea
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Paste code segments, configurations or terminal commands here..."
                rows={5}
                className="w-full p-3 bg-surface border border-surface-border rounded-xl text-xs font-mono text-text focus:outline-none focus:border-brand-500"
              />
              <button
                onClick={() => handleSaveNotes(activeTask.id)}
                className="w-full py-2 btn-primary text-xs font-bold cursor-pointer"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TIME LOG OVERLAY MODAL ─── */}
      {showLogTimeModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-surface/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm bg-surface-secondary border border-surface-border rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-text flex items-center gap-1.5">
                <Clock className="h-5 w-5 text-brand-400" />
                Log Work Duration
              </h3>
              <button 
                onClick={() => setShowLogTimeModal(false)}
                className="text-text/40 hover:text-text cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLogTime} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-text/60 block">Active Study Minutes</label>
                <input 
                  type="number" 
                  min="1"
                  required
                  placeholder="e.g. 45"
                  value={timeSpentInput}
                  onChange={(e) => setTimeSpentInput(e.target.value)}
                  className="w-full p-3 bg-surface border border-surface-border rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogTimeModal(false)}
                  className="flex-1 py-2.5 bg-surface border border-surface-border rounded-xl text-xs font-bold text-text hover:bg-surface-tertiary transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 btn-primary rounded-xl text-xs font-bold cursor-pointer"
                >
                  Log Minutes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
