// Generates the site-wide 1200x630 social preview (public/og.jpg)
// from the brand artwork in src/assets/social-card.jpg.
// Run with: node scripts/generate-og.mjs
import sharp from 'sharp';

const SOURCE = 'src/assets/social-card.jpg';
const OUTPUT = 'public/og.jpg';
const WIDTH = 1200;
const HEIGHT = 630;

// Pad with the artwork's own background colour so the letterbox is seamless.
const { data } = await sharp(SOURCE)
  .extract({ left: 0, top: 0, width: 1, height: 1 })
  .raw()
  .toBuffer({ resolveWithObject: true });
const background = { r: data[0], g: data[1], b: data[2] };

const contained = await sharp(SOURCE)
  .resize({ width: WIDTH, height: HEIGHT, fit: 'inside' })
  .toBuffer();

await sharp({ create: { width: WIDTH, height: HEIGHT, channels: 3, background } })
  .composite([{ input: contained, gravity: 'center' }])
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile(OUTPUT);

console.log(`Wrote ${OUTPUT} (background ${background.r},${background.g},${background.b})`);
