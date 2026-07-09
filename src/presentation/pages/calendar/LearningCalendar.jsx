import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Check,
  Trash2, Clock, BookOpen, Terminal, MessageSquare, FolderGit2, X
} from 'lucide-react';
import { useCalendarStore } from '../../store/useCalendarStore';
import { useAuthStore } from '../../store/useAuthStore';

const TYPE_ICONS = {
  lesson: BookOpen, problem: Terminal, interview: MessageSquare,
  project: FolderGit2, revision: Clock, career: CalendarIcon,
};
const TYPE_COLORS = {
  lesson: 'text-brand-400 bg-brand-950 border-brand-800',
  problem: 'text-amber-400 bg-amber-950 border-amber-800',
  interview: 'text-red-400 bg-red-950 border-red-800',
  project: 'text-purple-400 bg-purple-950 border-purple-800',
  revision: 'text-green-400 bg-green-950 border-green-800',
  career: 'text-orange-400 bg-orange-950 border-orange-800',
};
const STATUS_STYLES = {
  upcoming: 'text-text/70 border-surface-border',
  completed: 'text-green-400 border-green-800/60 line-through opacity-70',
  overdue: 'text-red-400 border-red-900/60',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}
function toDateStr(date) {
  return date.toISOString().split('T')[0];
}

