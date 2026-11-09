// Generates 1200x630 social previews for blog articles.
// Source images live in src/assets/blog, output goes to public/blog.
// Run with: node scripts/generate-blog-images.mjs
import { mkdir, readdir } from 'node:fs/promises';
import sharp from 'sharp';

const SOURCE_DIR = 'src/assets/blog';
const OUTPUT_DIR = 'public/blog';
const WIDTH = 1200;
const HEIGHT = 630;

await mkdir(OUTPUT_DIR, { recursive: true });

const files = (await readdir(SOURCE_DIR)).filter((file) =>
  /\.(png|jpe?g|webp)$/i.test(file),
);

for (const file of files) {
  const source = `${SOURCE_DIR}/${file}`;
  const output = `${OUTPUT_DIR}/${file.replace(/\.(png|jpe?g|webp)$/i, '.jpg')}`;

  // Pad with the artwork's own background colour so the letterbox is seamless.
  const { data } = await sharp(source)
    .extract({ left: 0, top: 0, width: 1, height: 1 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const background = { r: data[0], g: data[1], b: data[2] };

  const contained = await sharp(source)
    .resize({ width: WIDTH, height: HEIGHT, fit: 'inside' })
    .toBuffer();

  await sharp({ create: { width: WIDTH, height: HEIGHT, channels: 3, background } })
    .composite([{ input: contained, gravity: 'center' }])
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(output);

  console.log(`Wrote ${output} (background ${background.r},${background.g},${background.b})`);
}
