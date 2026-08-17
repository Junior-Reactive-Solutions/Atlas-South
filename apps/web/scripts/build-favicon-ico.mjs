/**
 * One-time build step: packages the existing favicon-16.png and favicon-32.png into a
 * single multi-resolution favicon.ico.
 *
 * Why hand-rolled instead of a library: no image-processing package (sharp, imagemagick,
 * etc.) is installed in this environment, and none is needed — the ICO container format
 * has supported embedding PNG-compressed frames directly since Windows Vista (universally
 * supported by every current browser), so this just wraps the two PNGs we already have in
 * an ICONDIR header rather than re-encoding any pixels. That also means it's lossless and
 * needs re-running only if favicon-16.png/favicon-32.png themselves change.
 *
 * ICO layout: a 6-byte ICONDIR header, one 16-byte ICONDIRENTRY per image, then the raw
 * image bytes back to back (PNG frames here) — see MS-ICO / Wikipedia's ICO file format.
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '../public');

const sources = [
  { path: resolve(publicDir, 'favicon-16.png'), size: 16 },
  { path: resolve(publicDir, 'favicon-32.png'), size: 32 },
];

const images = sources.map((s) => ({ ...s, data: readFileSync(s.path) }));

const HEADER_SIZE = 6;
const ENTRY_SIZE = 16;
const dirSize = HEADER_SIZE + ENTRY_SIZE * images.length;

const header = Buffer.alloc(HEADER_SIZE);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: 1 = icon
header.writeUInt16LE(images.length, 4); // image count

let offset = dirSize;
const entries = [];
for (const img of images) {
  const entry = Buffer.alloc(ENTRY_SIZE);
  entry.writeUInt8(img.size === 256 ? 0 : img.size, 0); // width (0 means 256)
  entry.writeUInt8(img.size === 256 ? 0 : img.size, 1); // height
  entry.writeUInt8(0, 2); // color palette count (0 = no palette, true color)
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(img.data.length, 8); // size of image data
  entry.writeUInt32LE(offset, 12); // offset of image data from start of file
  entries.push(entry);
  offset += img.data.length;
}

const ico = Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
const outPath = resolve(publicDir, 'favicon.ico');
writeFileSync(outPath, ico);
console.log(`Wrote ${outPath} (${ico.length} bytes, ${images.length} sizes: ${images.map((i) => i.size).join('/')})`);
