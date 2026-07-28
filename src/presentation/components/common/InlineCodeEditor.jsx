import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Play, RotateCcw, ChevronDown } from "lucide-react";
import { MonacoWrapper } from "./MonacoWrapper";
import { container } from "../../../infrastructure/di/container";
import { useThemeStore } from "../../store/useThemeStore";

/**
 * InlineCodeEditor — a mini sandbox embedded in the Practice tab.
 * Props:
 *  - defaultCode: string   — initial code (from lesson example)
 *  - defaultLang: string   — "java" | "javascript" (default: "java")
 *  - height: number        — editor height in px (default: 260)
 */
export function InlineCodeEditor({ defaultCode = "", defaultLang = "java", height = 260 }) {
  const { theme } = useThemeStore();
  const executionProvider = container.resolve("IExecutionProvider");

  const [code, setCode] = useState(defaultCode);
  const [lang, setLang] = useState(defaultLang);
  const [stdin, setStdin] = useState("");
  const [stdout, setStdout] = useState("");
  const [stderr, setStderr] = useState("");
  const [compileOutput, setCompileOutput] = useState("");
  const [metrics, setMetrics] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    setCode(defaultCode);
    setStdout(""); setStderr(""); setCompileOutput(""); setMetrics(null);
  }, [defaultCode]);

  useEffect(() => { setLang(defaultLang); }, [defaultLang]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Auto-detect if code reads from stdin
  const codeNeedsStdin = useMemo(() => {
    if (lang === "java") return /System\.in|BufferedReader|Scanner|Console|read\s*\(|readLine/i.test(code);
    if (lang === "javascript") return /readline|process\.stdin|readFileSync\s*\(\s*0|prompt\s*\(/i.test(code);
    return false;
  }, [code, lang]);

  // Sync Input panel visibility dynamically with detector
  useEffect(() => {
    setShowInput(codeNeedsStdin);
  }, [codeNeedsStdin]);

  const getLanguageProvider = useCallback(() => {
    const judge0Ids = { java: 62, javascript: 63 };
    return {
      getLanguageId: () => lang,
      getJudge0LanguageId: () => judge0Ids[lang] ?? null,
      getPistonLanguageName: () => lang,
      getPistonVersion: () => "",
      getStarterFileName: () => lang === "java" ? "Solution.java" : "solution.js",
    };
  }, [lang]);

  const handleRun = useCallback(async () => {
    if (isRunning || cooldown > 0) return;
    setIsRunning(true);
    setStdout(""); setStderr(""); setCompileOutput(""); setMetrics(null);
    try {
      const result = await executionProvider.executeCode(getLanguageProvider(), code, stdin);
      setStdout(result.stdout || "");
      setStderr(result.stderr || "");
      setCompileOutput(result.compileOutput || "");
      setMetrics({ runtime: result.runtime });
    } catch (err) {
      setStderr(err.message || "Execution error");
    } finally {
      setIsRunning(false);
      setCooldown(3);
    }
  }, [isRunning, cooldown, code, stdin, executionProvider, getLanguageProvider]);

  useEffect(() => {
    const h = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleRun(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [handleRun]);

  const hasOutput = !!(compileOutput || stdout || stderr);

  return (
    <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-950 shadow-lg mt-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border-b border-zinc-800">
        <div className="relative">
          <select
            value={lang}
            onChange={e => { setLang(e.target.value); setStdout(""); setStderr(""); setCompileOutput(""); setMetrics(null); }}
            className="appearance-none bg-zinc-800 text-zinc-300 text-[11px] font-semibold rounded px-2 py-1 pr-6 border border-zinc-700 cursor-pointer outline-none hover:bg-zinc-700 transition-colors"
          >
            <option value="java">Java</option>
            <option value="javascript">JavaScript</option>
          </select>
          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500 pointer-events-none" />
        </div>

        <button
          onClick={handleRun}
          disabled={isRunning || cooldown > 0}
          className="flex items-center gap-1.5 px-3 py-1 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white text-[11px] font-semibold rounded transition-colors cursor-pointer"
        >
          {isRunning ? (
            <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Play className="h-3 w-3" />
          )}
          {cooldown > 0 ? `Wait ${cooldown}s` : isRunning ? "Running..." : "Run"}
          {!isRunning && cooldown === 0 && (
            <span className="text-white/40 text-[10px] ml-0.5">Ctrl+Enter</span>
          )}
        </button>

        {defaultCode && code !== defaultCode && (
          <button
            onClick={() => { setCode(defaultCode); setStdout(""); setStderr(""); setCompileOutput(""); setMetrics(null); }}
            className="flex items-center gap-1 px-2 py-1 text-zinc-500 hover:text-zinc-300 text-[11px] rounded hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Reset to example code"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}

        <div className="ml-auto flex items-center gap-3">
          {metrics && <span className="text-[10px] text-zinc-600 font-mono">{metrics.runtime}ms</span>}
          <button
            onClick={() => setShowInput(v => !v)}
            className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
              showInput
                ? "bg-brand-600/30 border-brand-500/50 text-brand-400"
                : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-zinc-300"
            }`}
            title={codeNeedsStdin ? "Auto-detected: Code reads input" : "Toggle custom input"}
          >
            {codeNeedsStdin ? "📥 Stdin Required" : showInput ? "▾ Stdin Input" : "+ Stdin Input"}
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div style={{ height: `${height}px` }}>
        <MonacoWrapper
          language={lang}
          value={code}
          onChange={setCode}
          fontSize={13}
          theme={theme === "dark" ? "vs-dark" : "vs"}
        />
      </div>

      {/* Console Output Bar (Always Prominent & Visible) */}
      <div className="border-t-2 border-zinc-800 bg-zinc-950 flex flex-col">
        {/* Header Bar */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/90 px-3 py-1.5 items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 font-mono">▶</span>
            <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Console Output</span>
            {isRunning && (
              <span className="text-[10px] text-brand-400 animate-pulse font-mono ml-2">Running code...</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {metrics && (
              <span className="text-[10px] text-zinc-500 font-mono">⚡ {metrics.runtime}ms</span>
            )}
            {!hasOutput && !isRunning && (
              <span className="text-[10px] text-zinc-500">Click Run or Ctrl+Enter</span>
            )}
          </div>
        </div>

        {/* Content Box */}
        <div className="flex min-h-[100px] max-h-[180px]">
          {/* Stdin Panel (if enabled) */}
          {showInput && (
            <div className="flex flex-col w-2/5 border-r border-zinc-800 bg-zinc-900/30 shrink-0">
              <div className="flex items-center justify-between px-3 py-1 bg-zinc-900/60 border-b border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Input (stdin)</span>
                {stdin && (
                  <button 
                    onClick={() => setStdin("")} 
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <textarea
                value={stdin}
                onChange={e => setStdin(e.target.value)}
                placeholder="Paste stdin here..."
                spellCheck={false}
                className="flex-1 w-full bg-transparent text-zinc-200 font-mono text-xs p-2.5 resize-none outline-none placeholder:text-zinc-600 border-none leading-relaxed"
              />
            </div>
          )}

          {/* Program Output Window */}
          <div className="flex-1 flex flex-col min-w-0 bg-zinc-950 p-3 overflow-y-auto font-mono text-xs leading-relaxed">
            {isRunning ? (
              <div className="flex items-center gap-2 text-zinc-400 py-1">
                <span className="h-3.5 w-3.5 border-2 border-zinc-600 border-t-brand-400 rounded-full animate-spin" />
                <span>Executing in sandbox...</span>
              </div>
            ) : compileOutput ? (
              <div className="space-y-1">
                <span className="text-red-400 font-semibold block text-[10px] uppercase tracking-wider">Compilation Error</span>
                <pre className="whitespace-pre-wrap text-red-300 font-mono bg-red-950/20 p-2 rounded border border-red-900/30">{compileOutput}</pre>
              </div>
            ) : stdout ? (
              <div className="space-y-1">
                <span className="text-emerald-400 font-semibold block text-[10px] uppercase tracking-wider">Standard Output</span>
                <pre className="whitespace-pre-wrap text-zinc-100 font-mono">{stdout}</pre>
              </div>
            ) : stderr ? (
              <div className="space-y-1">
                <span className="text-amber-400 font-semibold block text-[10px] uppercase tracking-wider">Standard Error</span>
                <pre className="whitespace-pre-wrap text-amber-300 font-mono bg-amber-950/20 p-2 rounded border border-amber-900/30">{stderr}</pre>
              </div>
            ) : metrics ? (
              <div className="text-emerald-400 text-xs py-1">
                ✓ Program completed with no output (exit code 0)
              </div>
            ) : (
              <div className="text-zinc-600 italic py-1">
                Program output will appear here after clicking Run.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
