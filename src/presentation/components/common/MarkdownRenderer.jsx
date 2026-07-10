import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy, Info, AlertTriangle, AlertCircle } from 'lucide-react';

// Custom syntax-highlighted code block with copy button
function CodeBlock({ language, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fail silently
    }
  };

  return (
    <div className="relative group my-6 rounded-lg overflow-hidden border border-surface-border">
      {/* Code Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface border-b border-surface-border text-xs text-text/50 font-mono">
        <span>{language ? language.toUpperCase() : 'CODE'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-text cursor-pointer transition-colors p-1 rounded hover:bg-surface-tertiary"
          aria-label="Copy code block"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      
      {/* Code Area */}
      <pre className="p-4 overflow-x-auto bg-surface/30 dark:bg-surface/40 text-sm font-mono leading-relaxed text-text">
        <code className={`language-${language}`}>{value}</code>
      </pre>
    </div>
  );
}

// Helper to convert heading text to a URL-friendly anchor ID
export function slugify(text) {
  if (typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function MarkdownRenderer({ content }) {
  // Custom renders overrides
  const components = {
    // Custom heading overrides to generate anchor links
    h1: ({ children }) => {
      const id = slugify(String(children));
      return <h1 id={id} className="text-3xl font-extrabold tracking-tight text-text mt-8 mb-4 border-b border-surface-border pb-2 scroll-mt-20">{children}</h1>;
    },
    h2: ({ children }) => {
      const id = slugify(String(children));
      return <h2 id={id} className="text-2xl font-bold tracking-tight text-text mt-8 mb-4 scroll-mt-20">{children}</h2>;
    },
    h3: ({ children }) => {
      const id = slugify(String(children));
      return <h3 id={id} className="text-xl font-bold text-text mt-6 mb-3 scroll-mt-20">{children}</h3>;
    },
    h4: ({ children }) => {
      const id = slugify(String(children));
      return <h4 id={id} className="text-lg font-semibold text-text mt-5 mb-2 scroll-mt-20">{children}</h4>;
    },
    p: ({ children }) => <p className="text-base text-text/80 leading-relaxed my-4">{children}</p>,
    
    // Code blocks
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');
      
      if (!inline && match) {
        return <CodeBlock language={match[1]} value={codeString} />;
      }
      
      return (
        <code 
          className="px-1.5 py-0.5 bg-surface-secondary text-brand-600 dark:text-brand-300 rounded font-mono text-sm border border-surface-border break-words" 
          {...props}
        >
          {children}
        </code>
      );
    },

    // Responsive tables wrapper
    table: ({ children }) => (
      <div className="w-full overflow-x-auto my-6 border border-surface-border rounded-xl shadow-sm">
        <table className="w-full text-sm text-left border-collapse">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-surface-secondary text-text/80 font-bold border-b border-surface-border">{children}</thead>,
    tbody: ({ children }) => <tbody className="divide-y divide-surface-border bg-surface/20">{children}</tbody>,
    tr: ({ children }) => <tr className="hover:bg-surface-secondary/40 transition-colors">{children}</tr>,
    th: ({ children }) => <th className="px-4 py-3 font-semibold text-text">{children}</th>,
    td: ({ children }) => <td className="px-4 py-3 text-text/80">{children}</td>,

    // Custom alert/callout box blocks overrides
    blockquote: ({ children }) => {
      // Inspect children text to detect block tokens
      const text = React.Children.toArray(children)
        .map((child) => (child.props && child.props.children ? child.props.children : ''))
        .join(' ');

      if (text.includes('[!NOTE]')) {
        const cleanChildren = React.Children.map(children, (child) => {
          if (child.props && typeof child.props.children === 'string') {
            return React.cloneElement(child, {
              children: child.props.children.replace('[!NOTE]', '').trim()
            });
          }
          if (child.props && Array.isArray(child.props.children)) {
            const newChildren = child.props.children.map((c) => 
              typeof c === 'string' ? c.replace('[!NOTE]', '').trim() : c
            );
            return React.cloneElement(child, { children: newChildren });
          }
          return child;
        });

        return (
          <div className="my-6 bg-brand-500/5 border-l-4 border-brand-500 rounded-r-lg p-4 flex gap-3 text-text/85">
            <Info className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
            <div className="text-sm prose-sm leading-relaxed">{cleanChildren}</div>
          </div>
        );
      }

      if (text.includes('[!WARNING]')) {
        const cleanChildren = React.Children.map(children, (child) => {
          if (child.props && typeof child.props.children === 'string') {
            return React.cloneElement(child, {
              children: child.props.children.replace('[!WARNING]', '').trim()
            });
          }
          return child;
        });

        return (
          <div className="my-6 bg-amber-500/5 border-l-4 border-amber-500 rounded-r-lg p-4 flex gap-3 text-text/85">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm prose-sm leading-relaxed">{cleanChildren}</div>
          </div>
        );
      }

      if (text.includes('[!CAUTION]') || text.includes('[!IMPORTANT]')) {
        const cleanChildren = React.Children.map(children, (child) => {
          if (child.props && typeof child.props.children === 'string') {
            return React.cloneElement(child, {
              children: child.props.children.replace(/\[!(CAUTION|IMPORTANT)\]/, '').trim()
            });
          }
          return child;
        });

        return (
          <div className="my-6 bg-red-500/5 border-l-4 border-red-500 rounded-r-lg p-4 flex gap-3 text-text/85">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-sm prose-sm leading-relaxed">{cleanChildren}</div>
          </div>
        );
      }

      return (
        <blockquote className="my-6 pl-4 border-l-4 border-surface-border text-text/60 italic leading-relaxed">
          {children}
        </blockquote>
      );
    },

    // Standard markdown elements
    ul: ({ children }) => <ul className="list-disc pl-6 my-4 space-y-1.5 text-text/85">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-6 my-4 space-y-1.5 text-text/85">{children}</ol>,
    li: ({ children }) => <li className="text-base leading-relaxed">{children}</li>,
    a: ({ href, children }) => (
      <a 
        href={href} 
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="text-brand-500 hover:text-brand-600 underline font-semibold transition-colors"
      >
        {children}
      </a>
    ),
    img: ({ src, alt }) => (
      <div className="my-6 flex flex-col items-center">
        <img src={src} alt={alt} className="rounded-lg max-w-full h-auto border border-surface-border shadow-md" />
        {alt && <span className="text-xs text-text/40 mt-2 italic">{alt}</span>}
      </div>
    )
  };

  return (
    <div className="prose dark:prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownRenderer;
