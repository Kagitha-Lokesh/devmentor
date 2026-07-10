import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Settings, Pin, Trash2, Send, BrainCircuit,
  AlertCircle, ShieldCheck, Sparkles, BookOpen, Layers,
  Terminal, RefreshCw, ChevronRight, Check, Copy, HelpCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { container } from '../../../infrastructure/di/container';
import { useAuthStore } from '../../store/useAuthStore';

const CATEGORY_ICONS = {
  Lesson: BookOpen,
  Compiler: Terminal,
  Interview: ShieldCheck,
  Revision: RefreshCw,
  Career: Sparkles,
  General: MessageSquare
};

export default function AssistantPage() {
  const { user } = useAuthStore();
  const uid = user?.uid || 'anonymous';
  const location = useLocation();
  const navigate = useNavigate();
  const assistantUseCase = container.resolve('AssistantUseCase');

  // Conversational states
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [activeConv, setActiveConv] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState(null);

  // Prefs & Health states
  const [prefs, setPrefs] = useState(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState('Available'); // Available | Loading | Offline
  const [activeName, setActiveName] = useState('Rule-Based Assistant');
  const [showFallbackBanner, setShowFallbackBanner] = useState(false);

  // Settings form binding
  const [providerForm, setProviderForm] = useState('rule-based');
  const [endpointForm, setEndpointForm] = useState('http://localhost:11434');
  const [modelForm, setModelForm] = useState('llama3');
  const [limitForm, setLimitForm] = useState(4096);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadPreferences();
    loadConversations().then(() => {
      // Check if we arrived via dashboard query action routing
      if (location.state?.query) {
        const q = location.state.query;
        // Clear history state to prevent loop runs
        navigate(location.pathname, { replace: true, state: {} });
        handleSendMessage(q);
      }
    });
  }, [uid]);

  useEffect(() => {
    if (activeConvId) {
      loadActiveConversation(activeConvId);
    } else {
      setActiveConv(null);
    }
  }, [activeConvId]);

  useEffect(() => {
    scrollToBottom();
  }, [activeConv?.messages, isSending]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadPreferences = async () => {
    try {
      const p = await assistantUseCase.getPreferences(uid);
      setPrefs(p);
      setProviderForm(p.activeProvider);
      setEndpointForm(p.endpointUrl);
      setModelForm(p.modelName);
      setLimitForm(p.contextLimit);

      // Check Health
      checkActiveHealth(p);
    } catch (err) {
      console.warn('[AssistantPage] loadPreferences err:', err);
    }
  };

  const checkActiveHealth = async (currentPrefs) => {
    setHealthStatus('Loading');
    if (currentPrefs.activeProvider === 'ollama') {
      const ollama = container.resolve('OllamaAssistantProvider');
      const healthy = await ollama.checkHealth({ endpointUrl: currentPrefs.endpointUrl });
      if (healthy) {
        setHealthStatus('Available');
        setActiveName('Ollama (Local LLM)');
        setShowFallbackBanner(false);
      } else {
        setHealthStatus('Offline');
        setActiveName('Rule-Based Assistant (Fallback)');
        setShowFallbackBanner(true);
      }
    } else {
      setHealthStatus('Available');
      setActiveName('Deterministic Rule-Based Engine');
      setShowFallbackBanner(false);
    }
  };

  const loadConversations = async () => {
    try {
      const list = await assistantUseCase.listConversations(uid);
      setConversations(list);
      if (list.length > 0 && !activeConvId) {
        setActiveConvId(list[0].id);
      }
    } catch {}
  };

  const loadActiveConversation = async (id) => {
    try {
      const conv = await assistantUseCase.getConversation(uid, id);
      setActiveConv(conv);
    } catch {}
  };

  const handleStartNewChat = () => {
    const newId = `conv_${Date.now()}`;
    setActiveConvId(newId);
    setActiveConv({
      id: newId,
      title: 'New Chat',
      type: 'General',
      messages: []
    });
  };

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || isSending) return;

    if (!customText) setInputText('');
    setIsSending(true);

    const convId = activeConv?.id || `conv_${Date.now()}`;

    try {
      // Gather active topic/problem context from current course/practice workspace if open
      const activeContext = {
        type: activeConv?.type || 'General'
      };

      const updated = await assistantUseCase.sendMessage(uid, convId, textToSend, activeContext);
      setActiveConv(updated);
      setActiveConvId(updated.id);
      loadConversations();
    } catch (err) {
      console.error('[AssistantPage] sendMessage err:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!prefs) return;

    const updated = {
      ...prefs,
      activeProvider: providerForm,
      endpointUrl: endpointForm,
      modelName: modelForm,
      contextLimit: Number(limitForm)
    };

    try {
      await assistantUseCase.savePreferences(uid, updated);
      setPrefs(updated);
      setIsConfigOpen(false);
      checkActiveHealth(updated);
    } catch {}
  };

  const handleDeleteChat = async (id) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;
    try {
      await assistantUseCase.deleteConversation(uid, id);
      loadConversations();
      if (activeConvId === id) {
        setActiveConvId(null);
      }
    } catch {}
  };

  const handleTogglePin = async (id) => {
    try {
      await assistantUseCase.togglePin(uid, id);
      loadConversations();
    } catch {}
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-slate-950 border border-surface-border rounded-2xl overflow-hidden shadow-2xl">
      {/* ── Sidebar ── */}
      <div className="w-80 bg-surface-secondary border-r border-surface-border flex flex-col shrink-0">
        <div className="p-4 border-b border-surface-border flex items-center justify-between">
          <h2 className="text-sm font-bold text-text flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-violet-400" />
            Chats History
          </h2>
          <button
            onClick={handleStartNewChat}
            className="text-[11px] px-2.5 py-1.5 bg-violet-900/40 hover:bg-violet-800 text-violet-300 border border-violet-800 rounded-lg font-bold cursor-pointer transition-all"
          >
            New Chat
          </button>
        </div>

        {/* Suggested Queries Action Chips */}
        <div className="p-3 border-b border-surface-border bg-slate-900/30">
          <span className="text-[9px] uppercase font-bold text-text/40 tracking-wider mb-2 block">Quick Actions</span>
          <div className="flex flex-col gap-1.5">
            {[
              { label: 'Suggest Next Lesson', text: 'Recommend next lesson' },
              { label: 'Give Coding Hint', text: 'Give me a hint' },
              { label: 'Explain Compiler Error', text: 'Explain error' },
            ].map(act => (
              <button
                key={act.label}
                onClick={() => handleSendMessage(act.text)}
                className="text-left text-[11px] text-text/60 hover:text-text hover:bg-surface border border-surface-border rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
              >
                {act.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <p className="text-xs text-text/30 italic text-center py-8">No chats started yet.</p>
          ) : (
            conversations.map(c => {
              const Icon = CATEGORY_ICONS[c.type] || MessageSquare;
              return (
                <div
                  key={c.id}
                  className={`group flex items-center gap-2.5 p-2.5 rounded-xl transition-all cursor-pointer border
                    ${activeConvId === c.id
                      ? 'bg-violet-950/40 border-violet-850 text-text'
                      : 'border-transparent text-text/60 hover:bg-surface hover:text-text'}`}
                  onClick={() => setActiveConvId(c.id)}
                  role="button"
                  aria-label={`Open conversation: ${c.title}`}
                >
                  <Icon className="h-4 w-4 shrink-0 text-violet-400" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold truncate block">{c.title}</span>
                    <span className="text-[10px] text-text/30 block">
                      {new Date(c.lastActiveAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleTogglePin(c.id); }}
                      className={`p-1 hover:bg-surface-secondary rounded ${c.pinned ? 'text-amber-400' : 'text-text/30'}`}
                    >
                      <Pin className="h-3 w-3 fill-current" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteChat(c.id); }}
                      className="p-1 hover:bg-red-950 text-text/30 hover:text-red-400 rounded"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Health status widget */}
        <div className="p-4 border-t border-surface-border bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <div className={`h-2.5 w-2.5 rounded-full ${healthStatus === 'Available' ? 'bg-emerald-500 animate-pulse' : healthStatus === 'Loading' ? 'bg-amber-500 animate-spin' : 'bg-red-500'}`} />
            <div>
              <span className="font-bold block text-text/80">{activeName}</span>
              <span className="text-[10px] text-text/40">{healthStatus} mode</span>
            </div>
          </div>
          <button
            onClick={() => setIsConfigOpen(true)}
            className="p-2 bg-surface hover:bg-violet-950 rounded-lg border border-surface-border text-text/60 hover:text-violet-400 transition-all cursor-pointer"
            aria-label="Assistant settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      <div className="flex-1 flex flex-col bg-surface/30">
        {/* Banner Alert if Fallback to Rule Engine is Active */}
        {showFallbackBanner && (
          <div className="bg-amber-950/70 border-b border-amber-900/60 px-4 py-2 flex items-center gap-2.5 text-xs text-amber-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Ollama model is offline or unreachable. Switched to offline deterministic assistant.</span>
          </div>
        )}

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!activeConv || activeConv.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-sm mx-auto text-center space-y-4">
              <div className="p-4 bg-violet-950/40 border border-violet-850 rounded-2xl">
                <BrainCircuit className="h-8 w-8 text-violet-300" />
              </div>
              <h3 className="font-bold text-text">Intelligent Learning Assistant</h3>
              <p className="text-xs text-text/40 leading-relaxed">
                Ask coding questions, conceptual roadmaps, or request hints. I can run fully offline using local curriculum files.
              </p>
            </div>
          ) : (
            activeConv.messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-4 items-start max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div className={`p-2 rounded-xl shrink-0 border ${msg.sender === 'user' ? 'bg-brand-950 border-brand-900 text-brand-300' : 'bg-violet-950 border-violet-900 text-violet-300'}`}>
                  <span className="text-[10px] font-extrabold uppercase">{msg.sender.slice(0, 3)}</span>
                </div>

                {/* Message Body */}
                <div className="space-y-1.5">
                  <div className={`p-4 rounded-2xl border text-sm leading-relaxed whitespace-pre-wrap font-medium
                    ${msg.sender === 'user'
                      ? 'bg-brand-900/35 border-brand-850 text-text/90'
                      : 'bg-surface border-surface-border text-text/80 shadow-lg shadow-black/10'}`}
                  >
                    {msg.text}
                  </div>
                  {/* Clipboard/Copy */}
                  <div className={`flex gap-2 items-center ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <button
                      onClick={() => copyToClipboard(msg.text, msg.id)}
                      className="text-[10px] text-text/30 hover:text-text/60 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedMsgId === msg.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Response</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-surface-border bg-slate-950">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="flex gap-3 max-w-4xl mx-auto"
          >
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Ask anything or request help..."
              className="flex-1 bg-surface border border-surface-border rounded-xl px-4 py-3 text-sm text-text placeholder-text/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
              disabled={isSending}
              aria-label="Ask assistant query input"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="px-5 py-3 btn-primary text-sm font-bold flex items-center gap-2 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send
            </button>
          </form>
        </div>
      </div>

      {/* ── Settings / Preferences Drawer ── */}
      {isConfigOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-secondary border border-surface-border rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl relative">
            <h3 className="text-lg font-bold text-text flex items-center gap-2">
              <Settings className="h-5 w-5 text-violet-400" />
              Assistant Configuration
            </h3>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              {/* Active Provider */}
              <div>
                <label className="text-xs font-bold text-text/50 uppercase tracking-wider block mb-2">Active Provider</label>
                <div className="grid grid-cols-2 gap-3">
                  {['rule-based', 'ollama'].map(prov => (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => setProviderForm(prov)}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer capitalize
                        ${providerForm === prov
                          ? 'bg-violet-900/50 border-violet-600 text-white shadow-lg'
                          : 'bg-surface border-surface-border text-text/40 hover:border-violet-850'}`}
                    >
                      {prov === 'rule-based' ? 'Rule-Based' : 'Ollama (Local)'}
                    </button>
                  ))}
                </div>
              </div>

              {providerForm === 'ollama' && (
                <div className="space-y-3 pt-2 border-t border-surface-border">
                  {/* Endpoint URL */}
                  <div>
                    <label className="text-xs font-bold text-text/50 uppercase tracking-wider block mb-1">Ollama Host Endpoint</label>
                    <input
                      type="text"
                      value={endpointForm}
                      onChange={e => setEndpointForm(e.target.value)}
                      className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:ring-1 focus:ring-violet-500"
                      placeholder="http://localhost:11434"
                      required
                    />
                  </div>

                  {/* Model Name */}
                  <div>
                    <label className="text-xs font-bold text-text/50 uppercase tracking-wider block mb-1">Model Name</label>
                    <input
                      type="text"
                      value={modelForm}
                      onChange={e => setModelForm(e.target.value)}
                      className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:ring-1 focus:ring-violet-500"
                      placeholder="llama3, qwen2:1.5b, etc."
                      required
                    />
                  </div>

                  {/* Context Limit */}
                  <div>
                    <label className="text-xs font-bold text-text/50 uppercase tracking-wider block mb-1">Context Window Limit</label>
                    <input
                      type="number"
                      value={limitForm}
                      onChange={e => setLimitForm(e.target.value)}
                      className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:ring-1 focus:ring-violet-500"
                      placeholder="4096"
                      min={1024}
                      max={16384}
                    />
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-3 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(false)}
                  className="flex-1 py-2.5 bg-surface border border-surface-border hover:border-text/40 text-text/60 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 btn-primary text-xs font-bold rounded-xl cursor-pointer"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
