import type { Language, LocalizedText } from '@/types';

/** Return text in `lang`, falling back to English when empty/missing. */
export function localized(text: LocalizedText, lang: Language): string {
  const value = text[lang];
  if (value && value.trim().length > 0) return value;
  return text.en ?? '';
}
