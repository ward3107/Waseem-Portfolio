// Generates static, SEO-optimized local landing pages (one folder per city)
// into /public/<slug>/index.html, plus regenerates /public/sitemap.xml.
//
// These are standalone HTML pages (no React) so Google crawls real, unique
// content at clean URLs like /web-design-kfar-yasif/. Each page has its own
// title/description/canonical/OG tags and LocalBusiness + BreadcrumbList +
// FAQPage JSON-LD scoped to that city.
//
// Run: node .dev-scripts/generate-landing-pages.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const publicDir = resolve(root, 'public');

const SITE = 'https://wwas.netlify.app';
const WHATSAPP = '972534260632';
const LASTMOD = '2026-07-07';

// ---------------------------------------------------------------------------
// Per-city data. Each city gets genuinely unique copy (intro, angle, FAQ) so
// the pages are not thin duplicates of each other.
// ---------------------------------------------------------------------------
const cities = [
  {
    slug: 'web-design-kfar-yasif',
    he: 'כפר יאסיף',
    en: 'Kfar Yasif',
    geo: { lat: 32.9556, lng: 35.1706 },
    home: true,
    hero: 'בניית אתרים בכפר יאסיף',
    lead:
      'אני וסים — מפתח ובונה אתרים מכפר יאסיף. אני חי ועובד כאן, מכיר מקרוב את העסקים המקומיים ואת מה שעובד בשטח. אני בונה אתרים מהירים, ברורים וממירים — בעברית, בערבית ובאנגלית — שמביאים לקוחות אמיתיים ולא רק ביקורים.',
    angle: [
      'בן המקום — פגישות פנים אל פנים, בלי מרחק ובלי מתווכים.',
      'אתר דו-לשוני (עברית + ערבית) שמדבר לכל הקהל בכפר ובסביבה.',
      'תמיכה שוטפת אחרי ההשקה — אני כאן, לא חברה רחוקה.',
    ],
    faq: [
      {
        q: 'כמה עולה אתר תדמית בכפר יאסיף?',
        a: 'אתר תדמית מקצועי מתחיל בטווח נגיש לעסק קטן. המחיר תלוי במספר העמודים ובפיצ׳רים (טופס, גלריה, רב-לשוני). נשלח הצעת מחיר ברורה מראש, בלי הפתעות.',
      },
      {
        q: 'האם האתר יהיה בעברית ובערבית?',
        a: 'כן. אני בונה אתרים דו-לשוניים ורב-לשוניים במקור, כולל תמיכה מלאה ב-RTL, כך שהאתר נראה מושלם גם בעברית וגם בערבית.',
      },
      {
        q: 'כמה זמן לוקח לבנות אתר?',
        a: 'אתר תדמית סטנדרטי מוכן תוך שבוע-שבועיים. פרויקטים מורכבים יותר (חנות, מערכת) לוקחים בין חודש לשלושה.',
      },
    ],
  },
  {
    slug: 'web-design-akko',
    he: 'עכו',
    en: 'Acre',
    geo: { lat: 32.9281, lng: 35.0817 },
    hero: 'בניית אתרים בעכו',
    lead:
      'עכו היא עיר של תיירות, מסעדות ועסקים קטנים — בעיר העתיקה ובעיר החדשה. לעסק בעכו אתר מהיר וברור הוא ההבדל בין תייר שמזמין שולחן לבין תייר שממשיך הלאה. אני בונה אתרים דו-לשוניים עם הזמנות, תפריטים וניווט — שממירים מבקרים ללקוחות.',
    angle: [
      'מותאם לעסקי תיירות ואירוח — תפריטים, הזמנות ו-Google Maps מוטמע.',
      'טעינה מהירה גם על סלולר, כי רוב התיירים מחפשים מהנייד.',
      'אופטימיזציה מקומית ל-״מסעדה בעכו״, ״אטרקציות בעכו״ ודומיהם.',
    ],
    faq: [
      {
        q: 'יש לי מסעדה בעכו — אתם בונים אתר עם תפריט והזמנות?',
        a: 'בהחלט. אני בונה אתרי מסעדות עם תפריט דיגיטלי, כפתור הזמנת שולחן/וואטסאפ, גלריה ומפה מוטמעת — הכל מהיר ומותאם לנייד.',
      },
      {
        q: 'האם האתר יופיע בגוגל כשמחפשים עסק בעכו?',
        a: 'אני בונה כל אתר עם SEO מקומי מובנה — כותרות, תיאורים ו-Schema של עסק מקומי — כדי לתת לך את הסיכוי הטוב ביותר להופיע בחיפושים מקומיים בעכו.',
      },
      {
        q: 'אני צריך אתר בעברית ובערבית — אפשר?',
        a: 'כן, זו ההתמחות שלי. אתרים דו-לשוניים עברית-ערבית עם מעבר שפה חלק ותצוגה מושלמת בשני הכיוונים.',
      },
    ],
  },
  {
    slug: 'web-design-karmiel',
    he: 'כרמיאל',
    en: 'Karmiel',
    geo: { lat: 32.9186, lng: 35.2952 },
    hero: 'בניית אתרים בכרמיאל',
    lead:
      'כרמיאל היא מרכז מסחרי, תעשייתי ורפואי לכל הגליל. לעסקים, מרפאות, נותני שירות ובעלי מקצוע בכרמיאל, אתר מקצועי הוא כרטיס הביקור הראשון שהלקוח רואה. אני בונה אתרים אמינים ומהירים עם טופס לידים חכם — שהופכים גולשים לפניות.',
    angle: [
      'מותאם לנותני שירות, מרפאות ובעלי מקצוע — טופס פנייה שמייצר לידים.',
      'עיצוב אמין ונקי שמשדר מקצועיות מהרגע הראשון.',
      'אינטגרציה עם וואטסאפ ו-Google לניהול פניות פשוט.',
    ],
    faq: [
      {
        q: 'יש לי קליניקה בכרמיאל — אני צריך מערכת זימון תורים?',
        a: 'אפשר. אני יכול לשלב טופס זימון תורים, קישור לוואטסאפ, או מערכת זימונים מלאה — לפי הצורך והתקציב שלך.',
      },
      {
        q: 'אתם מטפלים גם בדומיין ובאחסון?',
        a: 'כן. אני מטפל בכל התהליך מקצה לקצה — רכישת דומיין, אחסון, תעודת SSL והעלאה לאוויר. אתה לא צריך להתעסק עם הטכני.',
      },
      {
        q: 'האתר יהיה מהיר גם עם הרבה תמונות?',
        a: 'בהחלט. אני בונה עם טכנולוגיות מודרניות ואופטימיזציית תמונות, כך שהאתר נטען מהר וקל — וזה גם עוזר לדירוג בגוגל.',
      },
    ],
  },
  {
    slug: 'web-design-nahariya',
    he: 'נהריה',
    en: 'Nahariya',
    geo: { lat: 33.0059, lng: 35.0942 },
    hero: 'בניית אתרים בנהריה',
    lead:
      'נהריה, עיר החוף של הצפון, מלאה בעסקי תיירות, מסעדות, בתי הארחה ומטפלים. אתר מזמין ומהיר עוזר לעסק בנהריה לתפוס את הלקוח בדיוק ברגע שהוא מחפש. אני בונה אתרים יפים, מותאמים לנייד וממירים — שמביאים הזמנות ופניות.',
    angle: [
      'עיצוב חוֹפי ומזמין שמתאים לעסקי תיירות ואירוח.',
      'מותאם לנייד במיוחד — הלקוחות מחפשים בזמן אמת מהטלפון.',
      'טפסים והזמנות מהירים כדי לא לפספס אף פנייה.',
    ],
    faq: [
      {
        q: 'יש לי צימר/בית הארחה בנהריה — אתם בונים אתר עם הזמנות?',
        a: 'כן. אני בונה אתרי אירוח עם גלריה, מחירים, זמינות וכפתור הזמנה/וואטסאפ — הכל מהיר ומותאם לנייד כדי לתפוס את הלקוח מיד.',
      },
      {
        q: 'כמה עולה אתר לעסק קטן בנהריה?',
        a: 'המחיר תלוי בהיקף, אבל אתר תדמית לעסק קטן מתחיל בטווח נגיש. תמיד תקבל הצעת מחיר שקופה מראש.',
      },
      {
        q: 'תוכל לעדכן את האתר עבורי אחרי ההשקה?',
        a: 'כן. אני מציע חבילות תחזוקה ועדכונים שוטפים, כך שהאתר תמיד מעודכן, מאובטח ומהיר.',
      },
    ],
  },
  {
    slug: 'web-design-haifa',
    he: 'חיפה',
    en: 'Haifa',
    geo: { lat: 32.794, lng: 34.9896 },
    hero: 'בניית אתרים בחיפה',
    lead:
      'חיפה היא עיר הטכנולוגיה של הצפון — סטארטאפים, עסקים גדולים, סטודנטים ונותני שירות. בשוק תחרותי כזה, אתר מהיר, מודרני וממיר הוא יתרון אמיתי. אני בונה אתרים ואפליקציות ווב ב-React ו-Next.js, עם SEO ואוטומציית AI — ברמה שמתאימה גם לעסק וגם לסטארטאפ.',
    angle: [
      'טכנולוגיה מתקדמת (React, Next.js) לעסקים וסטארטאפים תובעניים.',
      'אינטגרציית AI ואוטומציה — צ׳אטבוטים ותהליכים חכמים.',
      'ביצועים ו-SEO ברמה גבוהה כדי לבלוט בשוק החיפאי התחרותי.',
    ],
    faq: [
      {
        q: 'אני סטארטאפ בחיפה — אתם בונים גם אפליקציות ווב מלאות?',
        a: 'כן. מעבר לאתרי תדמית אני בונה אפליקציות ווב מלאות (Full-Stack) ב-React, Next.js ו-Node.js — כולל מסדי נתונים, ממשקי ניהול ואינטגרציות.',
      },
      {
        q: 'אתם משלבים AI ואוטומציה באתר?',
        a: 'בהחלט. אני משלב צ׳אטבוטים חכמים, אוטומציית תהליכים ועיבוד נתונים מבוסס AI — כדי לחסוך לך זמן ולשפר את חוויית הלקוח.',
      },
      {
        q: 'האתר יהיה מותאם ל-SEO ולחיפוש ב-AI?',
        a: 'כן. אני בונה עם SEO, AEO (אופטימיזציה למנועי תשובות) ו-GEO בראש — כך שהאתר מוכן גם לגוגל וגם לחיפוש דרך ChatGPT ומנועי AI.',
      },
    ],
  },
];

