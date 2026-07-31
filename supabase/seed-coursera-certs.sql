-- ===========================================================================
-- Seed: three new Coursera certifications (Meta Frontend, Scrimba Cloudflare,
-- Scrimba AI Engineering).
--
-- Runs against the certifications table in Supabase. Idempotent via
-- `on conflict (slug) do update` — safe to re-run to update titles/dates.
--
-- Prerequisite: `public.is_owner()` must return true for the SQL editor
-- session (which runs as the postgres role and bypasses RLS anyway, so this
-- is always fine). The certification PDFs are committed at
-- /public/certifications/<slug>.pdf and served by Vercel at the same path.
-- ===========================================================================

insert into public.certifications
  (slug, title, issuer, issue_date, expiry_date, credential_url, image_url, sort_order)
values
  (
    'meta-intro-frontend',
    jsonb_build_object('en', 'Introduction to Front-End Development'),
    'Meta (via Coursera)',
    '2026-07-26',
    null,
    'https://coursera.org/verify/1G6ZB303XNAY',
    '/certifications/meta-intro-frontend.pdf',
    100
  ),
  (
    'scrimba-deploy-ai-cloudflare',
    jsonb_build_object('en', 'Deploy AI Apps with Cloudflare'),
    'Scrimba (via Coursera)',
    '2026-07-31',
    null,
    'https://coursera.org/verify/XT00EO361JTM',
    '/certifications/scrimba-deploy-ai-cloudflare.pdf',
    101
  ),
  (
    'scrimba-intro-ai-engineering',
    jsonb_build_object('en', 'Intro to AI Engineering'),
    'Scrimba (via Coursera)',
    '2026-07-31',
    null,
    'https://coursera.org/verify/FQY4PSQZ99XN',
    '/certifications/scrimba-intro-ai-engineering.pdf',
    102
  )
on conflict (slug) do update set
  title          = excluded.title,
  issuer         = excluded.issuer,
  issue_date     = excluded.issue_date,
  expiry_date    = excluded.expiry_date,
  credential_url = excluded.credential_url,
  image_url      = excluded.image_url;
