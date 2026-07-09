import React from 'react';
import Editor from '@monaco-editor/react';

export function MonacoWrapper({
  language = 'java',
  value = '',
  onChange,
  fontSize = 14,
  theme = 'vs-dark',
  readOnly = false,
  onMount
}) {
  const handleEditorDidMount = (editor, monaco) => {
    if (onMount) {
      onMount(editor, monaco);
    }
  };

  return (
    <div className="w-full h-full min-h-[300px]">
      <Editor
        height="100%"
        language={language}
        theme={theme}
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
          autoIndent: 'advanced'
        }}
      />
    </div>
  );
}

export default MonacoWrapper;
