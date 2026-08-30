// Generates a static, SEO/AEO-optimized MULTILINGUAL blog into /public/ (index
// + one folder per article, per language). Build-time only + gitignored, same
// as the local landing pages, so the templated markup is never committed and
// doesn't trip SonarCloud duplication.
//
//   Hebrew  (default): /public/blog/<slug>/index.html     -> /blog/<slug>/
//   English:           /public/en/blog/<slug>/index.html  -> /en/blog/<slug>/
//   Arabic:            /public/ar/blog/<slug>/index.html   -> /ar/blog/<slug>/
//   (Russian later:    /public/ru/blog/... — add 'ru' to LANGS + translations.)
//
// Each article carries BlogPosting + BreadcrumbList + FAQPage JSON-LD, a direct
// "in short" answer box and an FAQ block (AEO — the shapes AI answer engines and
// featured snippets quote), plus hreflang alternates across every language it
// exists in. An article only emits hreflang for languages it actually has, so a
// Hebrew-only post never points at a missing translation.
//
// Design mirrors the main site: dark, glassy chrome (nav / hero / cards) with a
// light, high-contrast reading surface for the article body — fast static HTML,
// no JS, so Core Web Vitals and crawlability stay perfect.
//
// Run: node scripts/generate-blog.mjs   (also run by `npm run build`)
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '..', 'public');

const SITE = 'https://waseemp.vercel.app';
const WHATSAPP = '972534260632';
const PUBLISHED = '2026-07-07';
const UPDATED = '2026-08-30';
const AUTHOR = { he: 'וסים', en: 'Waseem', ar: 'وسيم' };

