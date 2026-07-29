/**
 * Convert PNG project screenshots to WebP at the actual display size.
 *
 * These images are rendered as 600x400 project cards on the site; the PNG
 * sources are typically 2000+px wide (souvlaki.png alone is 1.93 MB). We
 * resize to fit within 1200x800 (2× card size for retina) and re-encode as
 * WebP, which usually saves 80-95% of the bytes with no perceptible quality
 * loss.
 *
 * Run: `node .dev-scripts/optimize-images.mjs`
 *
 * Idempotent: skips files that already have an up-to-date .webp sibling
 * (compared by mtime). Rerun after adding a new PNG.
 */
import { readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ASSETS = resolve(__dirname, '..', 'public', 'assets');
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 800;
const WEBP_QUALITY = 82;

const shouldSkip = async (pngPath, webpPath) => {
  if (!existsSync(webpPath)) return false;
  const [png, webp] = await Promise.all([stat(pngPath), stat(webpPath)]);
  return webp.mtimeMs >= png.mtimeMs;
};

const entries = (await readdir(ASSETS)).filter((n) => n.toLowerCase().endsWith('.png'));

let saved = 0;
let converted = 0;
for (const name of entries) {
  const pngPath = join(ASSETS, name);
  const webpPath = join(ASSETS, `${parse(name).name}.webp`);
  if (await shouldSkip(pngPath, webpPath)) continue;

  const { size: beforeSize } = await stat(pngPath);
  await sharp(pngPath)
    .resize({ width: MAX_WIDTH, height: MAX_HEIGHT, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(webpPath);
  const { size: afterSize } = await stat(webpPath);

  converted++;
  saved += beforeSize - afterSize;
  const pct = Math.round((1 - afterSize / beforeSize) * 100);
  console.log(
    `  ✓ ${name.padEnd(24)} ${(beforeSize / 1024).toFixed(0).padStart(6)} KB → ${(
      afterSize / 1024
    )
      .toFixed(0)
      .padStart(5)} KB   (-${pct}%)`
  );
}

if (converted === 0) {
  console.log('All WebP siblings are up to date.');
} else {
  console.log(
    `\nConverted ${converted} file${converted === 1 ? '' : 's'}, saved ${(
      saved /
      1024 /
      1024
    ).toFixed(2)} MB.`
  );
}
