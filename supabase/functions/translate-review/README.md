# translate-review

Supabase Edge Function that translates a short testimonial into English,
Hebrew, and Arabic using Google Gemini (`gemini-2.5-flash`). Called from
the public `/share-testimonial` form so incoming reviews land with all three
language variants populated.

## Deploy

Requires the [Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
# 1. Store the Gemini API key as a secret (never commit it).
supabase secrets set GEMINI_API_KEY=<your-key>

# 2. Deploy the function. --no-verify-jwt keeps it open to anon callers
#    (the share-testimonial form has no auth).
supabase functions deploy translate-review --no-verify-jwt
```

Get a Gemini key from https://aistudio.google.com/apikey — the free tier is
enough for a portfolio site.

## Contract

```http
POST /functions/v1/translate-review
Content-Type: application/json

{ "text": "the review body", "source": "en" | "he" | "ar" }
```

Response `200`:

```json
{ "en": "...", "he": "...", "ar": "..." }
```

Non-2xx responses return `{ "error": "<slug>" }`. The client-side wrapper
in `src/lib/content/translate.ts` treats any failure as a graceful fallback
— the original text is duplicated to all three keys so a review is never
blocked by an API issue.
