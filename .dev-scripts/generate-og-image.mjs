// Generates public/og-image.png (1200x630) for Open Graph + Twitter Card.
// Run: node .dev-scripts/generate-og-image.mjs
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const SRC_PHOTO = resolve(root, 'public/assets/waseem-profile.webp');
const OUT = resolve(root, 'public/og-image.png');

const W = 1200;
const H = 630;
const PHOTO_SIZE = 460;
const PHOTO_X = 80;
const PHOTO_Y = (H - PHOTO_SIZE) / 2;

const backgroundSvg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0820"/>
      <stop offset="55%" stop-color="#483AA0"/>
      <stop offset="100%" stop-color="#1a1340"/>
    </linearGradient>
    <radialGradient id="glow" cx="78%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#00E5FF" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
</svg>
`);

const photoMask = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${PHOTO_SIZE}" height="${PHOTO_SIZE}">
  <circle cx="${PHOTO_SIZE / 2}" cy="${PHOTO_SIZE / 2}" r="${PHOTO_SIZE / 2}" fill="#fff"/>
</svg>
`);

const photoRing = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${PHOTO_SIZE + 16}" height="${PHOTO_SIZE + 16}">
  <circle cx="${(PHOTO_SIZE + 16) / 2}" cy="${(PHOTO_SIZE + 16) / 2}" r="${PHOTO_SIZE / 2 + 6}"
          fill="none" stroke="#00E5FF" stroke-opacity="0.55" stroke-width="3"/>
</svg>
`);

const textSvg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <style>
    .name   { font: 700 88px 'Space Grotesk','Inter','Segoe UI',sans-serif; fill: #ffffff; }
    .role   { font: 600 38px 'Inter','Segoe UI',sans-serif; fill: #C5BBFF; }
    .accent { font: 700 38px 'Inter','Segoe UI',sans-serif; fill: #00E5FF; }
    .url    { font: 500 26px 'Inter','Segoe UI',sans-serif; fill: #ffffff; opacity: 0.75; }
    .pill   { font: 600 22px 'Inter','Segoe UI',sans-serif; fill: #ffffff; }
  </style>
  <text x="620" y="240" class="name">Waseem</text>
  <text x="620" y="305" class="role">Full Stack Developer</text>
  <text x="620" y="355" class="accent">&amp; AI Specialist</text>
  <rect x="620" y="395" width="190" height="44" rx="22" fill="#ffffff" fill-opacity="0.10" stroke="#ffffff" stroke-opacity="0.25"/>
  <text x="640" y="425" class="pill">React · TypeScript</text>
  <rect x="824" y="395" width="138" height="44" rx="22" fill="#ffffff" fill-opacity="0.10" stroke="#ffffff" stroke-opacity="0.25"/>
  <text x="844" y="425" class="pill">AI · Automation</text>
  <text x="620" y="500" class="url">wwas.netlify.app</text>
</svg>
`);

async function main() {
  const photoMeta = await sharp(SRC_PHOTO).metadata();
  const cropSize = Math.min(photoMeta.width, photoMeta.height);
  const left = Math.floor((photoMeta.width - cropSize) / 2);
  // Bias crop slightly upward so the face isn't cut off.
  const top = Math.max(0, Math.floor((photoMeta.height - cropSize) / 2) - Math.floor(cropSize * 0.08));

  const photoCircle = await sharp(SRC_PHOTO)
    .extract({ left, top, width: cropSize, height: cropSize })
    .resize(PHOTO_SIZE, PHOTO_SIZE)
    .composite([{ input: photoMask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  await sharp(backgroundSvg)
    .composite([
      { input: photoRing, top: PHOTO_Y - 8, left: PHOTO_X - 8 },
      { input: photoCircle, top: PHOTO_Y, left: PHOTO_X },
      { input: textSvg, top: 0, left: 0 },
    ])
    // palette + quantization keeps fidelity high while cutting file size by ~75%
    // versus full-color PNG (gradients quantize cleanly at q≥85).
    .png({ compressionLevel: 9, palette: true, quality: 90, effort: 10 })
    .toFile(OUT);

  console.log(`Wrote ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
