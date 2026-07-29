import React, { useState } from 'react';
import { X } from 'lucide-react';

/**
 * Chip-based multi-value input (e.g. tech stack).
 * - Type + Enter or Comma commits a chip.
 * - Backspace on an empty input removes the last chip.
 * - Click × on a chip removes it.
 */
const ChipInput: React.FC<{
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  ariaLabel?: string;
}> = ({ value, onChange, placeholder = 'Add and press Enter', ariaLabel }) => {
  const [draft, setDraft] = useState('');

  const commit = () => {
    const v = draft.trim();
    if (!v) return;
    if (value.includes(v)) {
      setDraft('');
      return;
    }
    onChange([...value, v]);
    setDraft('');
  };

  const removeAt = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 py-1.5 focus-within:ring-2 focus-within:ring-brand-purple">
      {value.map((chip, i) => (
        <span
          key={`${chip}-${i}`}
          className="inline-flex items-center gap-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-2 py-0.5 text-xs font-medium"
        >
          {chip}
          <button
            type="button"
            onClick={() => removeAt(i)}
            aria-label={`Remove ${chip}`}
            className="text-zinc-400 hover:text-red-500"
          >
            <X size={12} aria-hidden="true" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            commit();
          } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
            e.preventDefault();
            removeAt(value.length - 1);
          }
        }}
        onBlur={commit}
        placeholder={value.length === 0 ? placeholder : ''}
        aria-label={ariaLabel ?? placeholder}
        className="flex-1 min-w-[8ch] bg-transparent outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
      />
    </div>
  );
};

export default ChipInput;
