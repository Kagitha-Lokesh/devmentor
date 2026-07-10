/**
 * VolumeDashboard — Learning OS volume overview page
 * Shows volume-level stats, per-chapter breakdown, and overall completion.
 *
 * Route: /courses/:courseId/volumes/:volumeId
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BookOpen, CheckCircle, Zap, Clock, ArrowLeft, ChevronRight
} from 'lucide-react';
import { CourseUseCase } from '../../../application/course/CourseUseCase';
import { useAuthStore } from '../../store/useAuthStore';
import { container } from '../../../infrastructure/di/container';

const courseUseCase = new CourseUseCase();

export default function VolumeDashboard() {
  const { courseId = 'java', volumeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [volume, setVolume] = useState(null);
  const [progressMap, setProgressMap] = useState(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const courseResult = await courseUseCase.getCourseDetails(courseId);
        if (!courseResult.isSuccess) return;

        const vol = courseResult.data.volumes.find(
          v => String(v.volume) === String(volumeId) || v.id === volumeId || v.slug === volumeId
        );
        if (active && vol) setVolume(vol);

        if (user) {
          const progressRepo = container.resolve('IProgressRepository');
          const list = await progressRepo.listProgress(user.uid);
          if (active) setProgressMap(new Map(list.map(p => [p.topicId, p])));
        }
      } catch (err) {
        console.error('VolumeDashboard load error:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [courseId, volumeId, user]);

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

  if (!volume) {
    return (
      <div className="text-center py-20">
        <p className="text-text/50">Volume not found.</p>
        <button onClick={() => navigate(-1)} className="btn-secondary mt-4 py-2 px-4 text-sm">Go Back</button>
      </div>
    );
  }

  const allTopics = volume.chapters.flatMap(c => c.topics);
  const completedCount = allTopics.filter(t => progressMap.get(t.id)?.lessonCompleted).length;
  const completionPct = allTopics.length > 0 ? Math.round((completedCount / allTopics.length) * 100) : 0;
  const estimatedHours = Math.round(allTopics.reduce((acc, t) => acc + ((t.estimatedReadingTime || 20) + (t.estimatedPracticeTime || 15)) / 60, 0));

  return (
    <div className="space-y-6 pb-12 text-text">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-text/40 hover:text-text transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-text/40">{courseId.toUpperCase()}</p>
          <h1 className="text-2xl font-extrabold">{volume.title || `Volume ${volumeId}`}</h1>
        </div>
      </div>

      {/* Volume stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Topics', value: `${completedCount}/${allTopics.length}`, icon: BookOpen, color: 'text-brand-500' },
          { label: 'Completion', value: `${completionPct}%`, icon: CheckCircle, color: 'text-emerald-500' },
          { label: 'Chapters', value: volume.chapters.length, icon: Zap, color: 'text-amber-500' },
          { label: 'Est. Hours', value: `${estimatedHours}h`, icon: Clock, color: 'text-purple-500' },
        ].map(stat => (
          <div key={stat.label} className="bg-surface-secondary border border-surface-border rounded-xl p-4">
            <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
            <p className="text-2xl font-black text-text">{stat.value}</p>
            <p className="text-xs text-text/40 font-semibold uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Chapter list */}
      <div className="space-y-3">
        {volume.chapters.map(chap => {
          const chapTopics = chap.topics;
          const chapCompleted = chapTopics.filter(t => progressMap.get(t.id)?.lessonCompleted).length;
          const chapPct = chapTopics.length > 0 ? Math.round((chapCompleted / chapTopics.length) * 100) : 0;

          return (
            <button
              key={chap.id || chap.slug}
              onClick={() => navigate(`/courses/${courseId}/chapters/${chap.id || chap.slug}`)}
              className="w-full text-left bg-surface-secondary border border-surface-border rounded-xl p-4 hover:border-brand-500/40 hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-text">{chap.title || chap.id}</p>
                  <p className="text-xs text-text/40">{chapTopics.length} topics · {chapCompleted} completed</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-black ${chapPct === 100 ? 'text-emerald-500' : 'text-brand-500'}`}>
                    {chapPct}%
                  </span>
                  <ChevronRight className="h-4 w-4 text-text/30" />
                </div>
              </div>
              <div className="h-1.5 bg-surface-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${chapPct === 100 ? 'bg-emerald-500' : 'bg-brand-500'}`}
                  style={{ width: `${chapPct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
