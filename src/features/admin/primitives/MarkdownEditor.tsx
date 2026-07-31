import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Minimal markdown editor: textarea with Write/Preview tabs. Preview uses
 * react-markdown + remark-gfm (tables, task lists, autolinks). No toolbar —
 * matches the calm Notion/Linear aesthetic and avoids ~45 kB of a WYSIWYG.
 */
const MarkdownEditor: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  minHeight?: string;
}> = ({ value, onChange, placeholder, ariaLabel, minHeight = 'min-h-[160px]' }) => {
  const [tab, setTab] = useState<'write' | 'preview'>('write');

  return (
    <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus-within:ring-2 focus-within:ring-brand-purple">
      <div className="flex items-center gap-4 px-3 py-1.5 border-b border-zinc-100 dark:border-zinc-800 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setTab('write')}
          className={`py-1 border-b-2 -mb-[7px] transition-colors ${
            tab === 'write'
              ? 'border-brand-purple text-zinc-900 dark:text-zinc-100'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setTab('preview')}
          className={`py-1 border-b-2 -mb-[7px] transition-colors ${
            tab === 'preview'
              ? 'border-brand-purple text-zinc-900 dark:text-zinc-100'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Preview
        </button>
      </div>
      {tab === 'write' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel ?? placeholder ?? 'Markdown content'}
          className={`w-full ${minHeight} px-3 py-2 bg-transparent outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 resize-y font-mono`}
        />
      ) : (
        <div className={`${minHeight} px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 prose prose-sm dark:prose-invert max-w-none`}>
          {value.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-zinc-400 italic">Nothing to preview.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MarkdownEditor;
