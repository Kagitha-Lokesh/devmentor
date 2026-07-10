import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import CommandPalette from '../common/CommandPalette';

export default function LayoutShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(v => !v);
  }, []);

  const openPalette = useCallback(() => setIsPaletteOpen(true), []);
  const closePalette = useCallback(() => setIsPaletteOpen(false), []);

  // Close sidebar on route change (mobile nav)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      // Ctrl+K — Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(v => !v);
        return;
      }
      // / — Global Search (when not in an input)
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        navigate('/search');
        return;
      }
      // Ctrl+/ — Toggle Sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        toggleSidebar();
        return;
      }
      // Alt+Left — Browser back
      if (e.altKey && e.key === 'ArrowLeft') {
        window.history.back();
        return;
      }
      // Alt+Right — Browser forward
      if (e.altKey && e.key === 'ArrowRight') {
        window.history.forward();
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate, toggleSidebar]);

  return (
    <div className="min-h-screen bg-surface text-text overflow-x-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-brand-600 text-primary px-4 py-2 rounded-lg z-[9999] shadow-md font-semibold text-sm">
        Skip to main content
      </a>
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        onOpenCommandPalette={openPalette}
      />
      <Topbar toggleSidebar={toggleSidebar} onOpenCommandPalette={openPalette} />

      {/* Main Content Area — pushes right only on lg+ via CSS */}
      <main id="main-content" tabIndex="-1" className="content-area outline-none">
        <div className="max-w-7xl mx-auto w-full animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* Global Command Palette */}
      <CommandPalette isOpen={isPaletteOpen} onClose={closePalette} />
    </div>
  );
}
