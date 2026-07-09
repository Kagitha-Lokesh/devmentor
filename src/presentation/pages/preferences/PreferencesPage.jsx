import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Calendar, Shield, Save, CheckCircle2, AlertCircle,
  Bell, BellOff, Code2, Type, Palette, Target, BookOpen, Star, 
  ArrowLeft, Camera, Flame, Zap
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useUserStore } from '../../store/useUserStore';
import { useThemeStore } from '../../store/useThemeStore';

// ── Mini reusable components ──────────────────────────────────────────────────

function SectionCard({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="bg-surface border border-surface-border rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-surface-border flex items-center gap-3">
        <div className="p-2 bg-brand-950 border border-brand-800/50 rounded-lg text-brand-400">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-text">{title}</h2>
          {subtitle && <p className="text-xs text-text/50 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, helper, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-text/70 uppercase tracking-wider">{label}</label>
      {children}
      {helper && <p className="text-xs text-text/40">{helper}</p>}
    </div>
  );
}

function ReadonlyField({ value, icon: Icon }) {
  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-surface-secondary border border-surface-border rounded-xl text-sm text-text/60">
      {Icon && <Icon className="h-4 w-4 text-text/30 shrink-0" />}
      <span className="truncate">{value || '—'}</span>
    </div>
  );
}

function TextInput({ value, onChange, placeholder, disabled }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-3.5 py-2.5 bg-surface-secondary border border-surface-border rounded-xl text-sm text-text placeholder:text-text/30 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    />
  );
}

