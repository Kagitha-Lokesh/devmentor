import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, Award, Play, Search, Filter } from 'lucide-react';
import { CourseUseCase } from '../../../application/course/CourseUseCase';
import { useUserStore } from '../../store/useUserStore';

const courseUseCase = new CourseUseCase();

export default function Courses() {
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  
  const { profile } = useUserStore();

  useEffect(() => {
    let active = true;
    const fetchCourse = async () => {
      const result = await courseUseCase.getCourseDetails('java');
      if (active && result.isSuccess) {
        setCourse(result.data);
        setLoading(false);
      }
    };
    fetchCourse();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 pb-12 animate-pulse" aria-busy="true">
        <div className="h-44 bg-surface-secondary border border-surface-border rounded-2xl" />
        <div className="space-y-4">
          <div className="h-8 bg-surface-secondary rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-28 bg-surface-secondary border border-surface-border rounded-xl" />
            <div className="h-28 bg-surface-secondary border border-surface-border rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-text">Course Content Not Found</h2>
        <p className="text-text/60 mt-2">The requested curriculum registry is currently unavailable.</p>
      </div>
    );
  }

  // Filter volumes and chapters/topics based on search query and difficulty selection
  const filteredVolumes = course.volumes.map(vol => {
    const chapters = vol.chapters.map(chap => {
      const topics = chap.topics.filter(topic => {
        const matchesSearch = 
          topic.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          topic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          topic.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesDifficulty = 
          selectedDifficulty === 'All' || 
          topic.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

        return matchesSearch && matchesDifficulty;
      });
      return { ...chap, topics };
    }).filter(chap => chap.topics.length > 0);

    return { ...vol, chapters };
  }).filter(vol => vol.chapters.length > 0);

  // Compute pacing progress statistics using progress store
  const totalTopics = course.volumes.reduce((acc, v) => 
    acc + v.chapters.reduce((sum, c) => sum + c.topics.length, 0), 0
  );
  
  const completedCount = profile?.progress?.completedLessons?.length ?? 0;
  const progressPercent = totalTopics > 0 ? Math.min(100, Math.floor((completedCount / totalTopics) * 100)) : 0;

  return (
    <div className="space-y-8 pb-12 text-text">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-extrabold text-text tracking-tight">Curriculum Roadmap</h1>
        <p className="text-text/60 mt-2">Browse the complete guided roadmap from computer fundamentals to job readiness.</p>
      </div>

      {/* Main Course Summary card */}
      <div className="bg-surface-secondary border border-surface-border rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-950 border border-brand-800 rounded-full text-brand-300 text-xs font-semibold">
              <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Structured Career Path</span>
            </div>
            <h2 className="text-2xl font-bold text-text">{course.title}</h2>
            <p className="text-text/60 text-sm md:text-base max-w-3xl leading-relaxed">
              Master core computer fundamentals, deep Java memory models, database indexing, Spring Boot architectures, and system design pipelines through dynamic static lessons.
            </p>
            
            <div className="flex flex-wrap gap-3 text-xs font-semibold pt-2">
              <span className="bg-surface px-3 py-1.5 border border-surface-border rounded-lg text-text/80">{course.volumes.length} Volumes</span>
              <span className="bg-surface px-3 py-1.5 border border-surface-border rounded-lg text-text/80">{totalTopics} Core Topics</span>
              <span className="bg-surface px-3 py-1.5 border border-surface-border rounded-lg text-brand-500 dark:text-brand-300">Beginner to Advanced</span>
            </div>
          </div>

          {/* Progress side block */}
          <div className="lg:w-80 bg-surface border border-surface-border p-6 rounded-xl shrink-0 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center text-sm font-semibold mb-2">
                <span className="text-text/50">My Pacing Progress</span>
                <span className="text-brand-500 dark:text-brand-300">{progressPercent}%</span>
              </div>
              <div className="w-full bg-surface-secondary h-2.5 rounded-full overflow-hidden border border-surface-border">
                <div 
                  className="bg-brand-500 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${progressPercent}%` }} 
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between text-xs text-text/40 border-t border-surface-border pt-4">
              <span>Completed: {completedCount} / {totalTopics} Topics</span>
              <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5 text-brand-400" /> Certification Track</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface-secondary border border-surface-border p-4 rounded-xl">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-text/40" />
          <input
            type="text"
            placeholder="Search topics, keywords, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>

        <div className="flex gap-2.5 w-full sm:w-auto shrink-0 justify-end">
          <Filter className="h-4 w-4 text-text/40 self-center hidden sm:block" />
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 bg-surface border border-surface-border rounded-lg text-sm text-text focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="All">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* List of Volumes, Chapters, and Topics */}
      <div className="space-y-8">
        {filteredVolumes.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-surface-border rounded-2xl bg-surface-secondary/40">
            <BookOpen className="h-8 w-8 text-text/30 mx-auto mb-3" />
            <h3 className="font-bold text-text">No Topics Match Filters</h3>
            <p className="text-sm text-text/50 mt-1">Try adjusting your search queries or difficulty parameters.</p>
          </div>
        ) : (
          filteredVolumes.map((vol) => (
            <div key={vol.num} className="space-y-4">
              {/* Volume Title */}
              <div className="flex items-center gap-3 border-b border-surface-border pb-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-500 bg-brand-950/40 border border-brand-900/60 px-2 py-0.5 rounded">
                  Volume 0{vol.num}
                </span>
                <h3 className="text-lg font-bold text-text">{vol.title}</h3>
              </div>

              {/* Chapters list inside Volume */}
              <div className="space-y-6 pl-2">
                {vol.chapters.map((chap) => (
                  <div key={chap.id} className="space-y-3">
                    <h4 className="text-sm font-semibold text-text/60 tracking-tight">{chap.title}</h4>
                    
                    {/* Topics Grid inside Chapter */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {chap.topics.map((topic) => {
                        const isCompleted = profile?.progress?.completedLessons?.includes(topic.id);
                        return (
                          <div 
                            key={topic.id}
                            onClick={() => navigate(`/courses/java/topics/${topic.slug}`)}
                            className="group bg-surface-secondary border border-surface-border rounded-xl p-5 hover:border-brand-500 hover:bg-surface-tertiary transition-all duration-150 cursor-pointer flex justify-between items-start"
                          >
                            <div className="space-y-1.5 flex-1 pr-4">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  topic.difficulty === 'Beginner' ? 'bg-green-950 text-green-300 border border-green-800' :
                                  topic.difficulty === 'Intermediate' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                                  'bg-red-950 text-red-300 border border-red-800'
                                }`}>
                                  {topic.difficulty}
                                </span>
                                {isCompleted && (
                                  <span className="text-[10px] font-semibold bg-brand-950 text-brand-300 border border-brand-800 px-2 py-0.5 rounded-full">
                                    Completed
                                  </span>
                                )}
                              </div>
                              
                              <h5 className="font-bold text-text group-hover:text-brand-500 dark:group-hover:text-brand-300 transition-colors">
                                {topic.title}
                              </h5>
                              <p className="text-xs text-text/50 line-clamp-2 leading-relaxed">
                                {topic.description}
                              </p>
                              <div className="text-[10px] text-text/40 pt-1.5 font-medium">
                                Estimated time: {topic.estimatedMinutes} mins
                              </div>
                            </div>

                            <button
                              aria-label={`Start learning ${topic.title}`}
                              className="h-8 w-8 rounded-full bg-surface border border-surface-border text-brand-500 dark:text-brand-300 flex items-center justify-center group-hover:bg-brand-600 group-hover:border-brand-600 group-hover:text-primary transition-colors cursor-pointer shrink-0"
                            >
                              <Play className="h-3.5 w-3.5 fill-current" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
