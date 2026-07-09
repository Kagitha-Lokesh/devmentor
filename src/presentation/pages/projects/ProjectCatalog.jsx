import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderGit2, 
  Clock, 
  Layers, 
  Sparkles, 
  Play, 
  ChevronRight, 
  CheckCircle,
  AlertTriangle,
  Lock,
  Search,
  BookOpen
} from 'lucide-react';
import { container } from '../../../infrastructure/di/container';
import { useAuthStore } from '../../store/useAuthStore';

export default function ProjectCatalog() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const uid = user?.uid || 'anonymous';

  // Resolvers
  const projectUseCase = container.resolve('ProjectUseCase');

  // Component states
  const [projects, setProjects] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [depGraph, setDepGraph] = useState({});
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [allProj, allProg, graph, statistics] = await Promise.all([
          projectUseCase.listProjects(),
          projectUseCase.listUserProgress(uid),
          projectUseCase.getDependencyGraph(),
          projectUseCase.getStatistics()
        ]);

        setProjects(allProj);
        setDepGraph(graph);
        setStats(statistics);

        // Map progress by projectId
        const progMap = {};
        allProg.forEach(p => {
          progMap[p.projectId] = p;
        });
        setProgressMap(progMap);
      } catch (err) {
        console.error('[ProjectCatalog] Load data error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [uid]);

  if (isLoading) {
    return (
      <div className="space-y-8 pb-12 animate-pulse" aria-busy="true">
        <div className="h-44 bg-surface-secondary border border-surface-border rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-20 bg-surface-secondary border border-surface-border rounded-xl" />
          <div className="h-20 bg-surface-secondary border border-surface-border rounded-xl" />
          <div className="h-20 bg-surface-secondary border border-surface-border rounded-xl" />
        </div>
        <div className="h-64 bg-surface-secondary border border-surface-border rounded-2xl" />
      </div>
    );
  }

  // Helper: check if project is unlocked
  const isProjectUnlocked = (proj) => {
    const deps = proj.dependsOn || [];
    if (deps.length === 0) return true;
    return deps.every(depId => {
      const p = progressMap[depId];
      return p && (p.health === 'Completed' || p.health === 'Mastered');
    });
  };

  // Filter lists
  const tracks = ['all', 'frontend', 'backend', 'fullstack', 'java', 'react', 'sql'];
  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced'];
  const templateTypes = ['all', 'Portfolio', 'Intermediate', 'Advanced', 'Capstone', 'Simulation'];

  const filteredProjects = projects.filter(p => {
    const matchesTrack = selectedTrack === 'all' || p.track === selectedTrack;
    const matchesDiff = selectedDifficulty === 'all' || p.difficulty === selectedDifficulty;
    const matchesTemplate = selectedTemplate === 'all' || p.templateType === selectedTemplate;
    const matchesSearch = searchQuery === '' || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.technologies.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTrack && matchesDiff && matchesTemplate && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Premium Header */}
      <div className="relative bg-surface-secondary border border-surface-border rounded-2xl p-6 md:p-8 overflow-hidden shadow-xl">
        <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-brand-500/10 rounded-full blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-950 border border-brand-800 rounded-full text-brand-300 text-xs font-semibold mb-3">
              <Sparkles className="h-3 w-3" />
              <span>Real-World Guided Build Tracks</span>
            </div>
            <h1 className="text-3xl font-extrabold text-text tracking-tight">Project-Based Learning</h1>
            <p className="text-text/60 mt-2 text-sm md:text-base max-w-xl">
              Bridge the gap between syntax and production architectures. Build structured systems, self-verify using acceptance milestones, and generate metadata for your career portfolio.
            </p>
          </div>
          
          <div className="shrink-0 flex gap-4 w-full md:w-auto">
            <div className="flex-1 md:flex-initial bg-surface border border-surface-border rounded-xl p-4 text-center min-w-[120px]">
              <div className="text-xs text-text/40 font-medium">Projects Available</div>
              <div className="text-2xl font-extrabold text-text mt-1">
                {stats?.totalProjects || 0}
              </div>
            </div>
            <div className="flex-1 md:flex-initial bg-surface border border-surface-border rounded-xl p-4 text-center min-w-[120px]">
              <div className="text-xs text-text/40 font-medium">Build Tracks</div>
              <div className="text-2xl font-extrabold text-brand-400 mt-1">
                {stats?.totalTracks || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-surface-secondary border border-surface-border rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-text/40" />
          <input 
            type="text" 
            placeholder="Search projects or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface border border-surface-border rounded-lg text-sm text-text focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
          {/* Track */}
          <select
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
            className="px-3 py-2 bg-surface border border-surface-border rounded-lg text-xs text-text/80 focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="all">All Tracks</option>
            {tracks.filter(t => t !== 'all').map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>

          {/* Template Type */}
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="px-3 py-2 bg-surface border border-surface-border rounded-lg text-xs text-text/80 focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="all">All Templates</option>
            {templateTypes.filter(t => t !== 'all').map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Difficulty */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 bg-surface border border-surface-border rounded-lg text-xs text-text/80 focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="all">All Difficulties</option>
            {difficulties.filter(d => d !== 'all').map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 bg-surface-secondary border border-surface-border rounded-2xl text-center">
          <FolderGit2 className="h-12 w-12 text-text/20 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-text">No Projects Found</h3>
          <p className="text-xs text-text/40 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or clearing filter categories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => {
            const progress = progressMap[p.id];
            const unlocked = isProjectUnlocked(p);
            const compPercent = progress ? progress.completionPercent(p.totalTasks) : 0;
            const health = progress?.health || 'NotStarted';

            return (
              <div 
                key={p.id}
                className={`relative bg-surface-secondary border rounded-2xl p-5 flex flex-col justify-between transition-all group overflow-hidden ${
                  unlocked 
                    ? 'border-surface-border hover:border-brand-500 hover:shadow-lg' 
                    : 'border-surface-border/40 opacity-70'
                }`}
              >
                {/* Visual completion progress border */}
                {progress && unlocked && (
                  <div 
                    style={{ width: `${compPercent}%` }}
                    className="absolute top-0 left-0 h-1 bg-brand-500 transition-all duration-300"
                  />
                )}

                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
                      p.difficulty === 'Beginner' ? 'bg-green-950/30 text-green-400 border-green-900/60'
                      : p.difficulty === 'Intermediate' ? 'bg-brand-950/30 text-brand-400 border-brand-900/60'
                      : 'bg-red-950/30 text-red-400 border-red-900/60'
                    }`}>
                      {p.difficulty}
                    </span>

                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-surface text-text/50 border border-surface-border">
                      {p.templateType}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-text group-hover:text-brand-400 transition-colors flex items-center gap-1.5">
                    {p.title}
                    {!unlocked && <Lock className="h-3.5 w-3.5 text-text/30 shrink-0" />}
                  </h3>

                  <p className="text-xs text-text/60 mt-2 line-clamp-3 leading-relaxed">
                    {p.description}
                  </p>

                  {/* Skills tags list */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.skills.slice(0, 3).map((s, idx) => (
                      <span key={idx} className="text-[10px] text-brand-300 font-mono px-2 py-0.5 bg-brand-950 border border-brand-900 rounded-full">
                        {s}
                      </span>
                    ))}
                    {p.skills.length > 3 && (
                      <span className="text-[9px] text-text/40 font-mono px-1.5 py-0.5 bg-surface border border-surface-border rounded-full">
                        +{p.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-surface-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-text/40 font-medium">
                    <Clock className="h-4 w-4" />
                    <span>~{p.estimatedHours} hrs</span>
                  </div>

                  {unlocked ? (
                    <button
                      onClick={() => navigate(`/projects/${p.id}`)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-400 group-hover:text-brand-300 transition-colors cursor-pointer"
                    >
                      {progress ? (
                        health === 'Completed' || health === 'Mastered' ? (
                          <span className="text-green-400 flex items-center gap-1">Completed <CheckCircle className="h-3.5 w-3.5 fill-current" /></span>
                        ) : (
                          <span>Resume ({compPercent}%) <ChevronRight className="h-3.5 w-3.5" /></span>
                        )
                      ) : (
                        <span className="flex items-center gap-1">Start Track <Play className="h-3 w-3 fill-current" /></span>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-[10px] text-amber-500 font-semibold bg-amber-950/20 border border-amber-900/60 px-2 py-0.5 rounded">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Requires: {p.dependsOn.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
