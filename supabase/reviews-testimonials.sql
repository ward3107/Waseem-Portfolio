-- Testimonial submissions: extend the reviews table with a moderation
-- workflow so customers can submit testimonials from the public site
-- (/share-testimonial) and Waseem approves them from the admin dashboard
-- before they render in the Reviews section.
--
-- Run once in the Supabase SQL editor. Idempotent — safe to re-run.

-- Add `status` (moderation state) and `helped_with` (what we worked on,
-- displayed as a subtitle on the review card).
alter table public.reviews
  add column if not exists status text not null default 'approved'
    check (status in ('pending', 'approved', 'rejected'));

alter table public.reviews
  add column if not exists helped_with jsonb not null default '{}'::jsonb;

create index if not exists reviews_status_idx
  on public.reviews (status);

-- Anon submissions: allow INSERT ONLY when status='pending'. Cannot promote
-- themselves to 'approved'. Read/update/delete still gated by the existing
-- owner policies.
drop policy if exists "anon can submit pending reviews" on public.reviews;
create policy "anon can submit pending reviews"
  on public.reviews
  for insert
  to anon, authenticated
  with check (status = 'pending');

-- Public site should only ever SELECT approved rows. Existing SELECT policy
-- (if any) already covers anon reads; this narrows what anon can see so
-- pending/rejected submissions never leak.
drop policy if exists "anon reads approved reviews" on public.reviews;
create policy "anon reads approved reviews"
  on public.reviews
  for select
  to anon
  using (status = 'approved');

-- Import the two testimonials Waseem already collected via the standalone
-- Google Form. Insert only if the (author, submitted_date) hasn't already
-- been imported — safe to re-run.
insert into public.reviews (author, rating, text, helped_with, date, status, sort_order)
select 'אופק', 5,
       jsonb_build_object(
         'he', 'עזרה מהירה ומדויקת, בדיוק מה שהייתי צריך.',
         'en', 'Fast, precise help — exactly what I needed.',
         'ar', 'مساعدة سريعة ودقيقة — بالضبط ما كنت أحتاجه.'
       ),
       jsonb_build_object(
         'he', 'עזרה טכנית (אתר, קוד, אוטומציה)',
         'en', 'Technical help (site, code, automation)',
         'ar', 'مساعدة تقنية (موقع، برمجة، أتمتة)'
       ),
       '2026-07-21', 'approved', 0
where not exists (select 1 from public.reviews where author = 'אופק');

insert into public.reviews (author, rating, text, helped_with, date, status, sort_order)
select 'יאיר', 5,
       jsonb_build_object(
         'he', 'בחור נחמד ואדיב, עזר לי מבלי לדבר איתי על תשלום — קודם כל לעזור. יישר כוח.',
         'en', 'Kind and helpful — assisted me without even bringing up payment first. Great work.',
         'ar', 'شخص لطيف ومتعاون — ساعدني دون أن يتحدث حتى عن الدفع، الأولوية للمساعدة. كل الاحترام.'
       ),
       jsonb_build_object(
         'he', 'עזרה טכנית (אתר, קוד, אוטומציה)',
         'en', 'Technical help (site, code, automation)',
         'ar', 'مساعدة تقنية (موقع، برمجة، أتمتة)'
       ),
       '2026-07-22', 'approved', 1
where not exists (select 1 from public.reviews where author = 'יאיר');
