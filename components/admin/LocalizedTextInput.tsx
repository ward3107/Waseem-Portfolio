import React from 'react';
import type { LocalizedText } from '../../types';

const LocalizedTextInput: React.FC<{
  label: string;
  value: LocalizedText;
  multiline?: boolean;
  onChange: (v: LocalizedText) => void;
}> = ({ label, value, multiline, onChange }) => {
  const set = (lang: keyof LocalizedText, v: string) => onChange({ ...value, [lang]: v });
  const langs: { key: keyof LocalizedText; hint: string; required?: boolean }[] = [
    { key: 'en', hint: 'English', required: true },
    { key: 'he', hint: 'עברית (optional)' },
    { key: 'ar', hint: 'العربية (optional)' },
  ];
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold">{label}</legend>
      {langs.map((l) => (
        multiline ? (
          <textarea
            key={l.key}
            required={l.required}
            placeholder={l.hint}
            value={value[l.key] ?? ''}
            onChange={(e) => set(l.key, e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-gray-800 outline-none"
          />
        ) : (
          <input
            key={l.key}
            required={l.required}
            placeholder={l.hint}
            value={value[l.key] ?? ''}
            onChange={(e) => set(l.key, e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-gray-800 outline-none"
          />
        )
      ))}
    </fieldset>
  );
};

export default LocalizedTextInput;
