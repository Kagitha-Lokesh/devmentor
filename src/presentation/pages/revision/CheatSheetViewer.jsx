import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Menu } from 'lucide-react';
import { container } from '../../../infrastructure/di/container';
import { useAuthStore } from '../../store/useAuthStore';
import { MarkdownRenderer, slugify } from '../../components/common/MarkdownRenderer';
import revisionIndex from '../../../shared/generated/revision-index.json';

export default function CheatSheetViewer() {
  const { topicSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const uid = user?.uid || 'anonymous';

  const [isLoading, setIsLoading] = useState(true);
  const [cheatSheet, setCheatSheet] = useState(null);
  const [content, setContent] = useState('');
  const [toc, setToc] = useState([]);
  const [activeAnchor, setActiveAnchor] = useState('');

  const revisionUseCase = container.resolve('RevisionUseCase');

  const match = revisionIndex.find((r) => r.slug === topicSlug);
  const topicId = match ? match.topicId : null;

  useEffect(() => {
    if (!topicId) {
      navigate('/revision');
      return;
    }

    async function loadCheatSheet() {
      setIsLoading(true);
      try {
        const cs = await revisionUseCase.getCheatSheet(uid, topicId);
        if (!cs) {
          navigate('/revision');
          return;
        }
        setCheatSheet(cs);

        // Fetch markdown content
        const res = await fetch(cs.markdownPath);
        if (res.ok) {
          const text = await res.text();
          setContent(text);

          // Parse headings for TOC
          const parsedHeadings = [];
          const lines = text.split('\n');
          lines.forEach((line) => {
            const headingMatch = line.match(/^(##|###)\s+(.*)$/);
            if (headingMatch) {
              const level = headingMatch[1].length; // 2 (h2) or 3 (h3)
              const titleText = headingMatch[2].replace(/[*_`]/g, '').trim();
              const id = slugify(titleText);
              parsedHeadings.push({ level, text: titleText, id });
            }
          });
          setToc(parsedHeadings);
        }
      } catch (err) {
        console.error('Error loading cheatsheet:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCheatSheet();
  }, [topicId, uid]);

  // Handle scroll tracking for active TOC highlight
  useEffect(() => {
    if (toc.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      let active = '';

      for (let i = 0; i < toc.length; i++) {
        const el = document.getElementById(toc[i].id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            active = toc[i].id;
          }
        }
      }
      setActiveAnchor(active || toc[0]?.id);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [toc]);

  if (isLoading) {
    return <CheatSheetViewerSkeleton />;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 print:p-0">
      {/* Header and Toolbar (hidden when printing) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4 print:hidden">
        <div className="space-y-1">
          <button 
            onClick={() => navigate('/revision')}
            className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-extrabold text-white">
            {cheatSheet?.title} Cheat Sheet
          </h1>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-350 hover:text-white transition-all cursor-pointer shadow"
        >
          <Printer className="h-4 w-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* TOC Sidebar Panel (hidden when printing) */}
        <div className="lg:col-span-1 sticky top-24 self-start bg-slate-900 border border-slate-850 p-4 rounded-2xl shadow-xl print:hidden max-h-[70vh] overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 mb-3 flex items-center gap-1.5">
            <Menu className="h-4 w-4 text-brand-400" />
            Table of Contents
          </h3>
          {toc.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No headings identified.</p>
          ) : (
            <nav className="space-y-1 text-xs">
              {toc.map((item, idx) => (
                <a
                  key={idx}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                    setActiveAnchor(item.id);
                  }}
                  className={`block py-1.5 border-l-2 transition-all ${
                    item.level === 3 ? 'pl-4' : 'pl-2'
                  } ${
                    activeAnchor === item.id 
                      ? 'border-brand-500 text-brand-400 font-bold bg-brand-950/10' 
                      : 'border-transparent text-slate-500 hover:text-slate-350 hover:border-slate-800'
                  }`}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          )}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-850/80 rounded-2xl p-6 md:p-8 shadow-2xl print:bg-transparent print:border-none print:shadow-none print:p-0">
          <div className="print:block hidden mb-6">
            <h1 className="text-3xl font-black text-slate-900">{cheatSheet?.title} Cheat Sheet</h1>
            <hr className="border-slate-300 my-4" />
          </div>
          <MarkdownRenderer content={content} />
        </div>
      </div>
    </div>
  );
}

function CheatSheetViewerSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-pulse">
      <div className="h-10 border-b border-slate-800/40" />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="bg-slate-900/50 border border-slate-800/40 h-48 rounded-2xl" />
        <div className="lg:col-span-3 bg-slate-900/50 border border-slate-800/40 h-96 rounded-2xl" />
      </div>
    </div>
  );
}
