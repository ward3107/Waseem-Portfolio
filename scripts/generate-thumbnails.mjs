import { readdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..', 'public');

async function walk(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files;
}

async function convert(source, target, width, height) {
  const input = await stat(source);
  try {
    if ((await stat(target)).mtimeMs >= input.mtimeMs) return;
  } catch {
    // No generated thumbnail yet.
  }
  await sharp(source)
    .resize(width, height, { fit: 'cover', position: 'centre', withoutEnlargement: true })
    .webp({ quality: 72, effort: 5 })
    .toFile(target);
}

const videoDir = join(root, 'assets', 'video-ads');
for (const source of await walk(videoDir)) {
  if (!source.endsWith('.webp') || source.endsWith('-thumb.webp')) continue;
  await convert(source, source.replace(/\.webp$/, '-thumb.webp'), 400, 500);
}

const certDir = join(root, 'certifications');
for (const source of await walk(certDir)) {
  if (!source.endsWith('.png')) continue;
  await convert(source, source.replace(/\.png$/, '-thumb.webp'), 700, 525);
}
console.log('Responsive video and certificate thumbnails are ready.');