const waLink = (city) =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
    `היי וסים, אני מעוניין באתר לעסק שלי ב${city.he} 🙂`,
  )}`;

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Sibling links for internal linking / crawl discovery.
const siblingLinks = (current) =>
  cities
    .filter((c) => c.slug !== current.slug)
    .map(
      (c) =>
        `<a href="${SITE}/${c.slug}/">בניית אתרים ב${esc(c.he)}</a>`,
    )
    .join('\n          ');

const faqJsonLd = (city) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: city.faq.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

const businessJsonLd = (city) => ({
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${SITE}/${city.slug}/#localbusiness`,
  name: `וסים — בניית אתרים ב${city.he}`,
  image: `${SITE}/og-image.png`,
  url: `${SITE}/${city.slug}/`,
  telephone: `+${WHATSAPP}`,
  priceRange: '$$',
  description: city.lead,
  areaServed: { '@type': 'City', name: city.en },
  address: {
    '@type': 'PostalAddress',
    addressLocality: city.en,
    addressRegion: 'Northern District',
    addressCountry: 'IL',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: city.geo.lat,
    longitude: city.geo.lng,
  },
  knowsLanguage: ['he', 'ar', 'en'],
  sameAs: [
    'https://github.com/ward3107',
    'https://linkedin.com/in/waseem-profile',
  ],
});

