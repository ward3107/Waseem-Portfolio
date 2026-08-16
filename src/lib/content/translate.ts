import { db } from '@/lib/content/db';
import type { Language, LocalizedText } from '@/types';

// Callers guess source language from which UI tab or site locale is active,
// but reviewers often paste Hebrew text into the EN tab (or vice versa).
// Detect script directly so we send Gemini the truth about what it's reading
// — otherwise Gemini gets "translate English: [Hebrew text]" and either
// mistranslates or passes the wrong-language text through as-is.
// Ranges: Hebrew U+0590-U+05FF, Arabic U+0600-U+06FF plus presentation forms
// U+FB50-U+FDFF and U+FE70-U+FEFE (stop short of U+FEFF, which is the
// zero-width no-break space and ESLint's no-irregular-whitespace flags it).
const HEBREW_RE = /[֐-׿]/;
const ARABIC_RE = /[؀-ۿﭐ-﷿ﹰ-﻾]/;

export function detectLanguage(text: string): Language {
  if (HEBREW_RE.test(text)) return 'he';
  if (ARABIC_RE.test(text)) return 'ar';
  return 'en';
}

// Client wrapper around the `translate-review` Edge Function (see
// supabase/functions/translate-review). Sends the source text + language,
// receives all three localized variants. Never throws — a failure of any
// kind falls back to duplicating the original text into every language,
// so a review submission is never blocked by a translation problem.
export async function translateToAll(text: string, source: Language): Promise<LocalizedText> {
  const supabase = await db();
  const trimmed = text.trim();
  const fallback: LocalizedText = { en: trimmed, he: trimmed, ar: trimmed };
  if (!trimmed) return fallback;

  // Detected script wins over the caller's guess — the text itself is the
  // ground truth. If the reviewer typed Hebrew into the EN tab, we still
  // want Gemini to know it's Hebrew and translate correctly.
  const detected = detectLanguage(trimmed);
  const effectiveSource: Language = detected !== source ? detected : source;

  try {
    const { data, error } = await supabase.functions.invoke<LocalizedText>('translate-review', {
      body: { text: trimmed, source: effectiveSource },
    });
    if (error || !data) {
      console.warn('[translate] falling back — invoke failed:', error);
      return fallback;
    }
    return {
      en: typeof data.en === 'string' && data.en ? data.en : trimmed,
      he: typeof data.he === 'string' && data.he ? data.he : trimmed,
      ar: typeof data.ar === 'string' && data.ar ? data.ar : trimmed,
    };
  } catch (err) {
    console.warn('[translate] falling back — threw:', err);
    return fallback;
  }
}
