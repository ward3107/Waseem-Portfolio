import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = resolve('dist');
const template = readFileSync(resolve(dist, 'index.html'), 'utf8');
const site = 'https://www.vasia.dev';

const locales = {
  en: {
    title: 'Waseem — Wix, WordPress & Custom Web Developer',
    description: 'Waseem builds Wix and WordPress sites, online stores and custom web apps for businesses. AI automation and support in English, Hebrew and Arabic.',
    socialTitle: 'Waseem — Websites and digital solutions',
    socialDescription: 'Wix and WordPress sites, custom development and AI automation for businesses. Work in English, Hebrew and Arabic.',
    ogLocale: 'en_US',
  },
  ar: {
    title: 'وسيم — مواقع Wix وWordPress وحلول ويب مخصصة',
    description: 'يبني وسيم مواقع Wix وWordPress ومتاجر وتطبيقات ويب مخصصة للأعمال، مع حلول الذكاء الاصطناعي والأتمتة وخدمة بالعربية والعبرية والإنجليزية.',
    socialTitle: 'وسيم — تطوير مواقع وحلول رقمية',
    socialDescription: 'مواقع Wix وWordPress وتطوير مخصص وأتمتة للأعمال بالعربية والعبرية والإنجليزية.',
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
  mkdirSync(resolve(dist, lang), { recursive: true });
  writeFileSync(resolve(dist, lang, 'index.html'), html, 'utf8');
}

console.log('Localized home documents are ready.');