const breadcrumbJsonLd = (city) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'דף הבית', item: `${SITE}/` },
    {
      '@type': 'ListItem',
      position: 2,
      name: `בניית אתרים ב${city.he}`,
      item: `${SITE}/${city.slug}/`,
    },
  ],
});

const page = (city) => {
  const title = `בניית אתרים ב${city.he} | וסים — מפתח ובונה אתרים בצפון`;
  const desc = city.lead.slice(0, 155);
  const url = `${SITE}/${city.slug}/`;
  const wa = waLink(city);

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="title" content="${esc(title)}" />
  <meta name="description" content="${esc(desc)}" />
  <meta name="keywords" content="בניית אתרים ${esc(city.he)}, מפתח אתרים ${esc(city.he)}, בונה אתרים ${esc(city.he)}, עיצוב אתרים ${esc(city.he)}, אתר תדמית, אתר לעסק, website designer ${esc(city.en)}" />
  <meta name="author" content="Waseem" />
  <meta name="robots" content="index, follow" />
  <meta name="theme-color" content="#483AA0" />
  <link rel="canonical" href="${url}" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

  <meta property="og:type" content="website" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:image" content="${SITE}/og-image.png" />
  <meta property="og:locale" content="he_IL" />
  <meta property="og:site_name" content="Waseem Portfolio" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(desc)}" />
  <meta name="twitter:image" content="${SITE}/og-image.png" />

  <script type="application/ld+json">
