// Give shared /video-ads links their own metadata before React executes.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const output = new URL('../dist/video-ads/', import.meta.url);
const site = 'https://waseemp.vercel.app';
const url = `${site}/video-ads`;
const title = 'Video Ads for Brands | Waseem';
const description = 'Turn your product photos into social video ads. Watch the GreenTouch portfolio concept: 27 seconds of motion, Hebrew captions, and music.';
let html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
const values = {
  title, description,
  'og:title': title, 'twitter:title': title,
  'og:description': description, 'twitter:description': description,
  'og:url': url, 'twitter:url': url,
  'og:image': `${site}/assets/video-ads/greentouch-share.jpg`,
  'twitter:image': `${site}/assets/video-ads/greentouch-share.jpg`,
  'og:image:width': '1080', 'og:image:height': '1080',
  'og:image:alt': 'GreenTouch video ad portfolio concept',
  'twitter:image:alt': 'GreenTouch video ad portfolio concept',
};
html = html.replace(/<meta\s+(?:name|property)="([^"]+)"\s+content="[^"]*"\s*\/?\s*>/g,
  (tag, key) => key in values ? tag.replace(/content="[^"]*"/, `content="${values[key]}"`) : tag);
html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${url}" />`);
html = html.replace(/(<link rel="alternate" hreflang="([^"]+)" href=")[^"]*("\s*\/>)/g,
  (_, start, lang, end) => `${start}${url}${lang === 'he' || lang === 'ar' ? `?lang=${lang}` : ''}${end}`);
// Homepage service/FAQ schema does not describe this dedicated showcase.
html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
mkdirSync(output, { recursive: true });
writeFileSync(new URL('index.html', output), html);
console.log(`Generated ${fileURLToPath(output)}index.html`);
