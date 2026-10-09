/**
 * Crawler-visible metadata for VASIA OneTap public links.
 * WhatsApp previews use the initial HTML, not JavaScript-generated React title.
 */
import sharp from 'sharp';
import { mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = resolve('dist');
const shell = readFileSync(resolve(dist, 'index.html'), 'utf8');
const site = 'https://www.vasia.dev';
const shareImage = site + '/onetap/one-tap-social-preview.png';

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (ch) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

function generatePage(page) {
  const pageUrl = site + page.path;
  let html = shell.replace(/<title>[\s\S]*?<\/title>/, '<title>' + escapeHtml(page.title) + '</title>');
  const meta = {
    title: page.title,
    description: page.description,
    'og:type': 'website',
    'og:url': pageUrl,
    'og:title': page.title,
    'og:description': page.description,
    'og:image': shareImage,
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:alt': page.imageAlt,
    'og:locale': 'he_IL',
    'og:site_name': 'VASIA OneTap',
    'twitter:card': 'summary_large_image',
    'twitter:url': pageUrl,
    'twitter:title': page.title,
    'twitter:description': page.description,
    'twitter:image': shareImage,
    'twitter:image:alt': page.imageAlt,
  };
  const found = new Set();
  html = html.replace(/<meta\s+(name|property)="([^"]+)"\s+content="[^"]*"\s*\/?>/g,
    (tag, attr, key) => {
      if (!(key in meta)) return tag;
      found.add(key);
      return '<meta ' + attr + '="' + key + '" content="' + escapeHtml(meta[key]) + '" />';
    });
  for (const key of Object.keys(meta)) {
    if (!found.has(key)) throw new Error('Missing meta tag ' + key + ' for ' + page.path);
  }
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/>/,
    '<link rel="canonical" href="' + pageUrl + '" />');
  html = html.replace(/(<link rel="alternate" hreflang="([^"]+)" href=")[^"]*("\s*\/>)/g,
    (_, before, lang, after) => before + pageUrl +
      (lang === 'he' || lang === 'ar' ? '?lang=' + lang : '') + after);
  // Homepage Person/Business/FAQ structured data does not describe these pages.
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
  html = html.replace(/<\/head>/,
    '  <meta property="og:image:type" content="image/png" />\n' +
    '  <meta property="og:image:secure_url" content="' + shareImage + '" />\n</head>');
  const folder = resolve(dist, '.' + page.path);
  mkdirSync(folder, { recursive: true });
  writeFileSync(resolve(folder, 'index.html'), html);
  if (!html.includes('property="og:title" content="' + escapeHtml(page.title) + '"')) {
    throw new Error('Invalid social card title at ' + page.path);
  }
  console.log('Open Graph preview HTML generated for ' + pageUrl);
}

const cards = [
  {
    path: '/card',
    title: 'VASIA OneTap | כרטיס ביקור דיגיטלי',
    description: 'כרטיס הביקור הדיגיטלי של VASIA: WhatsApp ישיר, אתר, רשתות חברתיות, QR ושמירת איש קשר. כל הדרכים להתחבר בלחיצה אחת.',
    imageAlt: 'VASIA OneTap digital business card: WhatsApp, QR, website and social profiles',
  },
  {
    path: '/qr',
    title: 'VASIA OneTap | קוד QR לכרטיס ביקור דיגיטלי',
    description: 'סרקו את קוד ה־QR כדי לפתוח כרטיס ביקור דיגיטלי עם WhatsApp, אתר ורשתות חברתיות במקום אחד.',
    imageAlt: 'VASIA OneTap QR code for a digital business card',
  },
  {
    path: '/onetap',
    title: 'VASIA OneTap | כרטיסי ביקור דיגיטליים החל מ־199 ₪',
    description: 'שלוש חבילות כרטיס ביקור דיגיטלי: Classic ב־199 ₪, Motion ב־399 ₪, ועיצוב מותאם החל מ־499 ₪.',
    imageAlt: 'VASIA OneTap digital business card plans: Classic, Motion and Signature',
  },
];
cards.forEach(generatePage);

// Lightweight, original VASIA-branded 1200x630 social preview in bright tones,
// composed at build time from the logo PNG already owned by the project.
const background = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">',
  '<defs>',
  '<linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#f3f9ff"/><stop offset=".55" stop-color="#c8dcff"/><stop offset="1" stop-color="#b5eff6"/></linearGradient>',
  '<linearGradient id="line" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#6d78eb"/><stop offset="1" stop-color="#21cfda"/></linearGradient>',
  '</defs>',
  '<rect width="1200" height="630" fill="url(#bg)"/>',
  '<circle cx="260" cy="315" r="187" fill="none" stroke="#7294fb" stroke-width="3" opacity=".65"/>',
  '<circle cx="260" cy="315" r="205" fill="none" stroke="#67dcea" stroke-width="3" opacity=".7"/>',
  '<rect x="104" y="160" width="312" height="312" rx="56" fill="#6a8deb" opacity=".25"/>',
  '<text x="479" y="198" font-family="DejaVu Sans, sans-serif" font-size="45" font-weight="700" fill="#203776" letter-spacing="5">VASIA</text>',
  '<text x="479" y="252" font-family="DejaVu Sans, sans-serif" font-size="32" font-weight="700" fill="#435abd">OneTap</text>',
  '<text x="474" y="342" font-family="DejaVu Sans, sans-serif" font-size="46" font-weight="700" fill="#193969">DIGITAL BUSINESS</text>',
  '<text x="474" y="410" font-family="DejaVu Sans, sans-serif" font-size="64" font-weight="700" fill="#3268c9">CARD</text>',
  '<rect x="475" y="439" width="615" height="4" rx="2" fill="url(#line)"/>',
  '<text x="479" y="501" font-family="DejaVu Sans, sans-serif" font-size="25" fill="#385585">WhatsApp  •  Website  •  QR  •  Social</text>',
  '<text x="479" y="550" font-family="DejaVu Sans, sans-serif" font-size="22" font-weight="700" fill="#267ba5">ONE TAP. ALL CONNECTED.</text>',
  '</svg>',
].join('');

const profile = await sharp(resolve('public/brand/vasia-profile.png'))
  .resize(280, 280).png().toBuffer();
const outputImage = resolve(dist, 'onetap/one-tap-social-preview.png');
mkdirSync(resolve(dist, 'onetap'), { recursive: true });
await sharp(Buffer.from(background)).composite([{ input: profile, left: 120, top: 175 }])
  .png({ compressionLevel: 9 }).toFile(outputImage);
const info = await sharp(outputImage).metadata();
if (info.width !== 1200 || info.height !== 630 || statSync(outputImage).size < 5000) {
  throw new Error('Invalid OneTap Open Graph image');
}
console.log('Generated share preview PNG: 1200x630');