// Languages this build emits. Add 'ru' here (and a translations block below +
// content in an article's `i18n`) to light Russian up everywhere at once.
const LANGS = ['he', 'en', 'ar'];
const DIR = { he: 'rtl', en: 'ltr', ar: 'rtl' };
const OG_LOCALE = { he: 'he_IL', en: 'en_US', ar: 'ar_AR' };
const HTML_LANG = { he: 'he', en: 'en', ar: 'ar' };

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Per-language WhatsApp deep-link with a localized opener.
const WA_TEXT = {
  he: 'היי וסים, קראתי את הבלוג ואשמח להצעת מחיר לאתר 🙂',
  en: "Hi Waseem, I read your blog and would love a quote for a website 🙂",
  ar: 'مرحبا وسيم، قرأت المدونة وأرغب بعرض سعر لموقع 🙂',
};
const waLink = (lang) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WA_TEXT[lang])}`;

// Static UI labels per language.
const T = {
  he: {
    home: 'בית', blog: 'בלוג', backAll: '← לכל המאמרים', backSite: '← לאתר הראשי',
    tldr: 'בקצרה', faq: 'שאלות נפוצות', related: 'מאמרים נוספים', readMore: 'קראו עוד ←',
    min: 'דק׳ קריאה', updated: 'עודכן', sources: 'מקורות', role: 'מפתח ובונה אתרים',
    ctaTitle: 'מוכנים לאתר שמביא לקוחות?',
    ctaBody: 'ספרו לי על העסק שלכם ואחזור אליכם עם רעיון והצעת מחיר — בלי התחייבות.',
    ctaBtn: '💬 דברו איתי בוואטסאפ',
    blogTitle: 'הבלוג', blogLeadTitle: 'הבלוג של וסים — בניית אתרים, עיצוב ו-SEO',
    blogLead: 'מדריכים, טיפים ותובנות על בניית אתרים, עיצוב תלת-ממדי, SEO מקומי וצמיחה דיגיטלית לעסקים.',
    footer: '© 2026 וסים — בניית אתרים בצפון',
    toMain: 'לאתר הראשי', contact: 'צור קשר',
  },
  en: {
    home: 'Home', blog: 'Blog', backAll: '← All articles', backSite: '← Back to site',
    tldr: 'In short', faq: 'FAQ', related: 'More articles', readMore: 'Read more →',
    min: 'min read', updated: 'Updated', sources: 'Sources', role: 'Web developer & designer',
    ctaTitle: 'Ready for a website that brings clients?',
    ctaBody: 'Tell me about your business and I’ll come back with an idea and a quote — no commitment.',
    ctaBtn: '💬 Message me on WhatsApp',
    blogTitle: 'The Blog', blogLeadTitle: 'Waseem’s Blog — Web Development, Design & SEO',
    blogLead: 'Guides, tips and insights on web development, 3D design, local SEO and digital growth for businesses.',
    footer: '© 2026 Waseem — Web development',
    toMain: 'Main site', contact: 'Contact',
  },
  ar: {
    home: 'الرئيسية', blog: 'المدونة', backAll: '← كل المقالات', backSite: '← إلى الموقع',
    tldr: 'باختصار', faq: 'أسئلة شائعة', related: 'مقالات أخرى', readMore: 'اقرأ المزيد ←',
    min: 'دقيقة قراءة', updated: 'حُدّث', sources: 'المصادر', role: 'مطوّر ومصمّم مواقع',
    ctaTitle: 'جاهز لموقع يجلب لك عملاء؟',
    ctaBody: 'أخبرني عن عملك وسأعود إليك بفكرة وعرض سعر — دون أي التزام.',
    ctaBtn: '💬 تواصل معي عبر واتساب',
    blogTitle: 'المدونة', blogLeadTitle: 'مدونة وسيم — تطوير المواقع، التصميم و-SEO',
    blogLead: 'أدلة ونصائح ورؤى حول تطوير المواقع، التصميم ثلاثي الأبعاد، السيو المحلي والنمو الرقمي للأعمال.',
    footer: '© 2026 وسيم — تطوير مواقع',
    toMain: 'الموقع الرئيسي', contact: 'تواصل',
  },
};

// ---------------------------------------------------------------------------
// URL + output-path helpers. Hebrew lives at the root; every other language is
// nested under /<lang>/, matching the local landing pages' convention.
// ---------------------------------------------------------------------------
const langPrefix = (lang) => (lang === 'he' ? '' : `/${lang}`);
const blogIndexUrl = (lang) => `${SITE}${langPrefix(lang)}/blog/`;
const articleUrl = (lang, slug) => `${SITE}${langPrefix(lang)}/blog/${slug}/`;
const indexDir = (lang) =>
  lang === 'he' ? resolve(publicDir, 'blog') : resolve(publicDir, lang, 'blog');
const articleDir = (lang, slug) =>
  lang === 'he' ? resolve(publicDir, 'blog', slug) : resolve(publicDir, lang, 'blog', slug);

// ---------------------------------------------------------------------------
// Content blocks -> HTML. Each localized article `body` is an array of blocks:
// { h2 } | { p } | { ul: [] } | { cta } (WhatsApp button)
// ---------------------------------------------------------------------------
const renderBlock = (b, lang) => {
  if (b.h2) return `<h2>${esc(b.h2)}</h2>`;
  if (b.p) return `<p>${esc(b.p)}</p>`;
  if (b.ul) return `<ul>${b.ul.map((li) => `<li>${esc(li)}</li>`).join('')}</ul>`;
  if (b.cta)
    return `<div class="inline-cta"><a class="btn btn-primary" href="${waLink(lang)}" target="_blank" rel="noopener">💬 ${esc(b.cta)}</a></div>`;
  return '';
};

// Rough reading time from the article's visible words. Hebrew/Arabic read a
// touch slower than English prose, but 200 wpm is a fair, honest average.
const readingTime = (loc) => {
  const text = [loc.tldr || '', ...loc.body.map((b) => b.p || b.h2 || (b.ul ? b.ul.join(' ') : '') || '')]
    .concat((loc.faq || []).flatMap((f) => [f.q, f.a]))
    .join(' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

// ---------------------------------------------------------------------------
// Design — dark, glassy chrome + a light reading surface for the article body.
// Logical properties (margin-inline, inset-inline) keep it correct in both RTL
// (he/ar) and LTR (en/future ru) with no per-language overrides.
// ---------------------------------------------------------------------------
const blogCss = `
  :root{
    --ink:#0a0820;--ink-2:#0f0c26;--card:rgba(255,255,255,.045);
    --line:rgba(255,255,255,.10);--line-soft:rgba(255,255,255,.06);
    --purple:#483AA0;--purple-l:#7965C1;--purple-ll:#A78BFA;--cyan:#00E5FF;--gold:#D4AF37;
    --white:#f4f2fb;--mute:#a9a3c9;--mute-2:#6f6a92;
    --paper:#f7f6fb;--paper-2:#fff;--paper-ink:#1b1836;--paper-body:#332f4d;--paper-mute:#565073;--paper-line:#e7e3f3;
    --display:'Space Grotesk','Heebo','Cairo',system-ui,sans-serif;
    --body:'Heebo','Cairo','Segoe UI',system-ui,sans-serif;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{background:
      radial-gradient(1200px 600px at 80% -10%, rgba(72,58,160,.35), transparent 60%),
      radial-gradient(900px 500px at 0% 8%, rgba(0,229,255,.09), transparent 55%),
      var(--ink);
    color:var(--white);font-family:var(--body);line-height:1.8;-webkit-font-smoothing:antialiased}
  a{color:inherit;text-decoration:none}
  .wrap{max-width:820px;margin:0 auto;padding:0 20px}
  .nav{display:flex;align-items:center;justify-content:space-between;padding:18px 0;max-width:1080px;margin:0 auto;padding-inline:20px}
  .brand{font-family:var(--display);font-weight:700;font-size:20px;letter-spacing:-.5px}
  .brand b{color:var(--purple-ll)}
  .nav .back{font-size:14px;color:var(--mute)}
  .nav .back:hover{color:var(--purple-ll)}
  .langs{display:flex;gap:6px}
  .langs a{font-family:var(--display);font-size:12px;font-weight:600;color:var(--mute);
    border:1px solid var(--line);border-radius:8px;padding:4px 9px}
  .langs a.on{color:var(--ink);background:var(--gold);border-color:transparent}
  .crumbs{font-family:var(--display);font-size:13px;color:var(--mute-2);padding:26px 0 4px}
  .crumbs a:hover{color:var(--purple-ll)}
  h1{font-family:var(--display);font-size:clamp(28px,5vw,42px);font-weight:800;line-height:1.2;letter-spacing:-.5px;margin:10px 0 14px;text-wrap:balance}
  .article-head{background:linear-gradient(180deg,rgba(72,58,160,.28),transparent);border-bottom:1px solid var(--line-soft)}
  .meta{display:flex;align-items:center;gap:12px;color:var(--mute);font-size:14px;margin-bottom:28px;padding-bottom:22px}
  .avatar{width:40px;height:40px;border-radius:50%;flex:none;background:linear-gradient(135deg,var(--purple-l),var(--cyan));
    display:grid;place-items:center;font-family:var(--display);font-weight:700;color:var(--ink)}
  .meta .who{font-weight:600;color:var(--white)}
  .meta .sub{font-size:12.5px;color:var(--mute-2)}
  /* Light reading surface */
  .paper{background:var(--paper);color:var(--paper-ink);border-radius:22px;padding:30px 26px 34px;margin:22px 0}
  .tldr{background:var(--paper-2);border:1px solid var(--paper-line);border-inline-start:4px solid var(--purple-l);
    border-radius:14px;padding:16px 18px;margin-bottom:24px;box-shadow:0 14px 34px -20px rgba(72,58,160,.5)}
  .tldr .lab{font-family:var(--display);font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--purple);margin-bottom:7px}
  .tldr p{font-size:15.5px;color:var(--paper-ink);font-weight:500;margin:0}
  article h2{font-family:var(--display);font-size:clamp(20px,3.4vw,26px);font-weight:700;margin:32px 0 12px;letter-spacing:-.3px;color:var(--paper-ink)}
  article p{color:var(--paper-body);margin:14px 0;font-size:17px}
  article ul{margin:14px 0;padding-inline-start:6px;list-style:none;display:grid;gap:10px}
  article ul li{display:flex;gap:12px;align-items:flex-start;color:var(--paper-body);font-size:16px}
  article ul li::before{content:'←';color:var(--purple-l);font-weight:800}
  [dir=ltr] article ul li::before{content:'→'}
  .inline-cta{margin:26px 0;text-align:center}
  .btn{display:inline-flex;align-items:center;gap:8px;font-weight:700;font-size:16px;padding:14px 26px;border-radius:14px;transition:transform .2s}
  .btn-primary{background:linear-gradient(90deg,var(--purple),var(--purple-l));color:#fff;box-shadow:0 12px 30px -10px rgba(72,58,160,.6)}
  .btn-primary:hover{transform:translateY(-2px)}
  .faq{margin-top:30px;border-top:1px solid var(--paper-line);padding-top:22px}
  .faq h2{margin-top:0}
  .qa{border:1px solid var(--paper-line);border-radius:12px;padding:14px 16px;margin-bottom:10px;background:var(--paper-2)}
  .qa .q{font-family:var(--display);font-weight:700;font-size:16px;color:var(--paper-ink)}
  .qa .a{font-size:15px;color:var(--paper-mute);margin-top:7px}
  .sources{margin-top:24px;border-top:1px solid var(--paper-line);padding-top:16px}
  .sources h3{font-family:var(--display);font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--paper-mute);margin-bottom:8px}
  .sources a{display:inline-block;color:var(--purple);font-size:14px;font-weight:600;margin-inline-end:16px}
  .sources a:hover{text-decoration:underline}
  .end-cta{background:linear-gradient(120deg,var(--purple),var(--purple-l));color:#fff;border-radius:22px;padding:38px 26px;text-align:center;margin:30px 0}
  .end-cta h2{color:#fff;margin:0 0 10px;font-family:var(--display)}
  .end-cta p{opacity:.92;margin:0 auto 22px;max-width:520px}
  .end-cta .btn-primary{background:#fff;color:var(--purple)}
  .related{margin:34px 0}
  .related h3{font-family:var(--display);font-size:18px;margin-bottom:14px}
  .related a{display:block;padding:14px 18px;background:var(--card);border:1px solid var(--line);border-radius:14px;margin-bottom:10px;font-weight:600;transition:border-color .2s}
  .related a:hover{border-color:var(--purple-l)}
  /* Index */
  .hero{padding:40px 0 8px}
  .hero .eye{font-family:var(--display);font-size:12px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--gold)}
  .lead{color:var(--mute);font-size:18px;margin:10px 0 6px;max-width:60ch}
  .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px;margin:26px 0 10px}
  .post-card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:24px;transition:transform .2s,border-color .2s;backdrop-filter:blur(8px);display:flex;flex-direction:column;gap:8px}
  .post-card:hover{transform:translateY(-4px);border-color:var(--purple-l)}
  .post-card .tag{font-family:var(--display);font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--cyan)}
  .post-card h2{font-family:var(--display);font-size:20px;margin:2px 0 4px;line-height:1.35;color:var(--white)}
  .post-card p{color:var(--mute);font-size:15px}
  .post-card .more{color:var(--purple-ll);font-weight:700;font-size:14px;margin-top:auto;padding-top:8px;display:inline-block}
  footer{border-top:1px solid var(--line-soft);padding:30px 20px;margin-top:26px;font-size:14px;color:var(--mute-2);max-width:1080px;margin-inline:auto}
  footer a:hover{color:var(--purple-ll)}
