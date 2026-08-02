// Supabase Edge Function: translate-review
//
// Translates a short piece of text (a public testimonial) into English,
// Hebrew, and Arabic using Google Gemini. The client (share-testimonial
// form) invokes this before writing the review to the DB, so the row lands
// with all three languages populated instead of the same text duplicated
// three times.
//
// The API key never leaves the server: set it once with
//   supabase secrets set GEMINI_API_KEY=<your-key>
// The function is anon-invokable (public form has no auth), so treat this
// as an open translation endpoint — the client fallback duplicates the
// original text if the call fails, so a rate-limit or key rotation never
// blocks a submission.

// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Lang = 'en' | 'he' | 'ar';
const LANG_LABEL: Record<Lang, string> = {
  en: 'English',
  he: 'Hebrew',
  ar: 'Arabic',
};

const GEMINI_MODEL = 'gemini-2.5-flash';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405);
  }

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    return jsonResponse({ error: 'missing_gemini_key' }, 500);
  }

  let text: string;
  let source: Lang;
  try {
    const body = await req.json();
    text = String(body?.text ?? '').trim();
    source = (body?.source as Lang) ?? 'en';
    if (!text) return jsonResponse({ error: 'empty_text' }, 400);
    if (!LANG_LABEL[source]) return jsonResponse({ error: 'bad_source' }, 400);
    // Guard on length — reviews cap at 600 chars client-side; a bigger
    // payload means someone bypassed the UI, no reason to spend tokens on it.
    if (text.length > 2000) return jsonResponse({ error: 'too_long' }, 400);
  } catch {
    return jsonResponse({ error: 'bad_json' }, 400);
  }

  const prompt = [
    `Translate the following ${LANG_LABEL[source]} text into English (en),`,
    `Hebrew (he), and Arabic (ar). Preserve tone, punctuation, and any`,
    `explicit line breaks. Do NOT add commentary, quotes, or a preamble.`,
    `If the source language matches one of the targets, return the ORIGINAL`,
    `text verbatim for that key.`,
    ``,
    `Return JSON with exactly these keys: {"en": "...", "he": "...", "ar": "..."}.`,
    ``,
    `Text:`,
    text,
  ].join('\n');

  let gemini: Response;
  try {
    gemini = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
      },
    );
  } catch (err) {
    console.error('[translate-review] gemini fetch failed:', err);
    return jsonResponse({ error: 'upstream_unreachable' }, 502);
  }

  if (!gemini.ok) {
    const body = await gemini.text().catch(() => '');
    console.error('[translate-review] gemini error', gemini.status, body);
    return jsonResponse({ error: 'upstream_error', status: gemini.status }, 502);
  }

  let raw: any;
  try {
    raw = await gemini.json();
  } catch {
    return jsonResponse({ error: 'upstream_bad_json' }, 502);
  }

  // Gemini shape: candidates[0].content.parts[0].text is a JSON string
  // because we asked for responseMimeType: application/json.
  const jsonText: string | undefined =
    raw?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!jsonText) {
    return jsonResponse({ error: 'empty_translation' }, 502);
  }

  let parsed: Partial<Record<Lang, unknown>>;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return jsonResponse({ error: 'translation_not_json' }, 502);
  }

  const en = typeof parsed.en === 'string' ? parsed.en : text;
  const he = typeof parsed.he === 'string' ? parsed.he : text;
  const ar = typeof parsed.ar === 'string' ? parsed.ar : text;

  return jsonResponse({ en, he, ar });
});
