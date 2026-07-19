import React, { useEffect, useRef, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './presentation/store/useAuthStore';
import { useThemeStore } from './presentation/store/useThemeStore';
import { ErrorBoundary } from './presentation/components/common/ErrorBoundary';
import InstallPrompt from './presentation/components/common/InstallPrompt';

// Layouts
import LayoutShell from './presentation/components/layout/LayoutShell';

// Lazy Loaded Pages
const Login = lazy(() => import('./presentation/pages/auth/Login'));
const Signup = lazy(() => import('./presentation/pages/auth/Signup'));
const ForgotPassword = lazy(() => import('./presentation/pages/auth/ForgotPassword'));
const EmailVerification = lazy(() => import('./presentation/pages/auth/EmailVerification'));
const Dashboard = lazy(() => import('./presentation/pages/dashboard/Dashboard'));
const Courses = lazy(() => import('./presentation/pages/courses/Courses'));
const LessonViewer = lazy(() => import('./presentation/pages/courses/LessonViewer'));
const Compiler = lazy(() => import('./presentation/pages/compiler/Compiler'));
const SearchResults = lazy(() => import('./presentation/pages/search/SearchResults'));
const Interviews = lazy(() => import('./presentation/pages/interview/Interviews'));
const CompanyTrackDetail = lazy(() => import('./presentation/pages/interview/CompanyTrackDetail'));
const MockSession = lazy(() => import('./presentation/pages/interview/MockSession'));
const Revision = lazy(() => import('./presentation/pages/revision/Revision'));
const RevisionDashboard = lazy(() => import('./presentation/pages/revision/RevisionDashboard'));
const FlashcardSession = lazy(() => import('./presentation/pages/revision/FlashcardSession'));
const CheatSheetViewer = lazy(() => import('./presentation/pages/revision/CheatSheetViewer'));
const MindMapViewer = lazy(() => import('./presentation/pages/revision/MindMapViewer'));
const AssistantPage = lazy(() => import('./presentation/pages/assistant/AssistantPage'));
const ProjectCatalog = lazy(() => import('./presentation/pages/projects/ProjectCatalog'));
const ProjectWorkspace = lazy(() => import('./presentation/pages/projects/ProjectWorkspace'));
const GlobalSearch = lazy(() => import('./presentation/pages/search/GlobalSearch'));
const LearningCalendar = lazy(() => import('./presentation/pages/calendar/LearningCalendar'));
const NotesPage = lazy(() => import('./presentation/pages/notes/NotesPage'));
const BookmarksPage = lazy(() => import('./presentation/pages/bookmarks/BookmarksPage'));
const TimelinePage = lazy(() => import('./presentation/pages/timeline/TimelinePage'));
const AchievementsPage = lazy(() => import('./presentation/pages/achievements/AchievementsPage'));
const DownloadCenter = lazy(() => import('./presentation/pages/downloads/DownloadCenter'));
const ExportCenter = lazy(() => import('./presentation/pages/exports/ExportCenter'));
const PreferencesPage = lazy(() => import('./presentation/pages/preferences/PreferencesPage'));

// Learning OS Pages
const ChapterDashboard = lazy(() => import('./presentation/pages/courses/ChapterDashboard'));
const VolumeDashboard = lazy(() => import('./presentation/pages/courses/VolumeDashboard'));

// Error Fallbacks
const NotFound = lazy(() => import('./presentation/pages/errors/NotFound'));
const Unauthorized = lazy(() => import('./presentation/pages/errors/Unauthorized'));

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 10,
    },
  },
});

// Loading fallback spinner
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 border-4 border-default border-t-brand-500 rounded-full animate-spin" />
        <p className="text-xs text-muted font-semibold tracking-wider uppercase">Loading JavaMentor...</p>
      </div>
    </div>
  );
}

// Router guards
function ProtectedRoute({ children }) {
  const { user, isInitializing } = useAuthStore();

  if (isInitializing) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { user, isInitializing } = useAuthStore();

  if (isInitializing) {
    return <LoadingFallback />;
  }

  // Already logged in → go to dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function EmailVerificationRoute() {
  const { user, isInitializing } = useAuthStore();

  if (isInitializing) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <EmailVerification />;
}

export default function App() {
  const initAuth  = useAuthStore((state) => state.init);
  const initTheme = useThemeStore((state) => state.initTheme);

  // Store in refs so the effect never re-fires due to new function references from Zustand
  const initAuthRef  = useRef(initAuth);
  const initThemeRef = useRef(initTheme);

  useEffect(() => {
    // 1. Initialize active color mode class lists
    initThemeRef.current();

    // 2. Initialize Auth state listener (returns unsubscribe fn)
    const unsubscribe = initAuthRef.current();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public Auth Routes */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/signup" 
                element={
                  <PublicRoute>
                    <Signup />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/forgot-password" 
                element={
                  <PublicRoute>
                    <ForgotPassword />
                  </PublicRoute>
                } 
              />

              {/* Email Verification redials */}
              <Route 
                path="/verify-email" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <EmailVerificationRoute />
                  </Suspense>
                } 
              />

              {/* Protected App Routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <LayoutShell />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="courses" element={<Courses />} />
                <Route path="courses/:courseId/topics/:topicSlug" element={<LessonViewer />} />
                <Route path="courses/:courseId/volumes/:volumeId" element={<VolumeDashboard />} />
                <Route path="courses/:courseId/chapters/:chapterId" element={<ChapterDashboard />} />
                <Route path="compiler" element={<Compiler />} />
                <Route path="compiler/problems/:problemId" element={<Compiler />} />
                <Route path="search" element={<SearchResults />} />
                <Route path="interviews" element={<Interviews />}>
                  <Route index element={<Interviews />} />
                  <Route path="company/:companyId" element={<CompanyTrackDetail />} />
                  <Route path="session/:sessionId" element={<MockSession />} />
                </Route>
                <Route path="revision" element={<Revision />}>
                  <Route index element={<RevisionDashboard />} />
                  <Route path="flashcards/:topicSlug" element={<FlashcardSession />} />
                  <Route path="cheatsheet/:topicSlug" element={<CheatSheetViewer />} />
                  <Route path="mindmap/:topicSlug" element={<MindMapViewer />} />
                </Route>
                <Route path="assistant" element={<AssistantPage />} />
                <Route path="projects" element={<ProjectCatalog />} />
                <Route path="projects/:projectId" element={<ProjectWorkspace />} />
                {/* v1.1 Enterprise Enhancement Routes */}
                <Route path="search" element={<GlobalSearch />} />
                <Route path="calendar" element={<LearningCalendar />} />
                <Route path="notes" element={<NotesPage />} />
                <Route path="bookmarks" element={<BookmarksPage />} />
                <Route path="timeline" element={<TimelinePage />} />
                <Route path="achievements" element={<AchievementsPage />} />
                <Route path="downloads" element={<DownloadCenter />} />
                <Route path="exports" element={<ExportCenter />} />
                <Route path="preferences" element={<PreferencesPage />} />
              </Route>

              {/* Error fallback catchers */}
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <InstallPrompt />
          </Suspense>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
