import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronRight, 
  ArrowLeft, 
  ArrowRight,
  BookOpen, 
  Code, 
  History, 
  FileText, 
  CheckCircle,
  HelpCircle,
  Layers,
  Award,
  BookMarked,
  Map as MapIcon
} from 'lucide-react';
import { CourseUseCase } from '../../../application/course/CourseUseCase';
import { ContentLoaderUseCase } from '../../../application/content/ContentLoaderUseCase';
import { MarkdownRenderer, slugify } from '../../components/common/MarkdownRenderer';
import { useUserStore } from '../../store/useUserStore';
import { useAuthStore } from '../../store/useAuthStore';
import { container } from '../../../infrastructure/di/container';
import { Result } from '../../../shared/result/Result';

// Learning OS Components
import { LearningBreadcrumb } from '../../components/course/LearningBreadcrumb';
import { GuidedFlowStepper } from '../../components/course/GuidedFlowStepper';
import { ContinueButton } from '../../components/course/ContinueButton';
import { TopicCompletionModal } from '../../components/course/TopicCompletionModal';
import { CurriculumNavigator } from '../../components/course/CurriculumNavigator';

const courseUseCase = new CourseUseCase();
const contentLoaderUseCase = new ContentLoaderUseCase();

export default function LessonViewer() {
  const { courseId = 'java', topicSlug } = useParams();
  const navigate = useNavigate();
  
  const [topic, setTopic] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Navigation siblings
  const [prevTopic, setPrevTopic] = useState(null);
  const [nextTopic, setNextTopic] = useState(null);

  // Full graph for Navigator and position
  const [fullGraph, setFullGraph] = useState([]);
  const [progressMap, setProgressMap] = useState(new Map());
  const [dependencyMap, setDependencyMap] = useState(new Map());
  const [topicPosition, setTopicPosition] = useState(null);
  const [topicProgress, setTopicProgress] = useState(null);
  const [topicMastery, setTopicMastery] = useState(null);

  // Active viewing tab: 'lesson' | 'examples' | 'revision' | 'cheatsheet' | 'quiz' | 'flashcards' | 'interview'
  const [activeTab, setActiveTab] = useState('lesson');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [headings, setHeadings] = useState([]);
  
  // Interactive Quizzes states
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);

  // Interactive Flashcards states
  const [activeFlashcard, setActiveFlashcard] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  // Learning OS UI states
  const [navigatorOpen, setNavigatorOpen] = useState(false);
  const [completionModalOpen, setCompletionModalOpen] = useState(false);

  const containerRef = useRef(null);
  const { profile, completeActivity } = useUserStore();

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      // Reset quiz and card states
      setSelectedAnswers({});
      setSubmittedQuiz(false);
      setActiveFlashcard(0);
      setFlashcardFlipped(false);
      setCompletionModalOpen(false);

      try {
        // 1. Fetch Topic details
        const topicResult = await courseUseCase.getTopicBySlug(courseId, topicSlug);
        if (!active) return;

        if (!topicResult.isSuccess || topicResult.isEmpty) {
          setError('Topic not found.');
          setLoading(false);
          return;
        }

        const topicData = topicResult.data;
        setTopic(topicData);

        const { user } = useAuthStore.getState();
        if (user && topicData.id) {
          const learningUseCase = container.resolve('LearningUseCase');
          learningUseCase.startLesson(user.uid, topicData.id);
        }

        // 2. Fetch full graph + progress + mastery for Navigator and position
        try {
          const graphRepo = container.resolve('IKnowledgeGraphRepository');
          const graph = await graphRepo.getGraph();
          if (active) {
            setFullGraph(graph);

            // Compute topic position
            const progressHubUseCase = container.resolve('ProgressHubUseCase');
            const position = progressHubUseCase.computeTopicPosition(topicData.id, graph);
            setTopicPosition(position);

            // Build dependency map
            const depMap = new Map();
            for (const node of graph) {
              const prereqs = await graphRepo.getPrerequisites(node.id);
              if (prereqs.length > 0) depMap.set(node.id, prereqs);
            }
            setDependencyMap(depMap);

            // Load progress map for the navigator
            if (user) {
              const progressRepo = container.resolve('IProgressRepository');
              const masteryRepo = container.resolve('IMasteryRepository');
              const [progressList, masteryList] = await Promise.all([
                progressRepo.listProgress(user.uid),
                masteryRepo.listMastery(user.uid)
              ]);
              const pMap = new Map(progressList.map(p => [p.topicId, p]));
              setProgressMap(pMap);
              setTopicProgress(pMap.get(topicData.id) || null);
              setTopicMastery(masteryList.find(m => m.topicId === topicData.id) || null);
            }
          }
        } catch (graphErr) {
          // Non-critical — navigator gracefully degrades
          console.warn('Navigator data load error:', graphErr.message);
        }

        // 3. Fetch Sibling navigations
        const courseResult = await courseUseCase.getCourseDetails(courseId);
        if (courseResult.isSuccess) {
          const flatTopics = [];
          courseResult.data.volumes.forEach(vol => {
            vol.chapters.forEach(chap => {
              chap.topics.forEach(t => flatTopics.push(t));
            });
          });

          const currentIndex = flatTopics.findIndex(t => t.id === topicData.id);
          setPrevTopic(currentIndex > 0 ? flatTopics[currentIndex - 1] : null);
          setNextTopic(currentIndex < flatTopics.length - 1 ? flatTopics[currentIndex + 1] : null);
        }

        // 4. Load Markdown & JSON assets packages
        const contentResult = await contentLoaderUseCase.loadLessonContent(topicData);
        if (!active) return;

        if (contentResult.isSuccess) {
          setLesson(contentResult.data);
          
          // Extract headings from markdown content for sticky index
          const list = [];
          const lines = contentResult.data.markdownContent.split('\n');
          lines.forEach(line => {
            if (line.startsWith('## ')) {
              const title = line.replace('## ', '').trim();
              list.push({ title, slug: slugify(title) });
            }
          });
          setHeadings(list);
        } else {
          setError('Failed to fetch lesson files.');
        }
      } catch (err) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [courseId, topicSlug]);

  // Scroll listener for reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const element = containerRef.current;
      const totalHeight = element.scrollHeight - element.clientHeight;
      if (totalHeight === 0) return;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(Math.min(100, progress));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, activeTab]);

  const handleMarkComplete = async () => {
    if (!topic) return;
    try {
      const { user } = useAuthStore.getState();
      if (user) {
        const learningUseCase = container.resolve('LearningUseCase');
        await learningUseCase.completeLesson(user.uid, topic.id, 100);
        // Refresh progress
        const progressRepo = container.resolve('IProgressRepository');
        const updated = await progressRepo.getProgress(user.uid, topic.id);
        setTopicProgress(updated);
      }
      // Keep existing compatibility progress complete activity too
      await completeActivity(20, 'lesson_completed', topic.id);
    } catch (err) {
      console.error('Failed to update progress logs:', err.message);
    }
  };

  const handleQuizSubmit = async () => {
    setSubmittedQuiz(true);
    if (!topic || !lesson) return;

    // Calculate score
    const correct = lesson.quiz.filter((q, idx) =>
      selectedAnswers[idx] === q.answerIndex
    ).length;
    const score = Math.round((correct / lesson.quiz.length) * 100);

    try {
      const { user } = useAuthStore.getState();
      if (user) {
        const learningUseCase = container.resolve('LearningUseCase');
        await learningUseCase.passQuiz(user.uid, topic.id, score);
        const progressRepo = container.resolve('IProgressRepository');
        const updated = await progressRepo.getProgress(user.uid, topic.id);
        setTopicProgress(updated);
        if (updated?.isFullyComplete) {
          setCompletionModalOpen(true);
        }
      }
    } catch (err) {
      console.error('Failed to save quiz result:', err.message);
    }
  };

  const handleFlashcardsComplete = async () => {
    if (!topic) return;
    try {
      const { user } = useAuthStore.getState();
      if (user) {
        const learningUseCase = container.resolve('LearningUseCase');
        await learningUseCase.markFlashcardsReviewed(user.uid, topic.id);
        const progressRepo = container.resolve('IProgressRepository');
        const updated = await progressRepo.getProgress(user.uid, topic.id);
        setTopicProgress(updated);
        if (updated?.isFullyComplete) {
          setCompletionModalOpen(true);
        }
      }
    } catch (err) {
      console.error('Failed to mark flashcards reviewed:', err.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 pb-12 animate-pulse text-text" aria-busy="true">
        {/* Breadcrumb skeleton */}
        <div className="h-6 bg-surface-secondary rounded w-1/4" />
        {/* Header block skeleton */}
        <div className="space-y-3">
          <div className="h-10 bg-surface-secondary rounded w-1/2" />
          <div className="h-4 bg-surface-secondary rounded w-3/4" />
        </div>
        {/* Layout skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-4">
          <div className="lg:col-span-3 space-y-6">
            <div className="h-10 bg-surface-secondary rounded" />
            <div className="h-96 bg-surface-secondary border border-surface-border rounded-xl" />
          </div>
          <div className="hidden lg:block space-y-4">
            <div className="h-4 bg-surface-secondary rounded w-1/2" />
            <div className="h-40 bg-surface-secondary border border-surface-border rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !topic || !lesson) {
    return (
      <div className="text-center py-20 text-text">
        <h2 className="text-2xl font-bold">Content Unavailable</h2>
        <p className="text-text/50 mt-2 max-w-md mx-auto">
          {error || "The requested lesson is currently missing from our curriculum cache."}
        </p>
        <button 
          onClick={() => navigate('/courses')}
          className="btn-primary mt-6 py-2 px-5 inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Courses
        </button>
      </div>
    );
  }

  const isCompleted = profile?.progress?.completedLessons?.includes(topic.id);
  const estimatedReadingTime = Math.max(1, Math.ceil(lesson.markdownContent.split(/\s+/).length / 200));

  const tabItems = [
    { id: 'lesson', label: 'Lesson', icon: BookOpen },
    { id: 'examples', label: 'Practice', icon: Code },
    { id: 'revision', label: 'Revision', icon: History },
    { id: 'cheatsheet', label: 'Cheat Sheet', icon: FileText },
    { id: 'quiz', label: 'Quiz', icon: HelpCircle },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'interview', label: 'Interview', icon: BookMarked }
  ];

  return (
    <div ref={containerRef} className="pb-16 text-text font-sans scroll-smooth">
      {/* Dynamic Reading Progress indicator */}
      {activeTab === 'lesson' && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-surface-border z-50">
          <div 
            className="bg-brand-500 h-full transition-all duration-75"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      )}

      {/* Learning OS Breadcrumb with position counter */}
      <LearningBreadcrumb
        courseId={courseId}
        courseLabel="Java"
        volumeLabel={topicPosition ? topicPosition.volumeLabel : undefined}
        chapterLabel={topicPosition?.chapterLabel}
        topicTitle={topic.title}
        topicIndex={topicPosition?.topicIndex}
        totalTopics={topicPosition?.totalTopics}
      />

      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-surface-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-text tracking-tight">{topic.title}</h1>
          <p className="text-sm text-text/50 mt-1.5 flex items-center gap-4">
            <span>Difficulty: <strong className="text-brand-500 dark:text-brand-300 font-semibold">{topic.difficulty}</strong></span>
            <span>•</span>
            <span>Est. Reading: {estimatedReadingTime} mins</span>
            {topicPosition && (
              <>
                <span>•</span>
                <span>Topic {topicPosition.topicIndex} of {topicPosition.totalTopics}</span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile roadmap button */}
          <button
            onClick={() => setNavigatorOpen(true)}
            className="lg:hidden btn-secondary py-2 px-3 text-xs flex items-center gap-2"
            aria-label="Open curriculum roadmap"
          >
            <MapIcon className="h-4 w-4" />
            Roadmap
          </button>

          {/* Completion button */}
          <button
            onClick={handleMarkComplete}
            disabled={isCompleted}
            className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all flex items-center gap-2 cursor-pointer ${
              isCompleted 
                ? 'bg-green-500/10 border-green-500/30 text-green-500 dark:text-green-400 cursor-default' 
                : 'btn-secondary hover:border-brand-500'
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            {isCompleted ? 'Lesson Done ✓' : 'Mark Lesson Complete'}
          </button>
        </div>
      </div>

      {/* Guided Flow Stepper */}
      <GuidedFlowStepper
        progress={topicProgress}
        activeTab={activeTab}
        onStepClick={tab => setActiveTab(tab)}
      />

      {/* Main layout: Navigator + Content + ToC */}
      <div className="flex gap-0 min-h-[500px]">

        {/* Left: Curriculum Navigator (desktop) */}
        <CurriculumNavigator
          graph={fullGraph}
          progressMap={progressMap}
          dependencyMap={dependencyMap}
          currentTopicId={topic.id}
          onTopicSelect={(cId, slug) => navigate(`/courses/${cId}/topics/${slug}`)}
          isOpen={navigatorOpen}
          onClose={() => setNavigatorOpen(false)}
        />

        {/* Center: Tab content */}
        <div className="flex-1 min-w-0 lg:pl-6">
          {/* Tab Selectors bar */}
          <div className="flex overflow-x-auto gap-1 border-b border-surface-border pb-px mb-8 scrollbar-hide">
            {tabItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                    isActive 
                      ? 'border-brand-500 text-brand-600 dark:text-brand-300' 
                      : 'border-transparent text-text/50 hover:text-text hover:border-text/20'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Tab content area */}
          <div id="tab-content-area" className="grid grid-cols-1 lg:grid-cols-4 gap-8">

            {/* Content column */}
            <div className="lg:col-span-3 min-h-[500px]">
              
              {/* TAB 1: Main Markdown lesson */}
              {activeTab === 'lesson' && (
                <article className="prose max-w-none">
                  {lesson.markdownContent ? (
                    <MarkdownRenderer content={lesson.markdownContent} />
                  ) : (
                    <p className="text-text/50 italic">No lesson content found for this topic.</p>
                  )}
                </article>
              )}

              {/* TAB 2: Practice (Examples + Inline Compiler hint) */}
              {activeTab === 'examples' && (
                <div className="space-y-6">
                  <article className="prose max-w-none">
                    {lesson.examplesContent ? (
                      <MarkdownRenderer content={lesson.examplesContent} />
                    ) : (
                      <p className="text-text/50 italic">No code examples found for this topic.</p>
                    )}
                  </article>

                  {/* Open in Compiler CTA */}
                  <div className="flex items-center gap-3 p-4 bg-brand-500/5 border border-brand-500/20 rounded-xl">
                    <Code className="h-5 w-5 text-brand-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-text">Ready to practice?</p>
                      <p className="text-xs text-text/50">Open the full compiler with this topic's problems.</p>
                    </div>
                    <button
                      onClick={() => navigate('/compiler')}
                      className="btn-primary py-2 px-4 text-xs whitespace-nowrap"
                    >
                      Open Compiler →
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: Quick Revision */}
              {activeTab === 'revision' && (
                <article className="prose max-w-none">
                  {lesson.revisionContent ? (
                    <MarkdownRenderer content={lesson.revisionContent} />
                  ) : (
                    <p className="text-text/50 italic">No revision notes found for this topic.</p>
                  )}
                </article>
              )}

              {/* TAB 4: Cheat Sheet */}
              {activeTab === 'cheatsheet' && (
                <article className="prose max-w-none">
                  {lesson.cheatsheetContent ? (
                    <MarkdownRenderer content={lesson.cheatsheetContent} />
                  ) : (
                    <p className="text-text/50 italic">No cheat sheet lines found for this topic.</p>
                  )}
                </article>
              )}

              {/* TAB 5: Concept Quiz */}
              {activeTab === 'quiz' && (
                <div className="space-y-6">
                  {lesson.quiz.length === 0 ? (
                    <p className="text-text/50 italic">No quiz questions compiled for this topic.</p>
                  ) : (
                    <>
                      <div className="bg-surface-secondary border border-surface-border p-5 rounded-xl">
                        <h3 className="font-bold text-text mb-1">Concept Evaluation Quiz</h3>
                        <p className="text-xs text-text/50">Answer the following questions to verify your technical understanding.</p>
                        {submittedQuiz && topicProgress?.quizScore != null && (
                          <p className="text-sm font-bold mt-2 text-brand-500">
                            Score: {topicProgress.quizScore}%
                          </p>
                        )}
                      </div>

                      {lesson.quiz.map((q, idx) => (
                        <div key={idx} className="bg-surface-secondary border border-surface-border p-6 rounded-xl space-y-4">
                          <h4 className="font-bold text-text">{idx + 1}. {q.question}</h4>
                          
                          <div className="space-y-2">
                            {q.options.map((opt, optIdx) => {
                              const isSelected = selectedAnswers[idx] === optIdx;
                              const isCorrect = q.answerIndex === optIdx;
                              
                              let optStyle = 'border-surface-border hover:bg-surface-tertiary/40';
                              if (isSelected) {
                                optStyle = 'border-brand-500 bg-brand-500/5 text-brand-600 dark:text-brand-300';
                              }
                              if (submittedQuiz) {
                                if (isCorrect) {
                                  optStyle = 'border-green-500 bg-green-500/5 text-green-500';
                                } else if (isSelected) {
                                  optStyle = 'border-red-500 bg-red-500/5 text-red-500';
                                }
                              }

                              return (
                                <button
                                  key={optIdx}
                                  disabled={submittedQuiz}
                                  onClick={() => setSelectedAnswers({ ...selectedAnswers, [idx]: optIdx })}
                                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all flex justify-between items-center ${
                                    submittedQuiz ? 'cursor-default' : 'cursor-pointer'
                                  } ${optStyle}`}
                                >
                                  <span>{opt}</span>
                                </button>
                              );
                            })}
                          </div>

                          {submittedQuiz && (
                            <div className="bg-surface p-4 border border-surface-border rounded-lg text-xs leading-relaxed text-text/70 animate-slide-up">
                              <strong className="text-text font-semibold block mb-1">Explanation:</strong>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      ))}

                      <div className="flex justify-end pt-4">
                        {!submittedQuiz ? (
                          <button
                            onClick={handleQuizSubmit}
                            disabled={Object.keys(selectedAnswers).length < lesson.quiz.length}
                            className="btn-primary py-2.5 px-6 font-semibold shadow-lg shadow-brand-900/20"
                          >
                            Submit Answers
                          </button>
                        ) : (
                          <div className="flex gap-3">
                            <button
                              onClick={() => {
                                setSelectedAnswers({});
                                setSubmittedQuiz(false);
                              }}
                              className="btn-secondary py-2.5 px-5"
                            >
                              Retry Quiz
                            </button>
                            <ContinueButton
                              progress={topicProgress}
                              topic={topic}
                              onTabChange={setActiveTab}
                              onNextTopic={() => nextTopic && navigate(`/courses/java/topics/${nextTopic.slug}`)}
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 6: Flashcards */}
              {activeTab === 'flashcards' && (
                <div className="space-y-6 max-w-xl mx-auto">
                  {lesson.flashcards.length === 0 ? (
                    <p className="text-text/50 italic">No flashcards compiled for this topic.</p>
                  ) : (
                    <>
                      <div className="text-center text-xs text-text/40 font-semibold uppercase tracking-wider">
                        Card {activeFlashcard + 1} of {lesson.flashcards.length}
                      </div>

                      {/* Flippable Flashcard */}
                      <div 
                        onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                        className="h-64 w-full bg-surface-secondary border border-surface-border rounded-2xl p-8 flex flex-col justify-between items-center text-center shadow-xl cursor-pointer hover:border-brand-500/80 transition-all select-none relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-brand-500/10" />
                        
                        <div className="my-auto flex flex-col items-center justify-center min-h-[120px]">
                          {flashcardFlipped ? (
                            <div className="animate-fade-in text-brand-500 dark:text-brand-300 font-semibold text-lg leading-relaxed">
                              {lesson.flashcards[activeFlashcard].answer}
                            </div>
                          ) : (
                            <div className="animate-fade-in text-text font-bold text-xl leading-relaxed">
                              {lesson.flashcards[activeFlashcard].question}
                            </div>
                          )}
                        </div>

                        <div className="text-xs text-text/30 font-medium">
                          {flashcardFlipped ? 'Click card to see Question' : 'Click card to reveal Answer'}
                        </div>
                      </div>

                      {/* Card Navigation */}
                      <div className="flex justify-between gap-4 pt-4">
                        <button
                          disabled={activeFlashcard === 0}
                          onClick={() => {
                            setActiveFlashcard(activeFlashcard - 1);
                            setFlashcardFlipped(false);
                          }}
                          className="btn-secondary flex-1 py-2"
                        >
                          Previous
                        </button>
                        {activeFlashcard === lesson.flashcards.length - 1 ? (
                          <button
                            onClick={handleFlashcardsComplete}
                            className="btn-primary flex-1 py-2"
                          >
                            Complete Review ✓
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveFlashcard(activeFlashcard + 1);
                              setFlashcardFlipped(false);
                            }}
                            className="btn-primary flex-1 py-2"
                          >
                            Next Card
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 7: Interview Prep */}
              {activeTab === 'interview' && (
                <div className="space-y-6">
                  {lesson.interview.length === 0 ? (
                    <p className="text-text/50 italic">No interview prep questions compiled for this topic.</p>
                  ) : (
                    <>
                      <div className="bg-surface-secondary border border-surface-border p-5 rounded-xl">
                        <h3 className="font-bold text-text mb-1 flex items-center gap-2">
                          <Award className="h-4.5 w-4.5 text-brand-400" />
                          Technical Interview Preparation
                        </h3>
                        <p className="text-xs text-text/50">Compare your conceptual explanations against the ideal industry outlines.</p>
                      </div>

                      {lesson.interview.map((q, idx) => (
                        <div key={idx} className="bg-surface-secondary border border-surface-border p-6 rounded-xl space-y-3">
                          <div className="flex justify-between items-start gap-3">
                            <h4 className="font-bold text-text flex-1">Q: {q.question}</h4>
                            <span className="text-[10px] font-bold bg-brand-950 border border-brand-800 text-brand-300 px-2 py-0.5 rounded">
                              {q.importance} Importance
                            </span>
                          </div>
                          <div className="bg-surface p-4 border border-surface-border rounded-lg text-sm leading-relaxed text-text/80">
                            <strong className="text-text font-semibold block mb-1">Ideal Answer Guide:</strong>
                            {q.idealAnswer}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Sticky Table of Contents (lesson tab) or Topic Stats */}
            <div className="hidden lg:block">
              {activeTab === 'lesson' && headings.length > 0 && (
                <nav className="sticky top-24 border border-surface-border bg-surface-secondary/40 p-5 rounded-xl max-h-[calc(100vh-140px)] overflow-y-auto" aria-label="Table of contents">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-text/40 mb-3">On This Page</h4>
                  <ul className="space-y-2.5 text-xs">
                    {headings.map((h, idx) => (
                      <li key={idx}>
                        <a 
                          href={`#${h.slug}`}
                          className="text-text/60 hover:text-brand-500 font-semibold block transition-colors leading-relaxed truncate"
                        >
                          {h.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}

              {/* Topic Stats Card */}
              {topicProgress && (
                <div className="sticky top-24 mt-4 border border-surface-border bg-surface-secondary/40 p-4 rounded-xl text-xs space-y-2">
                  <h4 className="font-mono font-bold uppercase tracking-wider text-text/40 mb-2 text-[10px]">Topic Stats</h4>
                  <div className="flex justify-between">
                    <span className="text-text/50">Mastery</span>
                    <span className="font-bold text-brand-500">{topicMastery?.score ?? 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text/50">Reading</span>
                    <span className="font-bold">{topicProgress.readingPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text/50">Quiz Score</span>
                    <span className="font-bold">{topicProgress.quizPassed ? `${topicProgress.quizScore}%` : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text/50">Practice</span>
                    <span className={`font-bold ${topicProgress.practiceCompleted ? 'text-emerald-500' : 'text-text/30'}`}>
                      {topicProgress.practiceCompleted ? '✓' : '○'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text/50">Flashcards</span>
                    <span className={`font-bold ${topicProgress.flashcardsReviewed ? 'text-emerald-500' : 'text-text/30'}`}>
                      {topicProgress.flashcardsReviewed ? '✓' : '○'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Continue Button */}
          <div className="mt-8 pt-6 border-t border-surface-border flex items-center justify-between">
            <ContinueButton
              progress={topicProgress}
              topic={topic}
              onTabChange={setActiveTab}
              onNextTopic={() => nextTopic && navigate(`/courses/java/topics/${nextTopic.slug}`)}
            />
            <span className="text-xs text-text/30">
              {topicProgress?.isFullyComplete ? '🎉 Topic Mastered' : 'Complete all steps to master this topic'}
            </span>
          </div>
        </div>
      </div>

      {/* Prev / Next navigation footer */}
      <footer className="mt-12 pt-6 border-t border-surface-border flex justify-between gap-4">
        {prevTopic ? (
          <button
            onClick={() => navigate(`/courses/java/topics/${prevTopic.slug}`)}
            className="btn-secondary py-2.5 px-4 text-xs flex items-center gap-2 hover:border-brand-500"
          >
            <ArrowLeft className="h-4 w-4" />
            <div className="text-left">
              <span className="text-[9px] block opacity-40 font-mono">PREVIOUS LESSON</span>
              <span className="font-bold truncate max-w-[120px] sm:max-w-none">{prevTopic.title}</span>
            </div>
          </button>
        ) : (
          <div />
        )}

        {nextTopic ? (
          <button
            onClick={() => navigate(`/courses/java/topics/${nextTopic.slug}`)}
            className="btn-primary py-2.5 px-4 text-xs flex items-center gap-2"
          >
            <div className="text-right">
              <span className="text-[9px] block opacity-50 font-mono">NEXT LESSON</span>
              <span className="font-bold truncate max-w-[120px] sm:max-w-none">{nextTopic.title}</span>
            </div>
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <div />
        )}
      </footer>

      {/* Topic Completion Modal */}
      <TopicCompletionModal
        isOpen={completionModalOpen}
        onClose={() => setCompletionModalOpen(false)}
        topic={topic}
        masteryScore={topicMastery?.score ?? 0}
        xpEarned={120}
        nextTopic={nextTopic}
        onNextTopic={() => nextTopic && navigate(`/courses/java/topics/${nextTopic.slug}`)}
      />
    </div>
  );
}