function AddTaskModal({ onAdd, onClose }) {
  const [form, setForm] = useState({ title: '', type: 'lesson', date: toDateStr(new Date()), scheduledTime: '09:00' });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onAdd(form);
    onClose();
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-surface-secondary border border-surface-border rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-text text-lg">Add Calendar Task</h2>
          <button onClick={onClose} className="p-1 text-text/40 hover:text-text transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-text/50 font-medium block mb-1.5">Task Title</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Study Java Threads..." required
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg text-sm text-text placeholder-text/30 outline-none focus:border-brand-600" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text/50 font-medium block mb-1.5">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg text-sm text-text outline-none focus:border-brand-600">
                {Object.keys(TYPE_ICONS).map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-text/50 font-medium block mb-1.5">Time</label>
              <input type="time" value={form.scheduledTime} onChange={e => setForm(f => ({ ...f, scheduledTime: e.target.value }))}
                className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg text-sm text-text outline-none focus:border-brand-600" />
            </div>
          </div>
          <div>
            <label className="text-xs text-text/50 font-medium block mb-1.5">Date</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg text-sm text-text outline-none focus:border-brand-600" />
          </div>
          <button type="submit"
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-lg transition-colors">
            Add Task
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function LearningCalendar() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [viewMode, setViewMode] = useState('week');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(toDateStr(today));
  const { user } = useAuthStore();
  const { tasks, isLoading, loadTasks, addTask, completeTask, deleteTask } = useCalendarStore();

  useEffect(() => {
    if (user?.uid) loadTasks(user.uid);
  }, [user?.uid]);

  const getTasksForDate = (dateStr) => tasks.filter(t => t.toJSON ? t.toJSON().date === dateStr : t.date === dateStr);

  // Build weekly dates
  const getWeekDates = () => {
    const start = new Date(currentDate);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  // Build monthly grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthCells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const navigate = (dir) => {
    setCurrentDate(d => {
      const nd = new Date(d);
      if (viewMode === 'month') { nd.setMonth(nd.getMonth() + dir); }
      else if (viewMode === 'week') { nd.setDate(nd.getDate() + dir * 7); }
      else { nd.setDate(nd.getDate() + dir); }
      return nd;
    });
  };

  const handleAddTask = async (data) => {
    if (!user?.uid) return;
    await addTask(user.uid, data);
  };

  const handleComplete = async (taskId) => {
    if (!user?.uid) return;
    await completeTask(user.uid, taskId);
  };

  const handleDelete = async (taskId) => {
    if (!user?.uid) return;
    await deleteTask(user.uid, taskId);
  };

  const weekDates = getWeekDates();
  const todayStr = toDateStr(today);

  const TaskPill = ({ task }) => {
    const rawDate = task.toJSON ? task.toJSON().date : task.date;
    const typeKey = task.type || 'lesson';
    const Icon = TYPE_ICONS[typeKey] || CalendarIcon;
    const color = TYPE_COLORS[typeKey] || TYPE_COLORS.lesson;
    const statusStyle = STATUS_STYLES[task.status] || STATUS_STYLES.upcoming;
    return (
      <div className={`flex items-center gap-2 p-2 rounded-lg border text-xs ${statusStyle} group`}>
        <span className={`p-1 rounded border ${color}`}><Icon className="h-3 w-3" /></span>
        <span className="flex-1 truncate">{task.title}</span>
        <span className="text-text/30 hidden group-hover:block">{task.scheduledTime}</span>
        {task.status !== 'completed' && (
          <button onClick={() => handleComplete(task.id)} title="Mark complete"
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-green-400 hover:bg-green-950 transition-all">
            <Check className="h-3 w-3" />
          </button>
        )}
        <button onClick={() => handleDelete(task.id)} title="Delete task"
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-red-400 hover:bg-red-950 transition-all">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Learning Calendar</h1>
          <p className="text-sm text-text/50 mt-0.5">Plan and track your study schedule.</p>
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-brand-900/30">
          <Plus className="h-4 w-4" /> Add Task
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} aria-label="Previous"
            className="p-2 rounded-lg hover:bg-surface-tertiary text-text/60 hover:text-text transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-text min-w-36 text-center">
            {viewMode === 'month' ? `${MONTHS[month]} ${year}` :
             viewMode === 'week' ? `${MONTHS[weekDates[0].getMonth()]} ${weekDates[0].getDate()} – ${weekDates[6].getDate()}` :
             `${MONTHS[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`}
          </span>
          <button onClick={() => navigate(1)} aria-label="Next"
            className="p-2 rounded-lg hover:bg-surface-tertiary text-text/60 hover:text-text transition-colors">
            <ChevronRight className="h-5 w-5" />
          </button>
          <button onClick={() => setCurrentDate(today)}
            className="ml-2 text-xs px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-text/60 hover:text-text transition-colors">
            Today
          </button>
        </div>
        <div className="flex items-center bg-surface-secondary border border-surface-border rounded-xl p-1 gap-1">
          {['day', 'week', 'month'].map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all capitalize ${
                viewMode === mode ? 'bg-brand-700 text-white shadow' : 'text-text/50 hover:text-text'
              }`}>
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-text/30 text-sm">Loading calendar...</div>
      ) : viewMode === 'month' ? (
        <div className="bg-surface-secondary border border-surface-border rounded-2xl overflow-hidden">
          <div className="grid grid-cols-7 border-b border-surface-border">
            {DAYS.map(d => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-text/40 uppercase tracking-wider">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthCells.map((day, i) => {
              const dateStr = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
              const dayTasks = dateStr ? getTasksForDate(dateStr) : [];
              const isToday = dateStr === todayStr;
              return (
                <div key={i} onClick={() => dateStr && setSelectedDate(dateStr)}
                  className={`min-h-24 p-2 border-b border-r border-surface-border/50 cursor-pointer transition-colors ${
                    day ? 'hover:bg-surface-tertiary/30' : 'bg-surface/30'
                  } ${dateStr === selectedDate ? 'bg-brand-950/30' : ''}`}>
                  {day && (
                    <>
                      <div className={`text-xs font-bold mb-1.5 w-7 h-7 flex items-center justify-center rounded-full ${
                        isToday ? 'bg-brand-600 text-white' : 'text-text/70'
                      }`}>{day}</div>
                      <div className="space-y-0.5">
                        {dayTasks.slice(0, 2).map(t => (
                          <div key={t.id} className={`text-[10px] px-1.5 py-0.5 rounded truncate ${TYPE_COLORS[t.type] || 'bg-surface text-text/50'}`}>
                            {t.title}
                          </div>
                        ))}
                        {dayTasks.length > 2 && (
                          <div className="text-[10px] text-text/40">+{dayTasks.length - 2} more</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : viewMode === 'week' ? (
        <div className="bg-surface-secondary border border-surface-border rounded-2xl overflow-hidden">
          <div className="grid grid-cols-7 border-b border-surface-border">
            {weekDates.map((d, i) => {
              const dateStr = toDateStr(d);
              const isToday = dateStr === todayStr;
              return (
                <div key={i} onClick={() => setSelectedDate(dateStr)}
                  className={`p-3 text-center cursor-pointer transition-colors hover:bg-surface-tertiary/40 ${dateStr === selectedDate ? 'bg-brand-950/40' : ''}`}>
                  <div className="text-xs text-text/40 mb-1">{DAYS[d.getDay()]}</div>
                  <div className={`text-sm font-bold w-8 h-8 mx-auto flex items-center justify-center rounded-full ${isToday ? 'bg-brand-600 text-white' : 'text-text'}`}>
                    {d.getDate()}
                  </div>
                  <div className="mt-1 text-[10px] text-text/30">
                    {getTasksForDate(dateStr).length > 0 && `${getTasksForDate(dateStr).length} task${getTasksForDate(dateStr).length > 1 ? 's' : ''}`}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-7 min-h-48 divide-x divide-surface-border/50">
            {weekDates.map((d, i) => {
              const dateStr = toDateStr(d);
              return (
                <div key={i} className="p-2 space-y-1">
                  {getTasksForDate(dateStr).map(t => <TaskPill key={t.id} task={t} />)}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Day View */
        <div className="bg-surface-secondary border border-surface-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`text-2xl font-bold ${toDateStr(currentDate) === todayStr ? 'text-brand-400' : 'text-text'}`}>
              {currentDate.getDate()}
            </div>
            <div>
              <div className="text-sm font-semibold text-text">{DAYS[currentDate.getDay()]}</div>
              <div className="text-xs text-text/40">{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</div>
            </div>
          </div>
          <div className="space-y-2">
            {getTasksForDate(toDateStr(currentDate)).length === 0 ? (
              <p className="text-sm text-text/30 py-8 text-center">No tasks scheduled for this day.</p>
            ) : (
              getTasksForDate(toDateStr(currentDate)).map(t => <TaskPill key={t.id} task={t} />)
            )}
          </div>
        </div>
      )}

      {/* Selected Date Tasks Panel (month/week view) */}
      {(viewMode === 'month' || viewMode === 'week') && selectedDate && (
        <div className="bg-surface-secondary border border-surface-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-text mb-3">
            Tasks for {selectedDate === todayStr ? 'Today' : selectedDate}
          </h2>
          <div className="space-y-1.5">
            {getTasksForDate(selectedDate).length === 0 ? (
              <p className="text-xs text-text/30 py-4 text-center">No tasks. <button onClick={() => setShowAddModal(true)} className="text-brand-400 hover:underline">Add one?</button></p>
            ) : (
              getTasksForDate(selectedDate).map(t => <TaskPill key={t.id} task={t} />)
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showAddModal && <AddTaskModal onAdd={handleAddTask} onClose={() => setShowAddModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
