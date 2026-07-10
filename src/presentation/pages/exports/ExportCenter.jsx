import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Upload, Clock, FileJson, FileText, Table2, CheckCircle2,
  BarChart3, BookOpen, Terminal, FolderGit2, MessageSquare, ChevronDown
} from 'lucide-react';
import { useExportsStore } from '../../store/useExportsStore';
import { useAuthStore } from '../../store/useAuthStore';

const FORMAT_OPTIONS = [
  { id: 'JSON', label: 'JSON', icon: FileJson, desc: 'Machine-readable structured data' },
  { id: 'CSV', label: 'CSV', icon: Table2, desc: 'Spreadsheet-compatible format' },
  { id: 'Markdown', label: 'Markdown', icon: FileText, desc: 'Human-readable formatted report' },
];

const EXPORT_TYPES = [
  { id: 'curriculum_progress', label: 'Curriculum Progress', icon: BookOpen },
  { id: 'problem_history', label: 'Problem History', icon: Terminal },
  { id: 'project_progress', label: 'Project Progress', icon: FolderGit2 },
  { id: 'interview_history', label: 'Interview History', icon: MessageSquare },
];

function ExportJobRow({ job }) {
  const ts = job.timestamp ? new Date(job.timestamp) : new Date();
  const FormatIcon = { JSON: FileJson, CSV: Table2, Markdown: FileText }[job.format] || FileText;
  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-surface-secondary border border-surface-border rounded-xl">
      <div className="p-2 bg-surface border border-surface-border rounded-lg">
        <FormatIcon className="h-4 w-4 text-text/50" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text truncate">{job.label || job.exportType || 'Export'}</p>
        <p className="text-xs text-text/40">{job.format} · {ts.toLocaleString()}</p>
      </div>
      <span className="flex items-center gap-1 text-[10px] px-2 py-1 bg-green-950 text-green-400 border border-green-800 rounded-full">
        <CheckCircle2 className="h-3 w-3" /> Done
      </span>
    </div>
  );
}

export default function ExportCenter() {
  const [selectedType, setSelectedType] = useState('curriculum_progress');
  const [selectedFormat, setSelectedFormat] = useState('JSON');
  const [isExporting, setIsExporting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { user } = useAuthStore();
  const { exportJobs, loadHistory, exportData } = useExportsStore();

  useEffect(() => {
    if (user?.uid) loadHistory(user.uid);
  }, [user?.uid]);

  const handleExport = async () => {
    if (!user?.uid) return;
    setIsExporting(true);
    setSuccess(false);
    try {
      // Build sample progress data based on type
      const progressData = {
        userId: user.uid,
        exportType: selectedType,
        exportedAt: new Date().toISOString(),
        data: { message: `${selectedType} data exported successfully` }
      };
      await exportData(user.uid, {
        format: selectedFormat,
        progressData,
        label: EXPORT_TYPES.find(t => t.id === selectedType)?.label || selectedType,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const selectedTypeConfig = EXPORT_TYPES.find(t => t.id === selectedType);
  const selectedFormatConfig = FORMAT_OPTIONS.find(f => f.id === selectedFormat);
  const TypeIcon = selectedTypeConfig?.icon || Upload;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Export Center</h1>
        <p className="text-sm text-text/50 mt-0.5">Export your learning progress, problem history, and performance data.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Builder */}
        <div className="lg:col-span-2 space-y-5">
          <div className="p-6 bg-surface-secondary border border-surface-border rounded-2xl space-y-5">
            <h2 className="text-sm font-semibold text-text">Configure Export</h2>

            {/* Data Source */}
            <div>
              <label className="text-xs font-medium text-text/50 block mb-2">Data Source</label>
              <div className="grid grid-cols-2 gap-2">
                {EXPORT_TYPES.map(t => {
                  const Icon = t.icon;
                  return (
                    <button key={t.id} onClick={() => setSelectedType(t.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${
                        selectedType === t.id
                          ? 'bg-brand-950 border-brand-700 text-brand-300'
                          : 'bg-surface border-surface-border text-text/60 hover:text-text hover:border-surface-border/80'
                      }`}>
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs font-medium">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Format */}
            <div>
              <label className="text-xs font-medium text-text/50 block mb-2">Export Format</label>
              <div className="grid grid-cols-3 gap-2">
                {FORMAT_OPTIONS.map(f => {
                  const Icon = f.icon;
                  return (
                    <button key={f.id} onClick={() => setSelectedFormat(f.id)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                        selectedFormat === f.id
                          ? 'bg-brand-950 border-brand-700 text-brand-300'
                          : 'bg-surface border-surface-border text-text/60 hover:text-text'
                      }`}>
                      <Icon className="h-5 w-5" />
                      <span className="text-xs font-bold">{f.label}</span>
                      <span className="text-[10px] text-text/40 leading-tight hidden sm:block">{f.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-surface rounded-xl border border-surface-border/50 flex items-center gap-3">
              <div className="p-2.5 bg-brand-950 border border-brand-800 rounded-lg">
                <TypeIcon className="h-5 w-5 text-brand-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-text">
                  {selectedTypeConfig?.label} → {selectedFormat}
                </p>
                <p className="text-xs text-text/40 mt-0.5">{selectedFormatConfig?.desc}</p>
              </div>
            </div>

            {/* Export Button */}
            <button onClick={handleExport} disabled={isExporting}
              className={`w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${
                success
                  ? 'bg-green-700 text-primary'
                  : isExporting
                    ? 'bg-brand-900 text-brand-300 cursor-wait opacity-70'
                    : 'bg-brand-600 hover:bg-brand-500 text-primary shadow-lg shadow-brand-900/30'
              }`}>
              {success ? <><CheckCircle2 className="h-4 w-4" /> Exported!</> :
               isExporting ? <><Clock className="h-4 w-4 animate-spin" /> Exporting...</> :
               <><Upload className="h-4 w-4" /> Export Now</>}
            </button>
          </div>
        </div>

        {/* Export History */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-text/40" />
            <h2 className="text-sm font-semibold text-text">Export History</h2>
          </div>
          {exportJobs.length === 0 ? (
            <div className="py-12 text-center text-text/30">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-xs">No exports yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {exportJobs.slice(0, 10).map(job => <ExportJobRow key={job.id} job={job} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