`;

// hreflang alternates for a slug, across the languages it actually exists in
// (article) or across all LANGS (index, slug=null). x-default points at Hebrew.
const hreflangTags = (langsPresent, slug) =>
  langsPresent
    .map((l) => {
      const href = slug ? articleUrl(l, slug) : blogIndexUrl(l);
      return `  <link rel="alternate" hreflang="${HTML_LANG[l]}" href="${href}" />`;
    })
    .concat(
      `  <link rel="alternate" hreflang="x-default" href="${slug ? articleUrl('he', slug) : blogIndexUrl('he')}" />`
    )
    .join('\n');

const head = (lang, title, desc, url, jsonLd, altLangs, slug) => `  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}" />
  <meta name="author" content="${esc(AUTHOR[lang])}" />
  <meta name="robots" content="index, follow" />
  <meta name="theme-color" content="#0a0820" />
  <link rel="canonical" href="${url}" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
${hreflangTags(altLangs, slug)}
  <meta property="og:type" content="${slug ? 'article' : 'website'}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:image" content="${SITE}/og-image.png" />
  <meta property="og:locale" content="${OG_LOCALE[lang]}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(desc)}" />
  <meta name="twitter:image" content="${SITE}/og-image.png" />
${jsonLd.map((o) => `  <script type="application/ld+json">\n${JSON.stringify(o, null, 2)}\n  </script>`).join('\n')}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Heebo:wght@400;500;700;800;900&family=Cairo:wght@400;600;700;800&display=swap" />
  <style>${blogCss}</style>`;

// Language switcher — only links to languages the current page exists in.
const langSwitcher = (langsPresent, current, slug) =>
  `<div class="langs">${LANGS.filter((l) => langsPresent.includes(l))
    .map((l) => {
      const href = slug ? articleUrl(l, slug) : blogIndexUrl(l);
      const label = { he: 'ע', en: 'EN', ar: 'ع' }[l];
      return `<a href="${href}" class="${l === current ? 'on' : ''}" hreflang="${HTML_LANG[l]}" lang="${HTML_LANG[l]}">${label}</a>`;
    })
    .join('')}</div>`;

const articlePage = (article, lang) => {
  const loc = article.i18n[lang];
  const langsPresent = Object.keys(article.i18n).filter((l) => LANGS.includes(l));
  const url = articleUrl(lang, article.slug);
  const t = T[lang];
  const mins = readingTime(loc);
  const related = ALL.filter((x) => x.slug !== article.slug && x.i18n[lang]).slice(0, 3);

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      headline: loc.title,
      description: loc.desc,
      image: `${SITE}/og-image.png`,
      datePublished: PUBLISHED,
      dateModified: UPDATED,
      inLanguage: HTML_LANG[lang],
      author: { '@type': 'Person', name: AUTHOR[lang], url: SITE },
      publisher: {
        '@type': 'Person',
        name: AUTHOR[lang],
        logo: { '@type': 'ImageObject', url: `${SITE}/og-image.png` },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: t.home, item: `${SITE}${langPrefix(lang)}/` },
        { '@type': 'ListItem', position: 2, name: t.blog, item: blogIndexUrl(lang) },
        { '@type': 'ListItem', position: 3, name: loc.title, item: url },
      ],
    },
  ];
  if (loc.faq && loc.faq.length) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: loc.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }

  const faqHtml = loc.faq && loc.faq.length
    ? `<div class="faq"><h2>${t.faq}</h2>${loc.faq
        .map((f) => `<div class="qa"><p class="q">${esc(f.q)}</p><p class="a">${esc(f.a)}</p></div>`)
        .join('')}</div>`
    : '';

  const sourcesHtml = loc.sources && loc.sources.length
    ? `<div class="sources"><h3>${t.sources}</h3>${loc.sources
        .map((s) => `<a href="${s.url}" target="_blank" rel="noopener noreferrer">${esc(s.name)} ↗</a>`)
        .join('')}</div>`
    : '';

  return `<!DOCTYPE html>
