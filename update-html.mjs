import { readFileSync, writeFileSync, readdirSync } from 'fs';

const htmlFiles = readdirSync('.').filter(f => f.endsWith('.html'));

const specialCases = {
  'sos.png': 'webp/sos_2.webp',
};

for (const file of htmlFiles) {
  let html = readFileSync(file, 'utf-8');
  let count = 0;

  html = html.replace(/<img\s+([^>]*?)>/gi, (match, attrs) => {
    // Skip if already wrapped in a picture (shouldn't happen on first run)
    // Extract src
    const srcMatch = attrs.match(/src="([^"]*)"/i);
    if (!srcMatch) return match;
    const src = srcMatch[1].trim();
    if (!src || src === '') return match;

    const isImageFile = /\.(jpg|jpeg|png)$/i.test(src);
    if (!isImageFile) return match;

    // Determine webp path
    const fileName = src.split('/').pop();
    const webpSrc = specialCases[fileName] || `webp/${fileName.replace(/\.(jpg|jpeg|png)$/i, '.webp')}`;

    let cleanAttrs = attrs.trimEnd();
    const selfClosing = cleanAttrs.endsWith('/');
    if (selfClosing) cleanAttrs = cleanAttrs.slice(0, -1).trimEnd();

    // Add loading="lazy" if not present
    if (!/loading\s*=/i.test(cleanAttrs)) {
      cleanAttrs += ' loading="lazy"';
    }

    const closing = selfClosing ? ' />' : '>';
    count++;
    return `<picture>\n  <source srcset="${webpSrc}" type="image/webp">\n  <img ${cleanAttrs}${closing}\n</picture>`;
  });

  if (count > 0) {
    writeFileSync(file, html, 'utf-8');
    console.log(`✓ ${file}: ${count} images updated`);
  } else {
    console.log(`- ${file}: no images to update`);
  }
}

console.log('\nDone!');
