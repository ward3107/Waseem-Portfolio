import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const brandDir = new URL('../public/brand/', import.meta.url);
const mark = await readFile(new URL('vasia-mark.svg', brandDir));
const darkLogo = await readFile(new URL('vasia-logo-dark.svg', brandDir));
const lightLogo = await readFile(new URL('vasia-logo-light.svg', brandDir));

const background = (width, height) =>
  Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <radialGradient id="glow" cx="30%" cy="28%" r="88%">
        <stop stop-color="#292066"/><stop offset=".5" stop-color="#101633"/><stop offset="1" stop-color="#060918"/>
      </radialGradient>
      <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
        <path d="M48 0H0V48" fill="none" stroke="#FFFFFF" stroke-opacity=".04"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#glow)"/>
    <rect width="100%" height="100%" fill="url(#grid)"/>
  </svg>`);

const outputPath = (name) => fileURLToPath(new URL(name, brandDir));

await sharp(darkLogo).resize({ width: 1400 }).png().toFile(outputPath('vasia-logo-dark.png'));

await sharp(background(1080, 1080))
  .composite([
    { input: await sharp(mark).resize({ width: 760 }).png().toBuffer(), left: 160, top: 205 },
  ])
  .png()
  .toFile(outputPath('vasia-profile.png'));

const shareCaption = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <text x="600" y="505" text-anchor="middle" fill="#AEB7D8" font-family="Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="5">DESIGN  •  DEVELOPMENT  •  MOTION</text>
    <text x="600" y="552" text-anchor="middle" fill="#D4AF37" font-family="Arial, sans-serif" font-size="20" font-weight="700" letter-spacing="2">WWW.VASIA.DEV</text>
  </svg>`);

await sharp(background(1200, 630))
  .composite([
    { input: await sharp(lightLogo).resize({ width: 880 }).png().toBuffer(), left: 160, top: 115 },
    { input: shareCaption, left: 0, top: 0 },
  ])
  .png()
  .toFile(outputPath('vasia-share.png'));
