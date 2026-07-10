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
import curriculumWeights from '../../../shared/config/curriculum-weights.json';

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

const MODULE_ORDER = Object.entries(curriculumWeights)
  .filter(([k]) => k !== '_meta')
  .sort((a, b) => (a[1].order || 0) - (b[1].order || 0));

function groupGraphByModule(graph) {
  const moduleMap = {};
  for (const [key, config] of MODULE_ORDER) {
    const nodes = graph.filter(n =>
      n.tags && n.tags.some(t => config.tags.includes(t))
    );
    if (nodes.length > 0) {
      // Group by volume then chapter
      const byVolume = {};
      for (const node of nodes) {
        const vol = node.volume || 1;
        if (!byVolume[vol]) byVolume[vol] = {};
        const chap = node.chapter || 'chapter-1';
        if (!byVolume[vol][chap]) byVolume[vol][chap] = [];
        byVolume[vol][chap].push(node);
      }
      moduleMap[key] = { config, byVolume };
    }
  }
  return moduleMap;
}

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

  const groupedGraph = useMemo(() => groupGraphByModule(graph), [graph]);

  // Auto-expand the section containing the current topic
  useEffect(() => {
    if (!currentTopicId || graph.length === 0) return;
    const node = graph.find(n => n.id === currentTopicId);
    if (!node) return;

    for (const [modKey, config] of MODULE_ORDER) {
      if (config.tags.some(t => node.tags?.includes(t))) {
        setExpandedModules(s => new Set([...s, modKey]));
        setExpandedVolumes(s => new Set([...s, `${modKey}-${node.volume}`]));
        setExpandedChapters(s => new Set([...s, `${modKey}-${node.volume}-${node.chapter}`]));
        break;
      }
    }
  }, [currentTopicId, graph]);

  // Scroll current topic into view
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
    const courseId = node.tags?.includes('Backend') || node.tags?.includes('Spring Boot') ? 'backend' : 'java';
    if (onTopicSelect) {
      onTopicSelect(courseId, node.slug);
    } else {
      navigate(`/courses/${courseId}/topics/${node.slug}`);
    }
    onClose?.();
  };

  const searchLower = search.toLowerCase();

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
        {Object.entries(groupedGraph).map(([modKey, { config, byVolume }]) => {
          const isModuleExpanded = expandedModules.has(modKey);

          // Filter by search
          const allModuleTopics = Object.values(byVolume).flatMap(v => Object.values(v).flat());
          const matchesSearch = !search || allModuleTopics.some(n =>
            n.title.toLowerCase().includes(searchLower)
          );
          if (!matchesSearch) return null;

          // Module completion stats
          const completedCount = allModuleTopics.filter(n => progressMap.get(n.id)?.lessonCompleted).length;

          return (
            <div key={modKey} className="border-b border-surface-border/50">
              {/* Module header */}
              <button
                onClick={() => toggleModule(modKey)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-secondary/50 transition-colors text-left"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-xs font-black text-text flex-1 uppercase tracking-wider">
                  {config.label}
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
              {isModuleExpanded && Object.entries(byVolume)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([vol, chapters]) => {
                  const volKey = `${modKey}-${vol}`;
                  const isVolExpanded = expandedVolumes.has(volKey) || !!search;
                  const volTopics = Object.values(chapters).flat();

                  return (
                    <div key={vol}>
                      {Object.keys(byVolume).length > 1 && (
                        <button
                          onClick={() => toggleVolume(volKey)}
                          className="w-full flex items-center gap-2 px-6 py-2 hover:bg-surface-secondary/30 transition-colors text-left"
                        >
                          <span className="text-[10px] text-text/40 font-bold uppercase tracking-widest flex-1">
                            Volume {vol}
                          </span>
                          {isVolExpanded
                            ? <ChevronDown className="h-3 w-3 text-text/20" />
                            : <ChevronRight className="h-3 w-3 text-text/20" />
                          }
                        </button>
                      )}

                      {/* Chapters */}
                      {(isVolExpanded || Object.keys(byVolume).length === 1) &&
                        Object.entries(chapters).map(([chap, topics]) => {
                          const chapKey = `${modKey}-${vol}-${chap}`;
                          const isChapExpanded = expandedChapters.has(chapKey) || !!search;
                          const chapLabel = chap.replace('chapter-', 'Chapter ').replace('-', ' ');

                          // Filter by search within chapter
                          const filteredTopics = search
                            ? topics.filter(n => n.title.toLowerCase().includes(searchLower))
                            : topics;
                          if (filteredTopics.length === 0) return null;

                          return (
                            <div key={chap}>
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
                              {(isChapExpanded || !!search) && filteredTopics.map(node => {
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
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
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
