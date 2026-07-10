import React, { Suspense, lazy } from 'react';
import Spinner from '../ui/Spinner';

// Lazy load both Editor and DiffEditor from the same module to ensure code splitting
const LazyMonaco = lazy(() => import('@monaco-editor/react').then(m => ({
  default: ({ isDiff, ...props }) => {
    const Component = isDiff ? m.DiffEditor : m.default;
    return <Component {...props} />;
  }
})));

export function MonacoWrapper({
  language = 'java',
  value = '',
  onChange,
  fontSize = 14,
  theme = 'vs-dark',
  readOnly = false,
  onMount,
  isDiff = false,
  originalValue = '',
  modifiedValue = '',
  options = {}
}) {
  const handleEditorDidMount = (editor, monaco) => {
    if (onMount) {
      onMount(editor, monaco);
    }
  };

  return (
    <div className="w-full h-full min-h-[300px] relative bg-surface flex items-center justify-center">
      <Suspense fallback={
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface/80 z-10">
          <Spinner size="lg" />
          <span className="text-xs text-text/40 font-mono tracking-wider">Initialising workspace compiler...</span>
        </div>
      }>
        <LazyMonaco
          isDiff={isDiff}
          height="100%"
          language={language}
          theme={theme}
          original={originalValue}
          modified={value}
          value={value}
          onChange={onChange}
          onMount={handleEditorDidMount}
          options={{
            readOnly,
            fontSize,
            minimap: { enabled: false },
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8
            },
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            lineNumbers: 'on',
            wordWrap: 'on',
            bracketPairColorization: { enabled: true },
            autoIndent: 'advanced',
            ...options
          }}
        />
      </Suspense>
    </div>
  );
}

export default MonacoWrapper;
