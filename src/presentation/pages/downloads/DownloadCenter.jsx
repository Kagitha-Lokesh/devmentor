import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Download, Search, Filter, FileText, FileJson, FileCode,
  BookOpen, Briefcase, LayoutTemplate, CheckCircle2, Clock, ExternalLink
} from 'lucide-react';
import { useDownloadsStore } from '../../store/useDownloadsStore';
import { useAuthStore } from '../../store/useAuthStore';

const FORMAT_ICONS = { Markdown: FileText, JSON: FileJson, PDF: FileCode };
const FORMAT_COLORS = {
  Markdown: 'bg-blue-950 text-blue-400 border-blue-800',
  JSON: 'bg-amber-950 text-amber-400 border-amber-800',
  PDF: 'bg-red-950 text-red-400 border-red-800',
};
const CATEGORY_ICONS = {
  roadmap: BookOpen, template_resume: Briefcase, template_portfolio: LayoutTemplate,
};
const CATEGORY_LABELS = {
  roadmap: 'Career Roadmap', template_resume: 'Resume Template', template_portfolio: 'Portfolio Template',
};

const CATEGORIES = ['All', 'roadmap', 'template_resume', 'template_portfolio'];

function AssetCard({ asset, isDownloaded, onDownload, isDownloading }) {
  const FormatIcon = FORMAT_ICONS[asset.format] || FileText;
  const fmtColor = FORMAT_COLORS[asset.format] || 'bg-surface text-text/50 border-surface-border';
  const CatIcon = CATEGORY_ICONS[asset.category] || Download;
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
      className="group flex flex-col p-5 bg-surface-secondary border border-surface-border rounded-2xl hover:border-brand-800/60 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl border ${fmtColor}`}>
          <FormatIcon className="h-5 w-5" aria-hidden="true" />
        </div>
        {isDownloaded && (
          <span className="flex items-center gap-1 text-[10px] px-2 py-1 bg-green-950 text-green-400 border border-green-800 rounded-full">
            <CheckCircle2 className="h-3 w-3" /> Downloaded
          </span>
        )}
      </div>
      <h3 className="text-sm font-bold text-text mb-1">{asset.title}</h3>
      <p className="text-xs text-text/50 leading-relaxed flex-1 mb-4">{asset.description}</p>
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span className="text-[10px] px-2 py-0.5 bg-surface border border-surface-border rounded text-text/40 flex items-center gap-1">
          <CatIcon className="h-3 w-3" /> {CATEGORY_LABELS[asset.category] || asset.category}
        </span>
        {asset.format && (
          <span className={`text-[10px] px-2 py-0.5 rounded border ${fmtColor}`}>{asset.format}</span>
        )}
        {asset.size && (
          <span className="text-[10px] text-text/30">{asset.size}</span>
        )}
      </div>
      <button onClick={() => onDownload(asset)} disabled={isDownloading}
        className={`w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-xl border transition-all ${
          isDownloading
            ? 'bg-surface border-surface-border text-text/30 cursor-wait'
            : isDownloaded
              ? 'bg-surface-tertiary border-surface-border text-text/70 hover:bg-brand-950 hover:text-brand-400 hover:border-brand-800'
              : 'bg-brand-700 hover:bg-brand-600 border-brand-700 text-white shadow-sm shadow-brand-900/40'
        }`}>
        <Download className="h-4 w-4" />
        {isDownloading ? 'Downloading...' : isDownloaded ? 'Download Again' : 'Download'}
      </button>
    </motion.div>
  );
}

export default function DownloadCenter() {
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [downloadingId, setDownloadingId] = useState(null);
  const { user } = useAuthStore();
  const { assets, downloadedAssets, isLoading, loadAssets, downloadAsset } = useDownloadsStore();

  useEffect(() => {
    if (user?.uid) loadAssets(user.uid);
  }, [user?.uid]);

  const downloadedIds = new Set(downloadedAssets.map(a => a.id));
  const filtered = assets.filter(a => {
    const matchCat = catFilter === 'All' || a.category === catFilter;
    const matchQ = !query || a.title?.toLowerCase().includes(query.toLowerCase()) ||
      a.description?.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  const handleDownload = async (asset) => {
    if (!user?.uid) return;
    setDownloadingId(asset.id);
    try { await downloadAsset(user.uid, asset); } finally { setDownloadingId(null); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Download Center</h1>
        <p className="text-sm text-text/50 mt-0.5">Career roadmaps, resume templates, and portfolio starter kits.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total Assets', value: assets.length, icon: Download, color: 'bg-brand-950 text-brand-400' },
          { label: 'Downloaded', value: downloadedAssets.length, icon: CheckCircle2, color: 'bg-green-950 text-green-400' },
          { label: 'Available', value: assets.length - downloadedAssets.length, icon: Clock, color: 'bg-amber-950 text-amber-400' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3 p-4 bg-surface-secondary border border-surface-border rounded-xl">
            <div className={`p-2 rounded-lg ${s.color}`}><s.icon className="h-4 w-4" /></div>
            <div>
              <div className="text-xl font-bold text-text">{s.value}</div>
              <div className="text-xs text-text/40">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-48 flex items-center gap-2 px-3 py-2 bg-surface-secondary border border-surface-border rounded-xl focus-within:border-brand-700 transition-colors">
          <Search className="h-4 w-4 text-text/30 flex-shrink-0" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search assets..."
            className="flex-1 bg-transparent text-sm text-text placeholder-text/30 outline-none" />
        </div>
        <div className="flex gap-1.5">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                catFilter === c ? 'bg-brand-900 text-brand-300 border-brand-700' : 'text-text/50 border-surface-border hover:text-text'
              }`}>
              {c === 'All' ? 'All' : CATEGORY_LABELS[c] || c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-text/30 text-sm">Loading assets...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-text/30">
          <Download className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No assets match your search.</p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(asset => (
            <AssetCard key={asset.id} asset={asset}
              isDownloaded={downloadedIds.has(asset.id)}
              isDownloading={downloadingId === asset.id}
              onDownload={handleDownload} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
