/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEB3FORMS_KEY?: string;
  readonly VITE_WHATSAPP_NUMBER?: string;
  readonly VITE_CONTACT_EMAIL?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_GA_ID?: string;
  // NOTE: never declare an AI/billing API key as VITE_* — every VITE_ var is
  // inlined into the public JS bundle. Call such APIs from a server-side
  // function (Vercel/Supabase Edge) with a non-VITE_ secret instead.
  readonly VITE_NEWSLETTER_ENDPOINT?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