<html lang="${HTML_LANG[lang]}" dir="${DIR[lang]}">
<head>
${head(lang, `${loc.title} | ${AUTHOR[lang]}`, loc.desc, url, jsonLd, langsPresent, article.slug)}
</head>
<body>
  <header class="article-head">
    <nav class="nav">
      <a class="brand" href="${SITE}${langPrefix(lang)}/">Waseem<b>.</b></a>
      <div style="display:flex;align-items:center;gap:16px">
        <a class="back" href="${blogIndexUrl(lang)}">${t.backAll}</a>
        ${langSwitcher(langsPresent, lang, article.slug)}
      </div>
    </nav>
    <div class="wrap">
      <div class="crumbs"><a href="${SITE}${langPrefix(lang)}/">${t.home}</a> / <a href="${blogIndexUrl(lang)}">${t.blog}</a> / ${esc(loc.title)}</div>
      <h1>${esc(loc.title)}</h1>
      <div class="meta">
        <div class="avatar">${esc(AUTHOR[lang].charAt(0))}</div>
        <div>
          <div class="who">${esc(AUTHOR[lang])} · ${esc(t.role)}</div>
          <div class="sub">${t.updated} ${UPDATED} · ${mins} ${t.min}</div>
        </div>
      </div>
    </div>
  </header>

  <main class="wrap">
    <div class="paper">
      ${loc.tldr ? `<div class="tldr"><div class="lab">⚡ ${t.tldr}</div><p>${esc(loc.tldr)}</p></div>` : ''}
      <article>
        ${loc.body.map((b) => renderBlock(b, lang)).join('\n        ')}
      </article>
      ${faqHtml}
      ${sourcesHtml}
    </div>

    <div class="end-cta">
      <h2>${t.ctaTitle}</h2>
      <p>${t.ctaBody}</p>
      <a class="btn btn-primary" href="${waLink(lang)}" target="_blank" rel="noopener">${t.ctaBtn}</a>
    </div>

    ${related.length ? `<div class="related"><h3>${t.related}</h3>${related
      .map((r) => `<a href="${articleUrl(lang, r.slug)}">${esc(r.i18n[lang].title)}</a>`)
      .join('')}</div>` : ''}
  </main>
  <footer>
    ${t.footer} · <a href="${SITE}${langPrefix(lang)}/" style="color:var(--purple-ll)">${t.toMain}</a> · <a href="${SITE}${langPrefix(lang)}/about#contact">${t.contact}</a>
  </footer>
