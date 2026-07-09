import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import CommandPalette from '../common/CommandPalette';

export default function LayoutShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(v => !v);
  }, []);

  const openPalette = useCallback(() => setIsPaletteOpen(true), []);
  const closePalette = useCallback(() => setIsPaletteOpen(false), []);

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
    <div className="min-h-screen bg-surface text-text">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        onOpenCommandPalette={openPalette}
      />
      <Topbar toggleSidebar={toggleSidebar} onOpenCommandPalette={openPalette} />

      {/* Main Content Area */}
      <main className="content-area p-6 lg:p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* Global Command Palette */}
      <CommandPalette isOpen={isPaletteOpen} onClose={closePalette} />
    </div>
  );
}
