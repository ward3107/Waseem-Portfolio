-- ===========================================================================
-- Seed: full certifications list — the 4 Google Skillshop certs + the 3 new
-- Coursera ones. Idempotent via `on conflict (slug) do update`, so running
-- this multiple times is safe and never deletes anything.
--
-- Any additional certification rows already in Supabase with slugs NOT listed
-- here are left completely untouched.
-- ===========================================================================

insert into public.certifications
  (slug, title, issuer, issue_date, expiry_date, credential_url, image_url, sort_order)
values
  -- ── Google Skillshop (existing) ──────────────────────────────────────────
  (
    'ai-performance-ads-1',
    jsonb_build_object('en', 'AI-Powered Performance Ads Certification'),
    'Google Skillshop',
    '2026-07-16',
    '2027-07-16',
    'https://www.credential.net/8fe73bad-d0b7-4a10-aef1-efca931a3386',
    null,
    10
  ),
  (
    'ai-performance-ads-2',
    jsonb_build_object('en', 'AI-Powered Performance Ads Certification'),
    'Google Skillshop',
    '2026-07-16',
    '2027-07-16',
    'https://www.credential.net/6185076b-3c05-4916-abfd-3ae205c92cdb',
    null,
    11
  ),
  (
    'google-ads-search',
    jsonb_build_object('en', 'Google Ads Search Professional Certification (2026)'),
    'Google Skillshop',
    '2026-07-16',
    '2027-07-16',
    'https://www.credential.net/327a9f94-7605-44fe-8237-f9ae705f7ec8',
    null,
    12
  ),
  (
    'ai-shopping-ads',
    jsonb_build_object('en', 'AI-Powered Shopping Ads Certification'),
    'Google Skillshop',
    '2026-07-17',
    '2027-07-17',
    'https://www.credential.net/df4ab345-1a92-4f1d-9a32-de0ba8032d5a',
    null,
    13
  ),

  -- ── Coursera (new) ───────────────────────────────────────────────────────
  (
    'meta-intro-frontend',
    jsonb_build_object('en', 'Introduction to Front-End Development'),
    'Meta (via Coursera)',
    '2026-07-26',
    null,
    'https://coursera.org/verify/1G6ZB303XNAY',
    '/certifications/meta-intro-frontend.png',
    100
  ),
  (
    'scrimba-deploy-ai-cloudflare',
    jsonb_build_object('en', 'Deploy AI Apps with Cloudflare'),
    'Scrimba (via Coursera)',
    '2026-07-31',
    null,
    'https://coursera.org/verify/XT00EO361JTM',
    '/certifications/scrimba-deploy-ai-cloudflare.png',
    101
  ),
  (
    'scrimba-intro-ai-engineering',
    jsonb_build_object('en', 'Intro to AI Engineering'),
    'Scrimba (via Coursera)',
    '2026-07-31',
    null,
    'https://coursera.org/verify/FQY4PSQZ99XN',
    '/certifications/scrimba-intro-ai-engineering.png',
    102
  )
on conflict (slug) do update set
  title          = excluded.title,
  issuer         = excluded.issuer,
  issue_date     = excluded.issue_date,
  expiry_date    = excluded.expiry_date,
  credential_url = excluded.credential_url,
  image_url      = excluded.image_url,
  sort_order     = excluded.sort_order;
