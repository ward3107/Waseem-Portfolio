/**
 * Convert public/fonts/*.ttf → *.woff2. Idempotent; skips files whose WOFF2
 * sibling is newer than the source. Runs once as part of `npm run build`.
 *
 * Cairo (Arabic) drops from ~600 KB → ~300 KB and Heebo (Hebrew) from
 * ~120 KB → ~60 KB, cutting the per-Arabic-visitor font download in half.
 */
import { readFile, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compress } from 'wawoff2';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const FONTS = resolve(__dirname, '..', 'public', 'fonts');
const SOURCES = ['heebo.ttf', 'cairo.ttf'];

const isFresh = async (ttf, woff2) => {
  if (!existsSync(woff2)) return false;
  const [t, w] = await Promise.all([stat(ttf), stat(woff2)]);
  return w.mtimeMs >= t.mtimeMs;
};

let converted = 0;
let saved = 0;
for (const name of SOURCES) {
  const ttf = resolve(FONTS, name);
  if (!existsSync(ttf)) continue;
  const woff2 = ttf.replace(/\.ttf$/, '.woff2');
  if (await isFresh(ttf, woff2)) continue;

  const src = await readFile(ttf);
  const out = await compress(src);
  await writeFile(woff2, out);
  converted++;
  saved += src.length - out.length;
  const pct = Math.round((1 - out.length / src.length) * 100);
  console.log(
    `  ✓ ${name.padEnd(12)} ${(src.length / 1024).toFixed(0).padStart(5)} KB → ${(
      out.length / 1024
    )
      .toFixed(0)
      .padStart(4)} KB   (-${pct}%)`
  );
}

if (converted === 0) console.log('WOFF2 fonts already up to date.');
else
  console.log(
    `\nConverted ${converted} font${converted === 1 ? '' : 's'}, saved ${(
      saved / 1024
    ).toFixed(0)} KB.`
  );
