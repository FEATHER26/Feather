import sharp from 'sharp';
import { readdirSync, mkdirSync } from 'fs';
import { join, parse } from 'path';

const QUALITY = 92;
const MAX_LONG_SIDE = 1400;
const srcDir = '.';
const outDir = './webp';

mkdirSync(outDir, { recursive: true });

const files = readdirSync(srcDir).filter(f =>
  /\.(jpg|jpeg|png)$/i.test(f) && !f.startsWith('node_modules') && !f.startsWith('webp') && f !== 'convert.mjs'
);

const usedNames = new Set();

for (const file of files) {
  const name = parse(file).name;
  let outName = name;
  let counter = 2;
  while (usedNames.has(outName)) {
    outName = `${name}_${counter}`;
    counter++;
  }
  usedNames.add(outName);

  try {
    const metadata = await sharp(join(srcDir, file)).metadata();
    const longest = Math.max(metadata.width, metadata.height);
    const isPng = file.toLowerCase().endsWith('.png');
    const oldSize = metadata.size || 0;

    const opts = {};
    if (longest > MAX_LONG_SIDE) {
      if (metadata.width >= metadata.height) {
        opts.width = MAX_LONG_SIDE;
      } else {
        opts.height = MAX_LONG_SIDE;
      }
    }

    const pipeline = sharp(join(srcDir, file));
    if (opts.width || opts.height) {
      pipeline.resize({ ...opts, withoutEnlargement: true });
    }

    const webpOpts = { quality: QUALITY };
    if (isPng) webpOpts.lossless = true;
    await pipeline.webp(webpOpts).toFile(join(outDir, `${outName}.webp`));

    const newMeta = await sharp(join(outDir, `${outName}.webp`)).metadata();
    const newSize = newMeta.size || 0;
    const pct = oldSize ? ((1 - newSize / oldSize) * 100).toFixed(1) : '??';
    const dims = `${metadata.width}x${metadata.height}`;
    const newDims = `${newMeta.width}x${newMeta.height}`;
    const oldKb = (oldSize / 1024).toFixed(0);
    const newKb = (newSize / 1024).toFixed(0);
    console.log(`${pct.padStart(5)}%  ${oldKb.padStart(6)}KB → ${newKb.padStart(5)}KB  ${dims.padStart(11)}→ ${newDims.padStart(11)}  ${outName}.webp`);
  } catch (err) {
    console.error(`✖ ${file}: ${err.message}`);
  }
}

const total = readdirSync(outDir).filter(f => f.endsWith('.webp')).length;
console.log(`\nDone! ${total} webp images in webp/`);
