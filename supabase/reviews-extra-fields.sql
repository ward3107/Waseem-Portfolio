-- Testimonial page extra fields (Aug 2026)
-- ---------------------------------------------------------------------------
-- Adds two optional columns the public feedback form now collects:
--   role_company     — the client's title / company, shown next to the name
--                      ("מנכ״ל, חברת X") for extra credibility.
--   would_recommend  — a simple yes/no "would you recommend Waseem" signal.
--
-- `location` already exists (see schema.sql). Categories are still stored as
-- free text inside `helped_with`, now composed from one or more selected
-- categories, so no column is needed for them.
--
-- Safe to run more than once (idempotent). Run it in the Supabase SQL editor.
-- The app also degrades gracefully if these columns are missing, so there's
-- no hard ordering requirement between deploying the code and running this.

alter table public.reviews
  add column if not exists role_company text;

alter table public.reviews
  add column if not exists would_recommend boolean;

-- Keep role_company to a sane length (mirrors the form's maxLength).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'reviews_role_company_len'
  ) then
    alter table public.reviews
      add constraint reviews_role_company_len
      check (role_company is null or char_length(role_company) <= 120);
  end if;
end $$;
