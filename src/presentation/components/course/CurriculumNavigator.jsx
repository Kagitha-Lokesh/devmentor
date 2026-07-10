/**
 * CurriculumNavigator — Learning OS full roadmap sidebar panel
 * Shows unified Full Stack roadmap: all modules → volumes → chapters → topics
 * with per-topic LearningStatus icons, prerequisite tooltips, search, and quick-jump.
 *
 * Props (no internal data fetching):
 *   graph          - LearningNode[]
 *   progressMap    - Map<topicId, Progress>
 *   dependencyMap  - Map<topicId, string[]> (prerequisite ids)
 *   currentTopicId - string
 *   onTopicSelect  - (courseId, topicSlug) => void
 *   isOpen         - boolean
 *   onClose        - () => void (mobile drawer)
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ChevronDown, ChevronRight, CheckCircle, Lock,
  Circle, BookOpen, Zap, X, Map as MapIcon
} from 'lucide-react';
import { resolveLearningStatus, LearningStatus } from '../../../domain/models/LearningStatus';
import { container } from '../../../infrastructure/di/container';

const STATUS_CONFIG = {
  [LearningStatus.MASTERED]:  { icon: CheckCircle, color: 'text-emerald-500', label: 'Mastered' },
  [LearningStatus.QUIZ]:      { icon: Zap,          color: 'text-amber-500',   label: 'Quiz ready' },
  [LearningStatus.PRACTICE]:  { icon: Zap,          color: 'text-blue-500',    label: 'Practice ready' },
  [LearningStatus.REVISION]:  { icon: Zap,          color: 'text-purple-500',  label: 'Revision due' },
  [LearningStatus.READING]:   { icon: BookOpen,     color: 'text-brand-500',   label: 'Reading' },
  [LearningStatus.STARTED]:   { icon: Circle,       color: 'text-brand-400',   label: 'Started' },
  [LearningStatus.AVAILABLE]: { icon: Circle,       color: 'text-text/30',     label: 'Available' },
  [LearningStatus.LOCKED]:    { icon: Lock,         color: 'text-text/20',     label: 'Locked' },
};

export function CurriculumNavigator({
  graph = [],
  progressMap = new Map(),
  dependencyMap = new Map(),
  currentTopicId,
  onTopicSelect,
  isOpen = false,
  onClose
}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [expandedVolumes, setExpandedVolumes] = useState(new Set());
  const [expandedChapters, setExpandedChapters] = useState(new Set());
  const currentRef = useRef(null);

  // Resolve CourseGraph from container for clean, ordered curriculum structure
  const courseGraph = useMemo(() => {
    try {
      return container.resolve('CourseGraph');
    } catch (e) {
      console.warn('Could not resolve CourseGraph from container inside CurriculumNavigator:', e);
      return null;
    }
  }, []);

  // Build canonical modules list with their structured volumes/chapters/topics
  const modulesList = useMemo(() => {
    if (!courseGraph) return [];
    return courseGraph.getModules().map(mod => {
      const structure = courseGraph.getModuleStructure(mod.id);
      const allModuleTopics = courseGraph.getTopicsInModule(mod.id);
      return {
        id: mod.id,
        title: mod.title,
        color: mod.color || '#f59e0b',
        icon: mod.icon,
        structure, // Array of { volumeOrder, chapters: [ { chapterOrder, topics: [...] } ] }
        allModuleTopics
      };
    });
  }, [courseGraph]);

  // Auto-expand the sections containing the current active topic
  useEffect(() => {
    if (!currentTopicId || !courseGraph) return;
    const node = courseGraph.getTopic(currentTopicId);
    if (!node) return;

    const modId = node.moduleId;
    const vol = node.volumeOrder;
    const chap = node.chapterOrder;

    if (modId) {
      setExpandedModules(s => new Set([...s, modId]));
      setExpandedVolumes(s => new Set([...s, `${modId}-${vol}`]));
      setExpandedChapters(s => new Set([...s, `${modId}-${vol}-${chap}`]));
    }
  }, [currentTopicId, courseGraph]);

  // Scroll active topic into view
  useEffect(() => {
    if (isOpen && currentRef.current) {
      setTimeout(() => {
        currentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [isOpen, currentTopicId]);

  const toggleModule = key =>
    setExpandedModules(s => { const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); return n; });
  const toggleVolume = key =>
    setExpandedVolumes(s => { const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); return n; });
  const toggleChapter = key =>
    setExpandedChapters(s => { const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); return n; });

  const handleTopicClick = (node) => {
    const courseId = node.courseId || 'java';
    if (onTopicSelect) {
      onTopicSelect(courseId, node.slug);
    } else {
      navigate(`/courses/${courseId}/topics/${node.slug}`);
    }
    onClose?.();
  };

  const searchLower = search.toLowerCase().trim();

  const content = (
    <div className="flex flex-col h-full bg-surface border-r border-surface-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-surface-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <MapIcon className="h-4 w-4 text-brand-500" />
          <span className="text-sm font-black text-text">Full Stack Roadmap</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-text/40 hover:text-text transition-colors" aria-label="Close navigator">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search */}
      <div className="p-3 border-b border-surface-border flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text/30" />
          <input
            type="text"
            placeholder="Search topics..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-surface-secondary border border-surface-border rounded-lg text-text placeholder:text-text/30 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
      </div>

      {/* Scrollable topic tree */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-surface-border">
        {modulesList.map((mod) => {
          const isModuleExpanded = expandedModules.has(mod.id);
          const allModuleTopics = mod.allModuleTopics;

          // Filter module visibility by search query
          const matchesSearch = !searchLower || allModuleTopics.some(n =>
            n.title.toLowerCase().includes(searchLower) ||
            (n.description && n.description.toLowerCase().includes(searchLower)) ||
            (n.tags && n.tags.some(t => t.toLowerCase().includes(searchLower)))
          );
          if (!matchesSearch) return null;

          // Module completion stats
          const completedCount = allModuleTopics.filter(n => progressMap.get(n.id)?.lessonCompleted).length;

          return (
            <div key={mod.id} className="border-b border-surface-border/50">
              {/* Module header */}
              <button
                onClick={() => toggleModule(mod.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-secondary/50 transition-colors text-left"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: mod.color }}
                />
                <span className="text-xs font-black text-text flex-1 uppercase tracking-wider">
                  {mod.title}
                </span>
                <span className="text-[10px] text-text/30 tabular-nums flex-shrink-0">
                  {completedCount}/{allModuleTopics.length}
                </span>
                {isModuleExpanded
                  ? <ChevronDown className="h-3.5 w-3.5 text-text/30" />
                  : <ChevronRight className="h-3.5 w-3.5 text-text/30" />
                }
              </button>

              {/* Volumes */}
              {isModuleExpanded && mod.structure.map(({ volumeOrder, chapters }) => {
                const volKey = `${mod.id}-${volumeOrder}`;
                const isVolExpanded = expandedVolumes.has(volKey) || !!searchLower;
                const volTopics = chapters.flatMap(c => c.topics);

                // Filter volume visibility by search query
                const volumeMatchesSearch = !searchLower || volTopics.some(n =>
                  n.title.toLowerCase().includes(searchLower) ||
                  (n.description && n.description.toLowerCase().includes(searchLower))
                );
                if (!volumeMatchesSearch) return null;

                return (
                  <div key={volumeOrder}>
                    {mod.structure.length > 1 && (
                      <button
                        onClick={() => toggleVolume(volKey)}
                        className="w-full flex items-center gap-2 px-6 py-2 hover:bg-surface-secondary/30 transition-colors text-left"
                      >
                        <span className="text-[10px] text-text/40 font-bold uppercase tracking-widest flex-1">
                          Volume {volumeOrder}
                        </span>
                        {isVolExpanded
                          ? <ChevronDown className="h-3 w-3 text-text/20" />
                          : <ChevronRight className="h-3 w-3 text-text/20" />
                        }
                      </button>
                    )}

                    {/* Chapters */}
                    {(isVolExpanded || mod.structure.length === 1) &&
                      chapters.map(({ chapterOrder, topics }) => {
                        const chapKey = `${mod.id}-${volumeOrder}-${chapterOrder}`;
                        const isChapExpanded = expandedChapters.has(chapKey) || !!searchLower;
                        const chapLabel = `Chapter ${chapterOrder}`;

                        // Filter by search within chapter
                        const filteredTopics = searchLower
                          ? topics.filter(n =>
                              n.title.toLowerCase().includes(searchLower) ||
                              (n.description && n.description.toLowerCase().includes(searchLower)) ||
                              (n.tags && n.tags.some(t => t.toLowerCase().includes(searchLower)))
                            )
                          : topics;
                        if (filteredTopics.length === 0) return null;

                        return (
                          <div key={chapterOrder}>
                            <button
                              onClick={() => toggleChapter(chapKey)}
                              className="w-full flex items-center gap-2 px-8 py-1.5 hover:bg-surface-secondary/20 transition-colors text-left"
                            >
                              <span className="text-[10px] text-text/30 font-bold uppercase tracking-wider flex-1">
                                {chapLabel}
                              </span>
                              {isChapExpanded
                                ? <ChevronDown className="h-3 w-3 text-text/15" />
                                : <ChevronRight className="h-3 w-3 text-text/15" />
                              }
                            </button>

                            {/* Topics */}
                            {(isChapExpanded || !!searchLower) && filteredTopics.map(node => {
                              const prerequisites = dependencyMap.get(node.id) || [];
                              const status = resolveLearningStatus(
                                node.id, prerequisites, progressMap, new Map()
                              );
                              const sc = STATUS_CONFIG[status] || STATUS_CONFIG[LearningStatus.AVAILABLE];
                              const StatusIcon = sc.icon;
                              const isCurrent = node.id === currentTopicId;
                              const isLocked = status === LearningStatus.LOCKED;

                              // Prerequisite tooltip text
                              const missingPrereqs = prerequisites.filter(pid => {
                                const pp = progressMap.get(pid);
                                return !pp || !pp.lessonCompleted;
                              });

                              return (
                                <div
                                  key={node.id}
                                  ref={isCurrent ? currentRef : null}
                                >
                                  <button
                                    onClick={() => !isLocked && handleTopicClick(node)}
                                    disabled={isLocked}
                                    title={isLocked && missingPrereqs.length > 0
                                      ? `Locked — complete prerequisites first`
                                      : node.title
                                    }
                                    className={`
                                      w-full flex items-center gap-2 px-10 py-2 text-left transition-all duration-150
                                      ${isCurrent
                                        ? 'bg-brand-500/10 border-r-2 border-brand-500'
                                        : isLocked
                                        ? 'opacity-40 cursor-not-allowed'
                                        : 'hover:bg-surface-secondary/40 cursor-pointer'}
                                    `}
                                  >
                                    <StatusIcon className={`h-3.5 w-3.5 flex-shrink-0 ${sc.color}`} />
                                    <span className={`
                                      text-xs truncate flex-1 font-medium
                                      ${isCurrent ? 'text-brand-500 font-bold' : 'text-text/70'}
                                    `}>
                                      {node.title}
                                    </span>
                                    {isCurrent && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse flex-shrink-0" />
                                    )}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })
                    }
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <div className="hidden lg:flex flex-col h-full w-72 flex-shrink-0">
        {content}
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-background/50" onClick={onClose} />
          <div className="relative w-80 h-full flex flex-col shadow-2xl animate-[slideInLeft_0.25s_ease-out_both]">
            {content}
          </div>
          <style>{`
            @keyframes slideInLeft {
              from { transform: translateX(-100%); }
              to   { transform: translateX(0); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}

export default CurriculumNavigator;
