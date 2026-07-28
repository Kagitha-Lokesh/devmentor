import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, 
  CheckCircle, 
  RefreshCw, 
  Minimize, 
  Maximize, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  WifiOff,
  Plus,
  Minus
} from 'lucide-react';

import { container } from '../../../infrastructure/di/container';
import { MonacoWrapper } from '../../components/common/MonacoWrapper';
import { MarkdownRenderer } from '../../components/common/MarkdownRenderer';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { localDB } from '../../../shared/utils/indexedDB';
import { Verdict } from '../../../domain/models/Verdict';
import { Submission } from '../../../domain/models/Submission';

export default function Compiler() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();

  // DI Resolvers
  const problemRepo = container.resolve('IProblemRepository');
  const submissionRepo = container.resolve('ISubmissionRepository');
  const executionProvider = container.resolve('IExecutionProvider');
  const evaluationService = container.resolve('IEvaluationService');
  const logger = container.resolve('ILogger');

  // Dynamic Languages Array
  const languages = ['java', 'javascript'];
  const [selectedLang, setSelectedLang] = useState('java');

  // Workspace lists
  const [problems, setProblems] = useState([]);
  const [activeProblem, setActiveProblem] = useState(null);
  const [problemDescription, setProblemDescription] = useState('');
  const [sampleTests, setSampleTests] = useState([]);
  const [hints, setHints] = useState([]);
  const [activeHintIdx, setActiveHintIdx] = useState(-1);

  // Editor states
  const [code, setCode] = useState('');
  const [fontSize, setFontSize] = useState(14);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef(null);

  // Run queue & throttles
  const [isExecuting, setIsExecuting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Stdin & Output Console states
  const [stdin, setStdin] = useState('');
  const [consoleTab, setConsoleTab] = useState('output'); // 'output' | 'stdin' | 'tests'
  const [stdout, setStdout] = useState('');
  const [stderr, setStderr] = useState('');
  const [compileOutput, setCompileOutput] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [derivedVerdict, setDerivedVerdict] = useState(null);
  const [testCaseResults, setTestCaseResults] = useState([]);

  // Submissions & Diff Compare states
  const [leftTab, setLeftTab] = useState('description'); // 'description' | 'history'
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubForDiff, setSelectedSubForDiff] = useState(null);
  const [diffOriginalCode, setDiffOriginalCode] = useState('');

  // Sibling problems
  const [prevProblem, setPrevProblem] = useState(null);
  const [nextProblem, setNextProblem] = useState(null);

  // Responsive Mobile Workspace View Tab
  const [mobileWorkspaceTab, setMobileWorkspaceTab] = useState('description');

  // Console resize state
  const consoleRef = useRef(null);
  const [inputPct, setInputPct] = useState(40);  // % width of Input panel
  const [isDragging, setIsDragging] = useState(false);
  const [showInput, setShowInput] = useState(true);

  // Detect if code reads from stdin — if not, hide Input panel automatically
  const codeNeedsStdin = useMemo(() => {
    if (selectedLang === 'java') return /System\.in|BufferedReader|Scanner/.test(code);
    if (selectedLang === 'javascript') return /readline|process\.stdin/.test(code);
    return false;
  }, [code, selectedLang]);

  // Sync showInput with detection (but let user override manually)
  useEffect(() => {
    setShowInput(codeNeedsStdin);
  }, [codeNeedsStdin]);

  // Draggable divider logic (horizontal split within console)
  const handleDividerMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e) => {
      const el = consoleRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setInputPct(Math.max(15, Math.min(75, pct)));
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging]);

  // Console HEIGHT resize
  const rightColRef = useRef(null);
  const [consoleHeight, setConsoleHeight] = useState(192); // px, default h-48
  const [isHeightDragging, setIsHeightDragging] = useState(false);

  const handleHeightDividerMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsHeightDragging(true);
  }, []);

  useEffect(() => {
    if (!isHeightDragging) return;
    const onMove = (e) => {
      const el = rightColRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Distance from bottom of column to mouse = new console height
      const newH = rect.bottom - e.clientY;
      setConsoleHeight(Math.max(80, Math.min(rect.height * 0.65, newH)));
    };
    const onUp = () => setIsHeightDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isHeightDragging]);

  // Listen to network status
  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Load Problems list
  useEffect(() => {
    const fetchList = async () => {
      const list = await problemRepo.listProblems();
      setProblems(list);
      
      // Resolve active problem
      const activeId = problemId || (list.length > 0 ? list[0].id : null);
      if (activeId) {
        const prob = list.find(p => p.id === activeId);
        if (prob) {
          setActiveProblem(prob);
          
          // Siblings index mapping
          const idx = list.findIndex(p => p.id === activeId);
          setPrevProblem(idx > 0 ? list[idx - 1] : null);
          setNextProblem(idx < list.length - 1 ? list[idx + 1] : null);
        }
      }
    };
    fetchList();
  }, [problemId]);

  // Load Problem assets (Markdown, Starter, Sample Tests, Hints)
  useEffect(() => {
    if (!activeProblem) return;

    const loadAssets = async () => {
      setLeftTab('description');
      setSelectedSubForDiff(null);
      setActiveHintIdx(-1);

      try {
        const basePath = `/content/${activeProblem.paths.problem}`;
        const testsPath = `/content/${activeProblem.paths.tests}`;
        const hintsPath = `/content/${activeProblem.paths.hints}`;

        const [descRes, testsRes, hintsRes] = await Promise.all([
          fetch(basePath).then(r => r.text()),
          fetch(testsPath).then(r => r.json()),
          fetch(hintsPath).then(r => r.json())
        ]);

        // Clean custom blocks for Standard MD parsing
        const cleanDescription = descRes
          .replace(/:::(example|constraints|complexity|hint|warning)/g, '')
          .replace(/:::/g, '');

        setProblemDescription(cleanDescription);
        setSampleTests(testsRes);
        setHints(hintsRes);

        // Load or initialize editor session draft from IndexedDB
        await loadEditorSession(activeProblem.id, selectedLang);
        
        // Load past submissions from Firestore
        if (user) {
          const history = await submissionRepo.getSubmissionsByProblem(user.uid, activeProblem.id);
          setSubmissions(history);
        }
      } catch (err) {
        logger.error('Failed to load challenge assets:', err);
      }
    };

    loadAssets();
  }, [activeProblem, selectedLang, user]);

  const loadEditorSession = async (probId, lang) => {
    const sessionKey = `${probId}_${lang}`;
    const cachedSession = await localDB.get('sessions', sessionKey);

    if (cachedSession) {
      setCode(cachedSession.code || '');
      // Restore cursor position if editor is mounted
      if (editorRef.current && cachedSession.cursorLine) {
        editorRef.current.setPosition({
          lineNumber: cachedSession.cursorLine,
          column: cachedSession.cursorColumn
        });
        editorRef.current.revealPosition({
          lineNumber: cachedSession.cursorLine,
          column: cachedSession.cursorColumn
        });
      }
    } else {
      // Fetch starter template from compiled assets
      const starterPathMeta = activeProblem.paths.starter.find(s => s.language === lang);
      if (starterPathMeta) {
        try {
          const starterCode = await fetch(`/content/${starterPathMeta.path}`).then(r => r.text());
          setCode(starterCode);
          await localDB.put('sessions', sessionKey, {
            code: starterCode,
            cursorLine: 1,
            cursorColumn: 1,
            timestamp: Date.now()
          });
        } catch {
          setCode('// Template missing');
        }
      } else {
        setCode('// Starter code not configured for this language.');
      }
    }

    // Restore cached console run
    const cachedRun = await localDB.get('runs', sessionKey);
    if (cachedRun) {
      setStdout(cachedRun.stdout || '');
      setStderr(cachedRun.stderr || '');
      setCompileOutput(cachedRun.compileOutput || '');
      setDerivedVerdict(cachedRun.verdict || null);
      setMetrics(cachedRun.metrics || null);
    } else {
      setStdout('');
      setStderr('');
      setCompileOutput('');
      setDerivedVerdict(null);
      setMetrics(null);
    }
  };

  const handleEditorChange = (value) => {
    setCode(value);
    if (!activeProblem) return;

    // Async auto-save editor state to IndexedDB
    const sessionKey = `${activeProblem.id}_${selectedLang}`;
    const pos = editorRef.current ? editorRef.current.getPosition() : { lineNumber: 1, column: 1 };
    
    localDB.put('sessions', sessionKey, {
      code: value,
      cursorLine: pos?.lineNumber || 1,
      cursorColumn: pos?.column || 1,
      timestamp: Date.now()
    });
  };

  const handleResetCode = async () => {
    if (!activeProblem) return;
    const confirmReset = window.confirm('Are you sure you want to reset the current workspace code back to the starter template?');
    if (!confirmReset) return;

    const starterPathMeta = activeProblem.paths.starter.find(s => s.language === selectedLang);
    if (starterPathMeta) {
      const starterCode = await fetch(`/content/${starterPathMeta.path}`).then(r => r.text());
      setCode(starterCode);
      const sessionKey = `${activeProblem.id}_${selectedLang}`;
      await localDB.put('sessions', sessionKey, {
        code: starterCode,
        cursorLine: 1,
        cursorColumn: 1,
        timestamp: Date.now()
      });
    }
  };

  // Helper to load standard language specifications resolved from providers
  const getLanguageProvider = (lang) => {
    const judge0Ids = { java: 62, javascript: 63, sql: 82 };
    return {
      getLanguageId: () => lang,
      getPistonLanguageName: () => lang === 'javascript' ? 'javascript' : 'java',
      getPistonVersion: () => lang === 'javascript' ? '18.15.0' : '15.0.2',
      getStarterFileName: () => lang === 'javascript' ? 'solution.js' : 'Solution.java',
      getJudge0LanguageId: () => judge0Ids[lang] ?? null,
    };
  };

  const handleRunCode = async () => {
    if (isExecuting || cooldown > 0 || !activeProblem) return;
    if (!isOnline) return;

    setIsExecuting(true);
    setConsoleTab('output');
    setStdout('');
    setStderr('');
    setCompileOutput('');
    setDerivedVerdict(null);

    const provider = getLanguageProvider(selectedLang);
    try {
      const result = await executionProvider.executeCode(provider, code, stdin);
      
      setStdout(result.stdout);
      setStderr(result.stderr);
      setCompileOutput(result.compileOutput);
      setMetrics({ runtime: result.runtime, memory: result.memory });

      // Save output cache to IndexedDB
      const sessionKey = `${activeProblem.id}_${selectedLang}`;
      await localDB.put('runs', sessionKey, {
        stdout: result.stdout,
        stderr: result.stderr,
        compileOutput: result.compileOutput,
        metrics: { runtime: result.runtime, memory: result.memory }
      });
    } catch (err) {
      setStderr(err.message || 'Execution error');
    } finally {
      setIsExecuting(false);
      setCooldown(3); // Start 3-second throttle cooldown
    }
  };

  const handlePracticeCheck = async () => {
    if (isExecuting || cooldown > 0 || !activeProblem || sampleTests.length === 0) return;
    if (!isOnline) return;

    setIsExecuting(true);
    setConsoleTab('tests');
    setTestCaseResults([]);
    setDerivedVerdict(null);

    const provider = getLanguageProvider(selectedLang);
    let allPassed = true;
    const listResults = [];

    // Run test cases sequentially in sandbox
    for (const test of sampleTests) {
      try {
        const result = await executionProvider.executeCode(provider, code, test.input);
        const caseVerdict = evaluationService.evaluate(result, test.expected);
        
        const passed = caseVerdict === Verdict.Accepted;
        if (!passed) allPassed = false;

        listResults.push({
          id: test.id,
          name: test.name,
          input: test.input,
          expected: test.expected,
          actual: result.stdout || result.stderr || result.compileOutput,
          passed
        });
      } catch (err) {
        allPassed = false;
        listResults.push({
          id: test.id,
          name: test.name,
          input: test.input,
          expected: test.expected,
          actual: err.message,
          passed: false
        });
      }
    }

    setTestCaseResults(listResults);
    const finalVerdict = allPassed ? Verdict.Accepted : Verdict.WrongAnswer;
    setDerivedVerdict(finalVerdict);

    // Save submission metadata log in Firestore / LocalStorage mock
    if (user) {
      const submission = new Submission({
        userId: user.uid,
        problemId: activeProblem.id,
        language: selectedLang,
        verdict: finalVerdict,
        runtime: listResults.reduce((sum, r) => sum + (r.runtime || 0), 0) / listResults.length,
        memory: 0
      });

      const submissionId = await submissionRepo.saveSubmission(user.uid, submission);
      
      // Store full code string locally under IndexedDB history store to keep Firestore billing free
      await localDB.put('history', submissionId, code);

      if (finalVerdict === Verdict.Accepted && activeProblem.topic) {
        const learningUseCase = container.resolve('LearningUseCase');
        await learningUseCase.solvePractice(
          user.uid,
          activeProblem.topic,
          activeProblem.id,
          submissions.length + 1,
          activeHintIdx + 1
        );
      }

      // Refresh list
      const history = await submissionRepo.getSubmissionsByProblem(user.uid, activeProblem.id);
      setSubmissions(history);
    }

    setIsExecuting(false);
    setCooldown(3); // Throttle
  };

  const handleCompareSubmission = async (sub) => {
    setSelectedSubForDiff(sub);
    const historicalCode = await localDB.get('history', sub.id);
    setDiffOriginalCode(historicalCode || '// Submission code not found in local IndexedDB history.');
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-var(--topbar-height)-2rem)] text-text ${
      isFullscreen ? 'fixed inset-0 z-50 bg-surface p-4 h-screen' : ''
    }`}>
      {/* Top Controls Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-surface-secondary border border-surface-border p-3 rounded-t-xl gap-3">
        <div className="flex items-center gap-3">
          {/* Problem Dropdown Selector */}
          <select
            value={activeProblem?.id || ''}
            onChange={(e) => {
              const selected = problems.find(p => p.id === e.target.value);
              if (selected) {
                navigate(`/compiler/problems/${selected.slug}`);
              }
            }}
            className="px-3 py-1.5 bg-surface border border-surface-border rounded-lg text-sm text-text font-semibold focus:outline-none cursor-pointer"
          >
            {problems.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          
          {/* Difficulty badge */}
          {activeProblem && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
              activeProblem.difficulty.color === 'green' ? 'bg-green-950 text-green-300 border-green-800' :
              activeProblem.difficulty.color === 'yellow' ? 'bg-amber-950 text-amber-300 border-amber-800' :
              'bg-red-950 text-red-300 border-red-800'
            }`}>
              {activeProblem.difficulty.label}
            </span>
          )}
        </div>

        {/* Offline notice */}
        {!isOnline && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-red-950/40 border border-red-800 rounded text-red-400 text-xs font-semibold animate-pulse">
            <WifiOff className="h-3.5 w-3.5" />
            <span>Offline: Execution Disabled</span>
          </div>
        )}

        <div className="flex items-center gap-4">
          {/* Language toggle selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-text/50 font-mono">LANG:</span>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="px-2 py-1 bg-surface border border-surface-border rounded text-xs text-text focus:outline-none cursor-pointer font-bold"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Monaco Font Size Adjusters */}
          <div className="flex items-center border border-surface-border rounded-lg bg-surface overflow-hidden shrink-0">
            <button
              onClick={() => setFontSize(Math.max(10, fontSize - 1))}
              className="p-1.5 hover:bg-surface-tertiary transition-colors cursor-pointer border-r border-surface-border text-text/60"
              aria-label="Decrease editor font size"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="px-2.5 text-xs font-semibold font-mono text-text/80">{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(24, fontSize + 1))}
              className="p-1.5 hover:bg-surface-tertiary transition-colors cursor-pointer border-l border-surface-border text-text/60"
              aria-label="Increase editor font size"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 bg-surface hover:bg-surface-tertiary border border-surface-border rounded-lg text-text/60 transition-colors cursor-pointer shrink-0"
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Workspace Navigation TabBar */}
      <div className="flex xl:hidden bg-surface-secondary border-b border-surface-border p-1 gap-1">
        <button
          onClick={() => setMobileWorkspaceTab('description')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg text-center cursor-pointer transition-all ${
            mobileWorkspaceTab === 'description'
              ? 'bg-surface text-brand-600 shadow-sm border border-surface-border dark:text-brand-300'
              : 'text-text/60 hover:bg-surface-tertiary'
          }`}
        >
          Description
        </button>
        <button
          onClick={() => setMobileWorkspaceTab('editor')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg text-center cursor-pointer transition-all ${
            mobileWorkspaceTab === 'editor'
              ? 'bg-surface text-brand-600 shadow-sm border border-surface-border dark:text-brand-300'
              : 'text-text/60 hover:bg-surface-tertiary'
          }`}
        >
          Code Editor
        </button>
        <button
          onClick={() => {
            setMobileWorkspaceTab('console');
            setConsoleTab('output');
          }}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg text-center cursor-pointer transition-all ${
            mobileWorkspaceTab === 'console'
              ? 'bg-surface text-brand-600 shadow-sm border border-surface-border dark:text-brand-300'
              : 'text-text/60 hover:bg-surface-tertiary'
          }`}
        >
          Console Output
        </button>
      </div>

      {/* Main split dashboard pane */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-px bg-surface-border overflow-hidden">
        
        {/* LEFT COLUMN: Problem description vs Submissions log */}
        <div className={`bg-surface flex flex-col overflow-hidden border-x border-surface-border ${mobileWorkspaceTab === 'description' ? 'flex' : 'hidden xl:flex'}`}>
          {/* Header tabs */}
          <div className="bg-surface-secondary px-4 border-b border-surface-border flex gap-2">
            <button
              onClick={() => setLeftTab('description')}
              className={`py-3 px-3 text-xs font-bold uppercase border-b-2 transition-colors cursor-pointer ${
                leftTab === 'description' ? 'border-brand-500 text-brand-600 dark:text-brand-300' : 'border-transparent text-text/40 hover:text-text'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setLeftTab('history')}
              className={`py-3 px-3 text-xs font-bold uppercase border-b-2 transition-colors cursor-pointer ${
                leftTab === 'history' ? 'border-brand-500 text-brand-600 dark:text-brand-300' : 'border-transparent text-text/40 hover:text-text'
              }`}
            >
              History ({submissions.length})
            </button>
          </div>

          {/* Tab content area */}
          <div className="flex-1 p-6 overflow-y-auto leading-relaxed text-text/80">
            {leftTab === 'description' ? (
              <div className="space-y-6">
                <MarkdownRenderer content={problemDescription} />
                
                {/* Accordion for Socratic Hints */}
                {hints.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-surface-border">
                    <h4 className="text-sm font-bold text-text flex items-center gap-1.5">
                      <HelpCircle className="h-4.5 w-4.5 text-brand-500" />
                      Socratic Code Hints
                    </h4>
                    <div className="space-y-2">
                      {hints.map((h, hIdx) => {
                        const revealed = activeHintIdx >= hIdx;
                        return (
                          <div 
                            key={h.id} 
                            className={`p-3 border rounded-lg transition-all ${
                              revealed 
                                ? 'bg-surface-secondary border-surface-border' 
                                : 'bg-surface/30 border-dashed border-surface-border text-center'
                            }`}
                          >
                            {revealed ? (
                              <p className="text-xs leading-relaxed text-text/80">
                                <strong className="text-text font-bold block mb-1">Hint {hIdx + 1}:</strong>
                                {h.hint}
                              </p>
                            ) : (
                              <button
                                onClick={() => setActiveHintIdx(hIdx)}
                                disabled={activeHintIdx < hIdx - 1}
                                className="text-xs font-bold text-brand-500 hover:underline cursor-pointer disabled:opacity-40"
                              >
                                Unlock Hint {hIdx + 1}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : selectedSubForDiff ? (
              // Code Comparison View (Git-style Side-by-Side)
              <div className="flex flex-col h-full space-y-4">
                <div className="flex justify-between items-center bg-surface-secondary border border-surface-border p-3 rounded-lg">
                  <div>
                    <span className="text-xs font-mono block text-text/40">COMPARING SUBMISSION</span>
                    <span className="text-sm font-bold text-text">{selectedSubForDiff.verdict} ({selectedSubForDiff.language})</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setCode(diffOriginalCode);
                        setSelectedSubForDiff(null);
                      }}
                      className="btn-primary py-1 px-3 text-xs"
                    >
                      Restore Code
                    </button>
                    <button
                      onClick={() => setSelectedSubForDiff(null)}
                      className="btn-secondary py-1 px-3 text-xs"
                    >
                      Close Comparison
                    </button>
                  </div>
                </div>

                <div className="flex-1 border border-surface-border rounded-lg overflow-hidden min-h-[300px]">
                  <MonacoWrapper
                    isDiff={true}
                    originalValue={diffOriginalCode}
                    value={code}
                    theme={theme === 'dark' ? 'vs-dark' : 'vs'}
                    language={selectedLang}
                    options={{
                      originalEditable: false,
                      renderSideBySide: true
                    }}
                  />
                </div>
              </div>
            ) : (
              // List past submissions
              <div className="space-y-3">
                {submissions.length === 0 ? (
                  <p className="text-text/50 italic text-center py-8">No submissions found for this challenge.</p>
                ) : (
                  submissions.map((sub) => (
                    <div 
                      key={sub.id} 
                      onClick={() => handleCompareSubmission(sub)}
                      className="p-4 bg-surface-secondary border border-surface-border rounded-xl cursor-pointer hover:border-brand-500 hover:bg-surface-tertiary transition-all flex justify-between items-center"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            sub.verdict === Verdict.Accepted 
                              ? 'bg-green-950 text-green-300 border border-green-800' 
                              : 'bg-red-950 text-red-300 border border-red-800'
                          }`}>
                            {sub.verdict}
                          </span>
                          <span className="text-xs text-text/40 font-mono">{sub.language.toUpperCase()}</span>
                        </div>
                        <span className="text-[10px] text-text/40 block mt-1.5 font-medium">
                          Submitted on {sub.createdAt.toLocaleString()}
                        </span>
                      </div>

                      <div className="text-right text-[10px] font-mono text-text/50">
                        <span>Latency: {Math.round(sub.runtime)}ms</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Monaco editor + Output consoles */}
        <div
          ref={rightColRef}
          className={`bg-surface flex flex-col overflow-hidden border-r border-surface-border ${
            mobileWorkspaceTab === 'editor' || mobileWorkspaceTab === 'console' ? 'flex' : 'hidden xl:flex'
          } ${isHeightDragging ? 'cursor-row-resize select-none' : ''}`}
        >
          {/* Workspace Actions toolbar */}
          <div className="bg-surface-secondary px-4 py-2 border-b border-surface-border flex justify-between items-center">
            <span className="text-xs font-bold text-text/40 uppercase tracking-wider">Workspace Editor</span>
            <div className="flex gap-2">
              <button
                onClick={handleResetCode}
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 cursor-pointer"
                title="Reset workspace back to starter template"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reset
              </button>
              
              <button
                onClick={handleRunCode}
                disabled={isExecuting || cooldown > 0 || !isOnline}
                className="btn-secondary text-xs py-1.5 px-3.5 flex items-center gap-1.5 cursor-pointer hover:bg-surface-tertiary disabled:opacity-40"
              >
                <Play className="h-3.5 w-3.5" />
                {cooldown > 0 ? `Run (${cooldown}s)` : 'Run Code'}
              </button>
              
              <button
                onClick={handlePracticeCheck}
                disabled={isExecuting || cooldown > 0 || !isOnline || sampleTests.length === 0}
                className="btn-primary text-xs py-1.5 px-4.5 flex items-center gap-1.5 shadow-lg shadow-brand-900/20 disabled:opacity-40"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                {cooldown > 0 ? `Check (${cooldown}s)` : 'Practice Check'}
              </button>
            </div>
          </div>

          {/* Monaco Editor wrapped container */}
          <div className={`flex-1 min-h-0 overflow-hidden relative ${mobileWorkspaceTab === 'console' ? 'hidden sm:block' : ''}`}>
            <MonacoWrapper
              language={selectedLang}
              value={code}
              onChange={handleEditorChange}
              fontSize={fontSize}
              theme={theme === 'dark' ? 'vs-dark' : 'vs'}
              onMount={(editor) => {
                editorRef.current = editor;
              }}
            />
          </div>

          {/* Horizontal height-resize grip */}
          {mobileWorkspaceTab !== 'console' && (
            <div
              onMouseDown={handleHeightDividerMouseDown}
              className="h-1.5 shrink-0 bg-zinc-800 hover:bg-brand-500/50 active:bg-brand-500 cursor-row-resize transition-colors flex items-center justify-center group"
              title="Drag to resize console height"
            >
              <div className="w-8 h-0.5 rounded-full bg-zinc-600 group-hover:bg-brand-400 transition-colors" />
            </div>
          )}

          {/* Console — Programiz-style with resize + smart Input visibility */}
          <div
            ref={consoleRef}
            className={`flex flex-col border-t border-zinc-800 shrink-0 select-none ${
              isDragging || isHeightDragging ? 'cursor-col-resize' : ''
            }`}
            style={mobileWorkspaceTab === 'console' ? { flex: 1 } : { height: `${consoleHeight}px` }}
          >
            {/* Header bar */}
            <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border-b border-zinc-800 shrink-0">
              {/* Toggle Input panel button */}
              <button
                onClick={() => setShowInput(v => !v)}
                title={showInput ? 'Hide Input' : 'Show Input'}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                  showInput
                    ? 'bg-brand-600/20 border-brand-500/40 text-brand-400 hover:bg-brand-600/30'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {showInput ? '▶ Input' : '+ Input'}
              </button>
              {!codeNeedsStdin && showInput && (
                <span className="text-[10px] text-zinc-600">code doesn't read stdin</span>
              )}
              <div className="ml-auto flex items-center gap-3">
                {metrics && (
                  <span className="text-[10px] text-zinc-600 font-mono">{metrics.runtime}ms</span>
                )}
              </div>
            </div>

            {/* Panels row */}
            <div className="flex flex-1 min-h-0">

              {/* LEFT: Input (conditional) */}
              {showInput && (
                <>
                  <div className="flex flex-col min-w-0 border-r border-zinc-800" style={{ width: `${inputPct}%` }}>
                    <div className="flex items-center justify-between px-3 py-1 bg-zinc-900/60 border-b border-zinc-800 shrink-0">
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Input</span>
                      {stdin && (
                        <button onClick={() => setStdin('')} className="text-[10px] text-zinc-600 hover:text-zinc-400 cursor-pointer">clear</button>
                      )}
                    </div>
                    <textarea
                      value={stdin}
                      onChange={(e) => setStdin(e.target.value)}
                      placeholder={"2,7,11,15\n9"}
                      spellCheck={false}
                      className="flex-1 w-full bg-zinc-950 text-zinc-200 font-mono text-xs px-3 py-2 resize-none outline-none placeholder:text-zinc-700 border-none"
                    />
                  </div>

                  {/* Draggable Divider */}
                  <div
                    onMouseDown={handleDividerMouseDown}
                    className="w-1 bg-zinc-800 hover:bg-brand-500/60 active:bg-brand-500 cursor-col-resize shrink-0 transition-colors"
                  />
                </>
              )}

              {/* RIGHT: Output */}
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between px-3 py-1 bg-zinc-900/60 border-b border-zinc-800 shrink-0">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Output</span>
                </div>
                <div className="flex-1 bg-zinc-950 text-zinc-100 font-mono text-xs px-3 py-2 overflow-y-auto">
                  {isExecuting ? (
                    <div className="flex items-center gap-2 text-zinc-500">
                      <span className="h-3 w-3 border-2 border-zinc-700 border-t-brand-400 rounded-full animate-spin" />
                      Running...
                    </div>
                  ) : compileOutput ? (
                    <pre className="whitespace-pre-wrap text-red-400">{compileOutput}</pre>
                  ) : stdout ? (
                    <pre className="whitespace-pre-wrap text-zinc-100">{stdout}</pre>
                  ) : stderr ? (
                    <pre className="whitespace-pre-wrap text-amber-300">{stderr}</pre>
                  ) : testCaseResults.length > 0 ? (
                    <div className="space-y-2">
                      {derivedVerdict && (
                        <div className={`text-[11px] font-bold mb-2 ${derivedVerdict === Verdict.Accepted ? 'text-green-400' : 'text-red-400'}`}>
                          {derivedVerdict === Verdict.Accepted ? '✅ All tests passed' : '❌ Some tests failed'}
                        </div>
                      )}
                      {testCaseResults.map((res) => (
                        <div key={res.id} className={`border-l-2 pl-2 text-[11px] ${res.passed ? 'border-green-600' : 'border-red-600'}`}>
                          <div className="font-semibold text-zinc-300">{res.name} {res.passed ? '✓' : '✗'}</div>
                          {!res.passed && (
                            <>
                              <div className="text-zinc-600">Expected: <span className="text-zinc-400">{res.expected}</span></div>
                              <div className="text-zinc-600">Got: <span className="text-red-400">{res.actual}</span></div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-zinc-700">Output will appear here</span>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Sibling navigation footer bar */}
      <footer className="mt-4 flex justify-between bg-surface-secondary border border-surface-border p-3 rounded-b-xl gap-4 text-xs font-semibold">
        {prevProblem ? (
          <button
            onClick={() => navigate(`/compiler/problems/${prevProblem.slug}`)}
            className="btn-secondary py-1.5 px-3 flex items-center gap-1.5 cursor-pointer hover:border-brand-500 text-text/80"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Prev: {prevProblem.title}</span>
          </button>
        ) : (
          <div />
        )}

        {nextProblem ? (
          <button
            onClick={() => navigate(`/compiler/problems/${nextProblem.slug}`)}
            className="btn-primary py-1.5 px-3.5 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Next: {nextProblem.title}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <div />
        )}
      </footer>
    </div>
  );
}
