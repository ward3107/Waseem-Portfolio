import { supabase } from '@/lib/supabaseClient';
import type { Language, LocalizedText } from '@/types';

// Client wrapper around the `translate-review` Edge Function (see
// supabase/functions/translate-review). Sends the source text + language,
// receives all three localized variants. Never throws — a failure of any
// kind falls back to duplicating the original text into every language,
// so a review submission is never blocked by a translation problem.
export async function translateToAll(
  text: string,
  source: Language,
): Promise<LocalizedText> {
  const trimmed = text.trim();
  const fallback: LocalizedText = { en: trimmed, he: trimmed, ar: trimmed };
  if (!trimmed) return fallback;

  try {
    const { data, error } = await supabase.functions.invoke<LocalizedText>(
      'translate-review',
      { body: { text: trimmed, source } },
    );
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