</body>
</html>
`;
};

const indexPage = (lang) => {
  const t = T[lang];
  const url = blogIndexUrl(lang);
  const posts = ALL.filter((a) => a.i18n[lang]);
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      '@id': `${url}#blog`,
      name: t.blogLeadTitle,
      description: t.blogLead,
      url,
      inLanguage: HTML_LANG[lang],
      author: { '@type': 'Person', name: AUTHOR[lang], url: SITE },
      blogPost: posts.map((a) => ({
        '@type': 'BlogPosting',
        headline: a.i18n[lang].title,
        description: a.i18n[lang].desc,
        datePublished: PUBLISHED,
        url: articleUrl(lang, a.slug),
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: t.home, item: `${SITE}${langPrefix(lang)}/` },
        { '@type': 'ListItem', position: 2, name: t.blog, item: url },
      ],
    },
  ];

  return `<!DOCTYPE html>
<html lang="${HTML_LANG[lang]}" dir="${DIR[lang]}">
<head>
${head(lang, t.blogLeadTitle, t.blogLead, url, jsonLd, LANGS, null)}
</head>
<body>
  <header>
    <nav class="nav">
      <a class="brand" href="${SITE}${langPrefix(lang)}/">Waseem<b>.</b></a>
      <div style="display:flex;align-items:center;gap:16px">
        <a class="back" href="${SITE}${langPrefix(lang)}/">${t.backSite}</a>
        ${langSwitcher(LANGS, lang, null)}
      </div>
    </nav>
  </header>
  <main class="wrap">
    <div class="crumbs"><a href="${SITE}${langPrefix(lang)}/">${t.home}</a> / ${t.blog}</div>
    <div class="hero">
      <div class="eye">${t.blog}</div>
      <h1>${t.blogTitle}</h1>
      <p class="lead">${t.blogLead}</p>
    </div>
    <div class="cards">
      ${posts
        .map((a) => {
          const loc = a.i18n[lang];
          return `<a class="post-card" href="${articleUrl(lang, a.slug)}">
        ${loc.category ? `<span class="tag">${esc(loc.category)}</span>` : ''}
        <h2>${esc(loc.title)}</h2>
        <p>${esc(loc.excerpt)}</p>
        <span class="more">${t.readMore}</span>
      </a>`;
        })
        .join('\n      ')}
    </div>
  </main>
  <footer>
    ${t.footer} · <a href="${SITE}${langPrefix(lang)}/" style="color:var(--purple-ll)">${t.toMain}</a> · <a href="${SITE}${langPrefix(lang)}/about#contact">${t.contact}</a>
  </footer>
</body>
</html>
`;
};

// ---------------------------------------------------------------------------
// ARTICLES. `slug` is shared across languages (hreflang key); `i18n` holds one
// block per language. An article renders only in the languages it provides.
// ---------------------------------------------------------------------------
import { ARTICLES } from './blog-content.mjs';
const ALL = ARTICLES;

// Write index + articles for every language.
let count = 0;
for (const lang of LANGS) {
  const iDir = indexDir(lang);
  mkdirSync(iDir, { recursive: true });
  writeFileSync(resolve(iDir, 'index.html'), indexPage(lang), 'utf8');
  console.log(`✓ ${langPrefix(lang)}/blog/index.html`);
  for (const a of ALL) {
    if (!a.i18n[lang]) continue;
    const dir = articleDir(lang, a.slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, 'index.html'), articlePage(a, lang), 'utf8');
    console.log(`✓ ${langPrefix(lang)}/blog/${a.slug}/index.html`);
    count += 1;
  }
}
console.log(`\nGenerated ${LANGS.length} blog indexes + ${count} article pages.`);
