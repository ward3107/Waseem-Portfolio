/**
 * Produce real 192px and 512px PNGs for the OneTap PWA manifests.
 * Generated at build time from the already versioned VASIA brand icon.
 * No extra network calls or external design services.
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const source = resolve('public/brand/vasia-profile.png');
const target = resolve('public/onetap');
await mkdir(target, { recursive: true });

for (const size of [192, 512]) {
  await sharp(source)
    .resize(size, size, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toFile(resolve(target, 'icon-' + size + '.png'));
}
console.log('OneTap PWA icons generated (192px, 512px).');