${JSON.stringify(businessJsonLd(city), null, 2)}
  </script>
  <script type="application/ld+json">
${JSON.stringify(breadcrumbJsonLd(city), null, 2)}
  </script>
  <script type="application/ld+json">
${JSON.stringify(faqJsonLd(city), null, 2)}
  </script>

  <style>
    :root {
      --purple: #483AA0; --purple-2: #6C5CE7; --cyan: #00B8D4; --gold: #D4AF37;
      --bg: #f8fafc; --card: #ffffff; --text: #0f172a; --muted: #475569; --border: #e2e8f0;
    }
    @media (prefers-color-scheme: dark) {
      :root { --bg: #0a0820; --card: #14122e; --text: #f1f5f9; --muted: #94a3b8; --border: #2a2650; }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Rubik', 'Segoe UI', system-ui, -apple-system, Arial, sans-serif;
      background: var(--bg); color: var(--text); line-height: 1.7;
      -webkit-font-smoothing: antialiased;
    }
    a { color: inherit; text-decoration: none; }
    .wrap { max-width: 1080px; margin: 0 auto; padding: 0 20px; }
    .nav { display: flex; align-items: center; justify-content: space-between; padding: 18px 0; }
    .brand { font-weight: 800; font-size: 20px; letter-spacing: -0.5px; }
    .brand span { color: var(--purple-2); }
    .nav a.back { font-size: 14px; color: var(--muted); }
    .hero { padding: 56px 0 40px; text-align: center; }
    .badge {
      display: inline-block; font-size: 13px; font-weight: 700; color: var(--purple-2);
      background: color-mix(in srgb, var(--purple) 12%, transparent);
      border: 1px solid color-mix(in srgb, var(--purple) 30%, transparent);
      padding: 6px 14px; border-radius: 999px; margin-bottom: 20px;
    }
    h1 {
      font-size: clamp(30px, 6vw, 52px); font-weight: 800; line-height: 1.15;
      letter-spacing: -1px; margin-bottom: 18px;
    }
    h1 .grad {
      background: linear-gradient(90deg, var(--purple-2), var(--cyan));
      -webkit-background-clip: text; background-clip: text; color: transparent;
    }
    .lead { font-size: clamp(16px, 2.4vw, 19px); color: var(--muted); max-width: 720px; margin: 0 auto 30px; }
    .cta-row { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
    .btn {
      display: inline-flex; align-items: center; gap: 8px; font-weight: 700; font-size: 16px;
      padding: 14px 26px; border-radius: 14px; transition: transform .2s, box-shadow .2s;
    }
    .btn-primary {
      background: linear-gradient(90deg, var(--purple), var(--purple-2)); color: #fff;
      box-shadow: 0 10px 30px color-mix(in srgb, var(--purple) 40%, transparent);
    }
    .btn-primary:hover { transform: translateY(-2px); }
    .btn-ghost { background: var(--card); color: var(--text); border: 1.5px solid var(--border); }
    .btn-ghost:hover { border-color: var(--purple-2); }
    section { padding: 40px 0; }
    h2 { font-size: clamp(24px, 4vw, 34px); font-weight: 800; margin-bottom: 24px; letter-spacing: -0.5px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 18px; }
    .card {
      background: var(--card); border: 1px solid var(--border); border-radius: 18px; padding: 24px;
      transition: transform .2s, border-color .2s;
    }
    .card:hover { transform: translateY(-4px); border-color: color-mix(in srgb, var(--purple) 40%, transparent); }
    .card .ico { font-size: 26px; margin-bottom: 12px; }
    .card h3 { font-size: 18px; margin-bottom: 8px; }
    .card p { color: var(--muted); font-size: 15px; }
    ul.checks { list-style: none; display: grid; gap: 14px; }
    ul.checks li { display: flex; gap: 12px; align-items: flex-start; font-size: 16px; }
    ul.checks li::before { content: '✓'; color: #fff; background: var(--purple-2); border-radius: 50%; width: 24px; height: 24px; min-width: 24px; display: inline-flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; }
    .faq details {
      background: var(--card); border: 1px solid var(--border); border-radius: 14px;
      padding: 4px 20px; margin-bottom: 12px;
    }
    .faq summary { cursor: pointer; font-weight: 700; font-size: 17px; padding: 16px 0; list-style: none; display: flex; justify-content: space-between; align-items: center; }
    .faq summary::-webkit-details-marker { display: none; }
    .faq summary::after { content: '+'; color: var(--purple-2); font-size: 24px; font-weight: 700; }
    .faq details[open] summary::after { content: '−'; }
    .faq details p { color: var(--muted); padding: 0 0 18px; }
    .cta-band {
      background: linear-gradient(120deg, var(--purple), var(--purple-2)); color: #fff;
      border-radius: 24px; padding: 44px 28px; text-align: center; margin: 20px 0;
    }
    .cta-band h2 { color: #fff; }
    .cta-band p { opacity: .9; margin-bottom: 24px; max-width: 560px; margin-inline: auto; }
    .cta-band .btn-primary { background: #fff; color: var(--purple); box-shadow: 0 10px 30px rgba(0,0,0,.2); }
    footer { border-top: 1px solid var(--border); padding: 34px 0; margin-top: 20px; font-size: 14px; color: var(--muted); }
    footer .areas { display: flex; flex-wrap: wrap; gap: 10px 18px; margin: 14px 0 20px; }
    footer .areas a:hover { color: var(--purple-2); }
    footer .fine { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
  </style>
</head>
<body>
  <header class="wrap">
    <nav class="nav">
      <a class="brand" href="${SITE}/">Waseem<span>.</span></a>
      <a class="back" href="${SITE}/">← לאתר הראשי</a>
    </nav>
  </header>

  <main>
    <section class="hero wrap">
      <span class="badge">מפתח ובונה אתרים · שירות ב${esc(city.he)} והצפון</span>
      <h1>${esc(city.hero.replace(city.he, ''))}<span class="grad">${esc(city.he)}</span></h1>
      <p class="lead">${esc(city.lead)}</p>
      <div class="cta-row">
        <a class="btn btn-primary" href="${wa}" target="_blank" rel="noopener">💬 דברו איתי בוואטסאפ</a>
        <a class="btn btn-ghost" href="${SITE}/#projects">צפו בעבודות שלי</a>
      </div>
    </section>

    <section class="wrap">
      <h2>מה אני בונה עבור עסקים ב${esc(city.he)}</h2>
      <div class="grid">
        <div class="card"><div class="ico">🌐</div><h3>אתרי תדמית</h3><p>אתר נקי, מהיר ומקצועי שמשדר אמינות ומביא פניות — מותאם לנייד ולכל מסך.</p></div>
        <div class="card"><div class="ico">🛒</div><h3>חנויות ומערכות</h3><p>חנות אונליין, מערכת ניהול או אפליקציית ווב מלאה שבנויה לגדול איתך.</p></div>
        <div class="card"><div class="ico">🚀</div><h3>SEO וקידום אורגני</h3><p>אתר שבנוי מהיסוד להופיע בגוגל — כותרות, מהירות ו-Schema של עסק מקומי.</p></div>
        <div class="card"><div class="ico">🤖</div><h3>אוטומציה ו-AI</h3><p>צ׳אטבוטים, טפסים חכמים ואוטומציות שחוסכות לך זמן ומטפלות בלקוחות 24/7.</p></div>
      </div>
    </section>

    <section class="wrap">
      <h2>למה לבחור בי</h2>
      <ul class="checks">
        ${city.angle.map((a) => `<li>${esc(a)}</li>`).join('\n        ')}
        <li>מחיר שקוף מראש, בלי הפתעות — ותמיכה אישית אחרי ההשקה.</li>
      </ul>
    </section>

    <section class="wrap faq">
      <h2>שאלות נפוצות — בניית אתרים ב${esc(city.he)}</h2>
      ${city.faq
        .map(
          (f) =>
            `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`,
        )
        .join('\n      ')}
    </section>

    <section class="wrap">
      <div class="cta-band">
        <h2>מוכנים לאתר שמביא לקוחות?</h2>
        <p>ספרו לי על העסק שלכם ב${esc(city.he)} — ואחזור אליכם עם רעיון והצעת מחיר, בלי התחייבות.</p>
        <a class="btn btn-primary" href="${wa}" target="_blank" rel="noopener">💬 בואו נתחיל בוואטסאפ</a>
      </div>
    </section>
  </main>

  <footer class="wrap">
    <strong>שירות גם באזורים הבאים:</strong>
    <div class="areas">
      ${siblingLinks(city)}
    </div>
    <div class="fine">
      <span>© 2026 וסים — בניית אתרים בצפון. <a href="${SITE}/" style="color:var(--purple-2)">לאתר הראשי</a></span>
      <span><a href="${wa}" target="_blank" rel="noopener">וואטסאפ</a> · <a href="${SITE}/#contact">צור קשר</a></span>
    </div>
  </footer>
</body>
</html>
`;
};

// ---------------------------------------------------------------------------
// Write pages
// ---------------------------------------------------------------------------
for (const city of cities) {
  const dir = resolve(publicDir, city.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, 'index.html'), page(city), 'utf8');
  console.log(`✓ ${city.slug}/index.html`);
}

// ---------------------------------------------------------------------------
// Regenerate sitemap.xml (homepage + all city pages)
// ---------------------------------------------------------------------------
const urlEntry = (loc, priority) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <url>
    <loc>${SITE}/</loc>
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/" />
    <xhtml:link rel="alternate" hreflang="he" href="${SITE}/?lang=he" />
    <xhtml:link rel="alternate" hreflang="ar" href="${SITE}/?lang=ar" />
  </url>

${cities.map((c) => urlEntry(`${SITE}/${c.slug}/`, '0.8')).join('\n')}

</urlset>
`;
writeFileSync(resolve(publicDir, 'sitemap.xml'), sitemap, 'utf8');
console.log('✓ sitemap.xml');
console.log(`\nGenerated ${cities.length} landing pages.`);
