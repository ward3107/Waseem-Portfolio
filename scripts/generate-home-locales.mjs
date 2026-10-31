import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = resolve('dist');
const template = readFileSync(resolve(dist, 'index.html'), 'utf8');
const site = 'https://www.vasia.dev';

const locales = {
  en: {
    title: "Vasia — Websites, Apps & AI Automation",
    description: "Vasia builds Wix and WordPress websites, online stores and custom apps for businesses, with AI tools and automation. Service in English, Hebrew and Arabic.",
    socialTitle: "Vasia — Websites, Apps & AI Automation",
    socialDescription: "Vasia builds Wix and WordPress websites, online stores and custom apps for businesses, with AI tools and automation. Service in English, Hebrew and Arabic.",
    ogLocale: 'en_US',
  },
  ar: {
    title: "Vasia — تطوير مواقع وتطبيقات وأتمتة بالذكاء الاصطناعي",
    description: "Vasia تطوّر مواقع Wix وWordPress ومتاجر وتطبيقات مخصصة للأعمال، مع حلول الذكاء الاصطناعي والأتمتة. خدمة بالعربية والعبرية والإنجليزية.",
    socialTitle: "Vasia — تطوير مواقع وتطبيقات وأتمتة بالذكاء الاصطناعي",
    socialDescription: "Vasia تطوّر مواقع Wix وWordPress ومتاجر وتطبيقات مخصصة للأعمال، مع حلول الذكاء الاصطناعي والأتمتة. خدمة بالعربية والعبرية والإنجليزية.",
    ogLocale: 'ar_AR',
  },
};

const escape = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const setMeta = (html, kind, key, value) => html.replace(
  new RegExp(`(<meta ${kind}="${key}" content=")[^"]*("\\s*/>)`),
  (_, start, end) => `${start}${escape(value)}${end}`
);

for (const [lang, copy] of Object.entries(locales)) {
  const url = `${site}/${lang}/`;
  let html = template
    .replace('<html lang="he" dir="rtl"', `<html lang="${lang}" dir="${lang === 'en' ? 'ltr' : 'rtl'}"`)
    .replace(/<title>[^<]*<\/title>/, `<title>${escape(copy.title)}</title>`)
    .replace('<link rel="canonical" href="https://www.vasia.dev/" />', `<link rel="canonical" href="${url}" />`);
  for (const [kind, key, value] of [
    ['name', 'title', copy.title],
    ['name', 'description', copy.description],
    ['property', 'og:title', copy.socialTitle],
    ['property', 'og:description', copy.socialDescription],
    ['property', 'og:url', url],
    ['property', 'og:locale', copy.ogLocale],
    ['name', 'twitter:title', copy.socialTitle],
    ['name', 'twitter:description', copy.socialDescription],
    ['name', 'twitter:url', url],
  ]) html = setMeta(html, kind, key, value);
  // Each locale lists the other locales, without repeating itself.
  html = html.replace(/\s*<meta property="og:locale:alternate" content="[^"]*"\s*\/>/g, '');
  html = html.replace('</head>', Object.values({ he: 'he_IL', en: 'en_US', ar: 'ar_AR' })
    .filter(value => value !== copy.ogLocale)
    .map(value => `    <meta property="og:locale:alternate" content="${value}" />`).join('\n') + '\n  </head>');
  mkdirSync(resolve(dist, lang), { recursive: true });
  writeFileSync(resolve(dist, lang, 'index.html'), html, 'utf8');
}

console.log('Localized home documents are ready.');
