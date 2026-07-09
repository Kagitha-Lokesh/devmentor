import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  StickyNote, Plus, Search, Trash2, Edit3, Tag, Hash, X,
  BookMarked, Highlighter, Check, ChevronDown
} from 'lucide-react';
import { useNotesStore } from '../../store/useNotesStore';
import { useAuthStore } from '../../store/useAuthStore';

const HIGHLIGHT_COLORS = {
  yellow: 'bg-yellow-400/20 border-yellow-400/40 text-yellow-300',
  green: 'bg-green-400/20 border-green-400/40 text-green-300',
  blue: 'bg-blue-400/20 border-blue-400/40 text-blue-300',
  red: 'bg-red-400/20 border-red-400/40 text-red-300',
  purple: 'bg-purple-400/20 border-purple-400/40 text-purple-300',
};

const COLOR_DOT = {
  yellow: 'bg-yellow-400', green: 'bg-green-400', blue: 'bg-blue-400',
  red: 'bg-red-400', purple: 'bg-purple-400',
};

function NoteEditor({ note, onSave, onClose }) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState(note?.tags?.join(', ') || '');
  const textareaRef = useRef(null);
  useEffect(() => { textareaRef.current?.focus(); }, []);
  const handleSave = () => {
    if (!title.trim() && !content.trim()) { onClose(); return; }
    onSave({
      title: title || 'Untitled Note',
      content,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    });
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
      onClick={handleSave}>
      <motion.div initial={{ scale: 0.97, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl bg-surface-secondary border border-surface-border rounded-2xl shadow-2xl flex flex-col" style={{ maxHeight: '85vh' }}>
        <div className="flex items-center gap-3 p-4 border-b border-surface-border">
          <StickyNote className="h-4 w-4 text-brand-400" />
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Note title..."
            className="flex-1 bg-transparent text-sm font-semibold text-text placeholder-text/30 outline-none" />
          <button onClick={handleSave} className="p-1.5 bg-brand-700 hover:bg-brand-600 text-white rounded-lg transition-colors">
            <Check className="h-4 w-4" />
          </button>
          <button onClick={onClose} className="p-1.5 text-text/40 hover:text-text transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <textarea ref={textareaRef} value={content} onChange={e => setContent(e.target.value)}
          placeholder="Start writing your note in markdown..."
          className="flex-1 p-4 bg-transparent text-sm text-text/80 placeholder-text/30 outline-none resize-none font-mono leading-relaxed"
          style={{ minHeight: '300px' }} />
        <div className="p-3 border-t border-surface-border flex items-center gap-2">
          <Tag className="h-3.5 w-3.5 text-text/30" />
          <input value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags (comma-separated)"
            className="flex-1 bg-transparent text-xs text-text/60 placeholder-text/30 outline-none" />
        </div>
      </motion.div>
    </motion.div>
  );
}

function NoteCard({ note, onEdit, onDelete }) {
  const isHighlight = note.isHighlight;
  const colorKey = note.color || 'yellow';
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
      className={`group relative p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isHighlight
          ? `${HIGHLIGHT_COLORS[colorKey]} border-current/20`
          : 'bg-surface-secondary border-surface-border hover:border-brand-800/60'
      }`}
      onClick={() => !isHighlight && onEdit(note)}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {isHighlight
            ? <Highlighter className="h-3.5 w-3.5 flex-shrink-0" />
            : <StickyNote className="h-3.5 w-3.5 text-brand-400 flex-shrink-0" />}
          <span className="text-sm font-semibold text-text truncate">{note.title}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {!isHighlight && (
            <button onClick={e => { e.stopPropagation(); onEdit(note); }}
              className="p-1 text-text/40 hover:text-text transition-colors"><Edit3 className="h-3.5 w-3.5" /></button>
          )}
          <button onClick={e => { e.stopPropagation(); onDelete(note.id); }}
            className="p-1 text-text/40 hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      </div>
      <p className="text-xs text-text/60 line-clamp-3 leading-relaxed">{note.content || note.highlightedText}</p>
      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {note.tags.map((t, i) => (
            <span key={i} className="text-[10px] px-1.5 py-0.5 bg-surface rounded border border-surface-border text-text/40 flex items-center gap-0.5">
              <Hash className="h-2.5 w-2.5" />{t}
            </span>
          ))}
        </div>
      )}
      <div className="mt-2 text-[10px] text-text/30">
        {note.updatedAt ? new Date(note.updatedAt).toLocaleDateString() : new Date().toLocaleDateString()}
      </div>
    </motion.div>
  );
}

export default function NotesPage() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'highlights'
  const [editingNote, setEditingNote] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuthStore();
  const { notes, isLoading, loadNotes, createNote, updateNote, deleteNote } = useNotesStore();

  useEffect(() => {
    if (user?.uid) loadNotes(user.uid);
  }, [user?.uid]);

  const allNotes = notes.filter(n => !n.isHighlight);
  const allHighlights = notes.filter(n => n.isHighlight);
  const items = activeTab === 'notes' ? allNotes : allHighlights;
  const filtered = query
    ? items.filter(n =>
        n.title?.toLowerCase().includes(query.toLowerCase()) ||
        n.content?.toLowerCase().includes(query.toLowerCase()) ||
        n.tags?.some(t => t.toLowerCase().includes(query.toLowerCase()))
      )
    : items;

  const handleSaveNote = async (data) => {
    if (!user?.uid) return;
    if (editingNote?.id) {
      await updateNote(user.uid, editingNote.id, data);
    } else {
      await createNote(user.uid, data);
    }
    setEditingNote(null);
    setIsCreating(false);
  };

  const handleDelete = async (noteId) => {
    if (!user?.uid) return;
    await deleteNote(user.uid, noteId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Notes & Highlights</h1>
          <p className="text-sm text-text/50 mt-0.5">Personal markdown notes and text highlights from your lessons.</p>
        </div>
        <button onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-brand-900/30">
          <Plus className="h-4 w-4" /> New Note
        </button>
      </div>

      {/* Tabs + Search */}
      <div className="flex items-center gap-4">
        <div className="flex items-center bg-surface-secondary border border-surface-border rounded-xl p-1 gap-1">
          <button onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'notes' ? 'bg-brand-700 text-white' : 'text-text/50 hover:text-text'
            }`}>
            <StickyNote className="h-3.5 w-3.5" /> Notes ({allNotes.length})
          </button>
          <button onClick={() => setActiveTab('highlights')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'highlights' ? 'bg-brand-700 text-white' : 'text-text/50 hover:text-text'
            }`}>
            <Highlighter className="h-3.5 w-3.5" /> Highlights ({allHighlights.length})
          </button>
        </div>
        <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-surface-secondary border border-surface-border rounded-xl focus-within:border-brand-700 transition-colors">
          <Search className="h-4 w-4 text-text/30" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search notes..."
            className="flex-1 bg-transparent text-sm text-text placeholder-text/30 outline-none" />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-text/30 text-sm">Loading notes...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-text/30">
          <StickyNote className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">{query ? 'No notes match your search.' : `No ${activeTab} yet.`}</p>
          {!query && activeTab === 'notes' && (
            <button onClick={() => setIsCreating(true)} className="mt-3 text-sm text-brand-400 hover:underline">
              Create your first note
            </button>
          )}
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(note => (
            <NoteCard key={note.id} note={note} onEdit={n => { setEditingNote(n); setIsCreating(true); }} onDelete={handleDelete} />
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {isCreating && (
          <NoteEditor
            note={editingNote}
            onSave={handleSaveNote}
            onClose={() => { setIsCreating(false); setEditingNote(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
