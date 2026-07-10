/**
 * ChapterDashboard — Learning OS chapter overview page
 * Shows chapter completion stats, topic cards with LearningStatus badges,
 * estimated remaining time, and mastery.
 *
 * Route: /courses/:courseId/chapters/:chapterId
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BookOpen, CheckCircle, Lock, Circle, Zap, Clock,
  ArrowLeft, MessageSquare, Layers
} from 'lucide-react';
import { CourseUseCase } from '../../../application/course/CourseUseCase';
import { useAuthStore } from '../../store/useAuthStore';
import { container } from '../../../infrastructure/di/container';
import { resolveLearningStatus, LearningStatus } from '../../../domain/models/LearningStatus';

const courseUseCase = new CourseUseCase();

const STATUS_BADGE = {
  [LearningStatus.MASTERED]:  { label: 'Mastered',  cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  [LearningStatus.QUIZ]:      { label: 'Quiz',       cls: 'bg-amber-500/10  text-amber-500  border-amber-500/20' },
  [LearningStatus.PRACTICE]:  { label: 'Practice',  cls: 'bg-blue-500/10   text-blue-500   border-blue-500/20' },
  [LearningStatus.REVISION]:  { label: 'Revision',  cls: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  [LearningStatus.READING]:   { label: 'Reading',   cls: 'bg-brand-500/10  text-brand-500  border-brand-500/20' },
  [LearningStatus.STARTED]:   { label: 'Started',   cls: 'bg-brand-500/10  text-brand-500  border-brand-500/20' },
  [LearningStatus.AVAILABLE]: { label: 'Available', cls: 'bg-surface-secondary text-text/40 border-surface-border' },
  [LearningStatus.LOCKED]:    { label: 'Locked',    cls: 'bg-surface-secondary text-text/20 border-surface-border' },
};

export default function ChapterDashboard() {
  const { courseId = 'java', chapterId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [topics, setTopics] = useState([]);
  const [progressMap, setProgressMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [chapterLabel, setChapterLabel] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const courseResult = await courseUseCase.getCourseDetails(courseId);
        if (!courseResult.isSuccess) return;

        let chapterTopics = [];
        let label = '';
        for (const vol of courseResult.data.volumes) {
          for (const chap of vol.chapters) {
            if (chap.id === chapterId || chap.slug === chapterId) {
              chapterTopics = chap.topics;
              label = chap.title || chapterId.replace('-', ' ');
              break;
            }
          }
        }

        if (!active) return;
        setTopics(chapterTopics);
        setChapterLabel(label);

        if (user) {
          const progressRepo = container.resolve('IProgressRepository');
          const list = await progressRepo.listProgress(user.uid);
          setProgressMap(new Map(list.map(p => [p.topicId, p])));
        }
      } catch (err) {
        console.error('ChapterDashboard load error:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [courseId, chapterId, user]);

  const completedCount = topics.filter(t => progressMap.get(t.id)?.lessonCompleted).length;
  const masteryScores = topics.map(t => {
    const p = progressMap.get(t.id);
    return p ? Math.round((p.readingPercentage / 100) * 50 + (p.practiceCompleted ? 30 : 0) + (p.quizPassed ? 20 : 0)) : 0;
  });
  const avgMastery = masteryScores.length > 0
    ? Math.round(masteryScores.reduce((a, b) => a + b, 0) / masteryScores.length)
    : 0;
  const estimatedHours = topics.reduce((acc, t) => acc + ((t.estimatedReadingTime || 20) + (t.estimatedPracticeTime || 15)) / 60, 0);
  const completionPct = topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-surface-secondary rounded w-1/3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-surface-secondary rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 text-text">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-text/40 hover:text-text transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-text/40">{courseId.toUpperCase()} · Chapter</p>
          <h1 className="text-2xl font-extrabold">{chapterLabel}</h1>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Topics', value: `${completedCount}/${topics.length}`, icon: BookOpen, color: 'text-brand-500' },
          { label: 'Completion', value: `${completionPct}%`, icon: CheckCircle, color: 'text-emerald-500' },
          { label: 'Mastery', value: `${avgMastery}%`, icon: Zap, color: 'text-amber-500' },
          { label: 'Est. Remaining', value: `${Math.round(estimatedHours * (1 - completionPct / 100))}h`, icon: Clock, color: 'text-purple-500' },
        ].map(stat => (
          <div key={stat.label} className="bg-surface-secondary border border-surface-border rounded-xl p-4">
            <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
            <p className="text-2xl font-black text-text">{stat.value}</p>
            <p className="text-xs text-text/40 font-semibold uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Topic cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {topics.map(topic => {
          const status = resolveLearningStatus(topic.id, [], progressMap, new Map());
          const badge = STATUS_BADGE[status] || STATUS_BADGE[LearningStatus.AVAILABLE];
          const isLocked = status === LearningStatus.LOCKED;

          return (
            <button
              key={topic.id}
              onClick={() => !isLocked && navigate(`/courses/${courseId}/topics/${topic.slug}`)}
              disabled={isLocked}
              className={`
                text-left p-4 rounded-xl border transition-all duration-150
                ${isLocked
                  ? 'opacity-40 cursor-not-allowed bg-surface-secondary border-surface-border'
                  : 'bg-surface-secondary border-surface-border hover:border-brand-500/40 hover:shadow-sm cursor-pointer'}
              `}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-sm text-text flex-1">{topic.title}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex-shrink-0 ${badge.cls}`}>
                  {badge.label}
                </span>
              </div>
              <p className="text-xs text-text/40 mt-1 line-clamp-2">{topic.description}</p>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-text/30 font-semibold">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{topic.estimatedReadingTime || 20}m</span>
                <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />Interview</span>
                <span className="flex items-center gap-1"><Layers className="h-3 w-3" />Flashcards</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
