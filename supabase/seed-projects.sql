-- ===========================================================================
-- Seed: the 5 projects from the fallback data.ts, with EN/HE/AR descriptions
-- pulled from the translation files.
--
-- Idempotent via `on conflict (slug) do update` — safe to re-run and never
-- deletes rows. Rows in the projects table with slugs NOT listed here are
-- left completely untouched.
-- ===========================================================================

insert into public.projects
  (slug, title, category, description, image_url, tech, link, github, screenshots, sort_order)
values
  (
    'souvlaki',
    'Authentic Greek Restaurant',
    'Web',
    jsonb_build_object(
      'en', 'Authentic Greek restaurant site with menu, gallery, and online ordering — built on Next.js.',
      'he', 'אתר למסעדה יוונית אותנטית עם תפריט, גלריה והזמנה אונליין — מבוסס Next.js.',
      'ar', 'موقع لمطعم يوناني أصيل يضم القائمة، معرض الصور، والطلب عبر الإنترنت — مبني بـ Next.js.'
    ),
    '/assets/souvlaki.webp',
    array['Next.js','Tailwind CSS','Vercel'],
    'https://souvlaki-kfaryasif.vercel.app/',
    'https://github.com/ward3107/Souvlaki',
    array[]::text[],
    10
  ),
  (
    'seatai',
    'SeatAi',
    'AI',
    jsonb_build_object(
      'en', 'AI-powered classroom seating optimizer that balances academic levels, behavior, and accessibility needs.',
      'he', 'מערכת אופטימיזציה מבוססת AI לסידורי ישיבה בכיתות, המאזנת רמות אקדמיות, התנהגות ונגישות.',
      'ar', 'نظام مدعوم بالذكاء الاصطناعي لتحسين ترتيب جلوس الطلاب في الفصول، يوازن بين المستوى الأكاديمي والسلوك واحتياجات إمكانية الوصول.'
    ),
    '/assets/seatai.webp',
    array['React','Three.js','Stripe'],
    'https://seatai1-web.vercel.app/',
    'https://github.com/ward3107/seatai1',
    array[]::text[],
    11
  ),
  (
    'law-office',
    'Law Office Template',
    'Web',
    jsonb_build_object(
      'en', 'Professional law office template with appointment booking and service showcase.',
      'he', 'תבנית מקצועית למשרד עורכי דין עם הזמנת פגישות והצגת שירותים.',
      'ar', 'قالب احترافي لمكتب محاماة يشمل حجز المواعيد وعرض الخدمات.'
    ),
    '/assets/law-office.webp',
    array['React','Vite','Tailwind CSS'],
    'https://lawofice.netlify.app/',
    null,
    array[]::text[],
    12
  ),
  (
    'shokha',
    'Shokha Barbershop',
    'Web',
    jsonb_build_object(
      'en', 'Modern barbershop booking app with appointment scheduling and service management.',
      'he', 'אפליקציה מודרנית להזמנת תורים במספרה עם ניהול שירותים ולוח זמנים.',
      'ar', 'تطبيق حديث لحجز مواعيد صالون الحلاقة مع إدارة الخدمات وجدولة المواعيد.'
    ),
    '/assets/barbershop.webp',
    array['React','Node.js','MongoDB'],
    'https://shokha1.netlify.app/',
    null,
    array[]::text[],
    13
  ),
  (
    'vocaband',
    'Vocaband',
    'Web',
    jsonb_build_object(
      'en', 'Gamified vocabulary learning app for EFL students.',
      'he', 'אפליקציית משחוק ללימוד אוצר מילים לתלמידי אנגלית כשפה זרה.',
      'ar', 'تطبيق تعليم مفردات مُلعّب لطلاب اللغة الإنجليزية كلغة أجنبية.'
    ),
    '/assets/vocaband.webp',
    array['TypeScript','React','Vite'],
    'https://www.vocaband.com/',
    'https://github.com/ward3107/Vocaband',
    array[]::text[],
    14
  )
on conflict (slug) do update set
  title       = excluded.title,
  category    = excluded.category,
  description = excluded.description,
  image_url   = excluded.image_url,
  tech        = excluded.tech,
  link        = excluded.link,
  github      = excluded.github,
  screenshots = excluded.screenshots,
  sort_order  = excluded.sort_order;