function SelectInput({ value, onChange, options, disabled }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className="w-full px-3.5 py-2.5 bg-surface-secondary border border-surface-border rounded-xl text-sm text-text focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all appearance-none"
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/40 ${
        checked ? 'bg-brand-600' : 'bg-surface-tertiary border border-surface-border'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-[18px]' : 'translate-x-[2px]'
        }`}
      />
      <span className="sr-only">{label}</span>
    </button>
  );
}

function TagSelector({ selected, options, onChange }) {
  const toggle = (val) => {
    if (selected.includes(val)) {
      onChange(selected.filter(v => v !== val));
    } else {
      onChange([...selected, val]);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => toggle(opt.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            selected.includes(opt.value)
              ? 'bg-brand-600/20 border-brand-500 text-brand-300'
              : 'bg-surface-secondary border-surface-border text-text/50 hover:text-text hover:border-brand-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name, email) {
  const source = name || email || '?';
  return source.substring(0, 2).toUpperCase();
}

function formatDate(iso) {
  if (!iso) return 'Unknown';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

// ── Constants ─────────────────────────────────────────────────────────────────

const EXPERIENCE_OPTIONS = [
  { value: 'beginner',     label: 'Beginner — Just starting out' },
  { value: 'intermediate', label: 'Intermediate — Comfortable with basics' },
  { value: 'advanced',     label: 'Advanced — Production experience' },
];

const GOAL_OPTIONS = [
  { value: 'job-ready',    label: '🎯 Get a developer job' },
  { value: 'upskill',      label: '📈 Upskill / improve current role' },
  { value: 'academic',     label: '🎓 Academic / exam preparation' },
  { value: 'explore',      label: '🧪 Just exploring Java' },
];

const INTEREST_OPTIONS = [
  { value: 'dsa',          label: 'DSA & Problem Solving' },
  { value: 'spring',       label: 'Spring Boot' },
  { value: 'database',     label: 'Databases' },
  { value: 'system-design',label: 'System Design' },
  { value: 'microservices',label: 'Microservices' },
  { value: 'testing',      label: 'Testing' },
  { value: 'devops',       label: 'DevOps & CI/CD' },
  { value: 'frontend',     label: 'Frontend Integration' },
];

const FONT_SIZE_OPTIONS = [
  { value: '12', label: '12 px' },
  { value: '13', label: '13 px' },
  { value: '14', label: '14 px (default)' },
  { value: '16', label: '16 px' },
  { value: '18', label: '18 px' },
];

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PreferencesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { profile, updateUserPreferences, updateUserSettings, updateUserProfile } = useUserStore();
  const { theme, toggleTheme } = useThemeStore();

  // ── Profile form state
  const [displayName, setDisplayName] = useState('');

  // ── Preferences form state
  const [experience, setExperience]   = useState('beginner');
  const [goal, setGoal]               = useState('job-ready');
  const [interests, setInterests]     = useState([]);

  // ── Settings form state
  const [fontSize, setFontSize]           = useState('14');
  const [notifications, setNotifications] = useState(true);

  // ── UI state
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [saveError, setSaveError] = useState(null);

  // ── Hydrate form from store on mount
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setExperience(profile.preferences?.codingExperience || 'beginner');
      setGoal(profile.preferences?.goal || 'job-ready');
      setInterests(profile.preferences?.interests || []);
      setFontSize(String(profile.settings?.compilerFontSize || 14));
      setNotifications(profile.settings?.notificationsEnabled !== false);
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      // Persist profile
      await updateUserProfile({
        displayName,
      });

      // Persist preferences
      await updateUserPreferences({
        codingExperience: experience,
        goal,
        interests,
        updatedAt: new Date().toISOString(),
      });

      // Persist settings
      await updateUserSettings({
        compilerFontSize: Number(fontSize),
        notificationsEnabled: notifications,
        updatedAt: new Date().toISOString(),
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(err.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const profileInitials = getInitials(profile?.displayName, user?.email);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* ── Page Header ── */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-surface-secondary rounded-xl border border-transparent hover:border-surface-border transition-all text-text/50 hover:text-text"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-text tracking-tight">Preferences</h1>
          <p className="text-sm text-text/50 mt-0.5">Manage your profile, learning goals, and app settings</p>
        </div>
      </div>

      {/* ── Save feedback banner ── */}
      {saved && (
        <div className="flex items-center gap-2.5 bg-green-950/60 border border-green-700/50 text-green-300 text-sm font-medium px-4 py-2.5 rounded-xl animate-fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Changes saved successfully!
        </div>
      )}
      {saveError && (
        <div className="flex items-center gap-2.5 bg-red-950/60 border border-red-700/50 text-red-300 text-sm font-medium px-4 py-2.5 rounded-xl animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {saveError}
        </div>
      )}

      {/* ── Section 1: Account ── */}
      <SectionCard icon={User} title="Account" subtitle="Your account identity on DevMentor AI">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 flex items-center justify-center text-white text-xl font-extrabold select-none shadow-lg">
              {profile?.photoURL
                ? <img src={profile.photoURL} alt="avatar" className="h-16 w-16 rounded-2xl object-cover" />
                : profileInitials
              }
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 bg-surface border border-surface-border rounded-lg text-text/40">
              <Camera className="h-3 w-3" />
            </div>
          </div>
          <div>
            <p className="text-base font-bold text-text">{profile?.displayName || 'Learner'}</p>
            <p className="text-xs text-text/50">{user?.email}</p>
            <div className="flex items-center gap-3 mt-1.5">
              {profile?.progress?.xp !== undefined && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-full">
                  <Zap className="h-2.5 w-2.5" /> {profile.progress.xp} XP
                </span>
              )}
              {profile?.progress?.streak !== undefined && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-orange-400 bg-orange-950/40 border border-orange-800/40 px-2 py-0.5 rounded-full">
                  <Flame className="h-2.5 w-2.5" /> {profile.progress.streak} day streak
                </span>
              )}
            </div>
          </div>
        </div>

        <Field label="Full Name" helper="Enter your full name or display name.">
          <TextInput
            value={displayName}
            onChange={setDisplayName}
            placeholder="e.g. John Doe"
            disabled={saving}
          />
        </Field>

        <Field label="Email address" helper="Your sign-in email. Cannot be changed here.">
          <ReadonlyField value={user?.email} icon={Mail} />
        </Field>

        <Field label="Member since">
          <ReadonlyField value={formatDate(profile?.createdAt)} icon={Calendar} />
        </Field>

        <Field label="Account type">
          <ReadonlyField value="Free Learner" icon={Shield} />
        </Field>
      </SectionCard>

      {/* ── Section 2: Learning Preferences ── */}
      <SectionCard icon={BookOpen} title="Learning Preferences" subtitle="Help us personalize your roadmap">
        <Field label="Coding experience level">
          <SelectInput
            value={experience}
            onChange={setExperience}
            options={EXPERIENCE_OPTIONS}
            disabled={saving}
          />
        </Field>

        <Field label="Primary goal">
          <SelectInput
            value={goal}
            onChange={setGoal}
            options={GOAL_OPTIONS}
            disabled={saving}
          />
        </Field>

        <Field label="Topics of interest" helper="Select all that apply — used to personalise recommendations">
          <TagSelector
            selected={interests}
            options={INTEREST_OPTIONS}
            onChange={setInterests}
          />
        </Field>
      </SectionCard>

      {/* ── Section 3: App Settings ── */}
      <SectionCard icon={Palette} title="App Settings" subtitle="Appearance and editor preferences">
        <Field label="Color theme">
          <div className="flex gap-3">
            {['dark', 'light'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => { if (theme !== t) toggleTheme(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold capitalize transition-all ${
                  theme === t
                    ? 'bg-brand-600/20 border-brand-500 text-brand-300'
                    : 'bg-surface-secondary border-surface-border text-text/50 hover:border-brand-700 hover:text-text'
                }`}
              >
                <Palette className="h-3.5 w-3.5" />
                {t} mode
              </button>
            ))}
          </div>
        </Field>

        <Field label="Compiler / editor font size">
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4 text-text/30 shrink-0" />
            <SelectInput
              value={fontSize}
              onChange={setFontSize}
              options={FONT_SIZE_OPTIONS}
              disabled={saving}
            />
          </div>
        </Field>

        <Field label="Notifications">
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-surface-secondary border border-surface-border rounded-xl">
            <div className="flex items-center gap-2.5 text-sm text-text/70">
              {notifications
                ? <Bell className="h-4 w-4 text-brand-400" />
                : <BellOff className="h-4 w-4 text-text/30" />}
              <span>{notifications ? 'Notifications on' : 'Notifications off'}</span>
            </div>
            <Toggle
              checked={notifications}
              onChange={setNotifications}
              label="Toggle notifications"
            />
          </div>
        </Field>
      </SectionCard>

      {/* ── Save button ── */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-900 disabled:text-brand-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-900/30 hover:shadow-brand-700/30 hover:translate-y-[-1px] active:translate-y-[1px]"
      >
        {saving ? (
          <>
            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Save Preferences
          </>
        )}
      </button>
    </div>
  );
}
