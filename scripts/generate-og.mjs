// Generates the 1200x630 social preview image (public/og.png).
// Run with: node scripts/generate-og.mjs
import sharp from 'sharp';

const WIDTH = 1200;
const HEIGHT = 630;
const PHOTO_SIZE = 300;

const INK = '#1b1a17';
const INK_SOFT = '#6b6a64';
const PAPER = '#fbfaf8';
const BRAND = '#d95b24';

const photoLeft = WIDTH - 96 - PHOTO_SIZE;
const photoTop = (HEIGHT - PHOTO_SIZE) / 2;

const background = `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${WIDTH}" height="${HEIGHT}" fill="${PAPER}" />
    <rect x="0" y="0" width="${WIDTH}" height="6" fill="${BRAND}" />
    <text x="96" y="150" font-family="DejaVu Sans" font-size="22" font-weight="bold"
      letter-spacing="6" fill="${INK_SOFT}">PORTFOLIO</text>
    <circle cx="104" cy="196" r="7" fill="${BRAND}" />
    <text x="96" y="300" font-family="DejaVu Sans" font-size="66" font-weight="bold"
      fill="${INK}">Abdou A. Ndiaye</text>
    <text x="96" y="358" font-family="DejaVu Sans" font-size="34"
      fill="${INK_SOFT}">Software Engineer</text>
    <text x="96" y="410" font-family="DejaVu Sans" font-size="26"
      fill="${INK_SOFT}">I build thoughtful software that turns complex</text>
    <text x="96" y="446" font-family="DejaVu Sans" font-size="26"
      fill="${INK_SOFT}">ideas into practical, meaningful products.</text>
    <rect x="96" y="${HEIGHT - 108}" width="64" height="3" fill="${INK}" />
    <text x="96" y="${HEIGHT - 64}" font-family="DejaVu Sans" font-size="26"
      fill="${INK}">abdouaziz.dev</text>
  </svg>
`;

const photoMask = Buffer.from(`
  <svg width="${PHOTO_SIZE}" height="${PHOTO_SIZE}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${PHOTO_SIZE}" height="${PHOTO_SIZE}" rx="40" ry="40" fill="#fff" />
  </svg>
`);

const photo = await sharp('public/head.jpg')
  .resize(PHOTO_SIZE, PHOTO_SIZE, { fit: 'cover', position: 'top' })
  .composite([{ input: photoMask, blend: 'dest-in' }])
  .png()
  .toBuffer();

await sharp(Buffer.from(background))
  .composite([{ input: photo, left: Math.round(photoLeft), top: Math.round(photoTop) }])
  .png({ compressionLevel: 9 })
  .toFile('public/og.png');

console.log('Wrote public/og.png');
