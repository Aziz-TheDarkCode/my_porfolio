#!/usr/bin/env node
/**
 * Downloads the favicon of every project linked from src/content/projects/*.md
 * into src/assets/favicons/<slug>.<ext>, so the site serves the icons locally
 * instead of hitting a third-party favicon service at runtime.
 *
 * Usage: pnpm favicons
 */
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const projectsDir = path.join(root, 'src', 'content', 'projects');
const outputDir = path.join(root, 'src', 'assets', 'favicons');

const TIMEOUT_MS = 15_000;
const USER_AGENT = 'Mozilla/5.0 (compatible; portfolio-favicons/1.0)';

const EXTENSIONS = ['png', 'svg', 'webp', 'gif', 'jpg', 'ico'];

const EXTENSION_BY_TYPE = {
  'image/png': 'png',
  'image/svg+xml': 'svg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/x-icon': 'ico',
  'image/vnd.microsoft.icon': 'ico',
  'image/ico': 'ico',
};

/** Crisp formats win over legacy bitmap .ico files. */
const FORMAT_SCORE = { svg: 4, png: 3, webp: 2, gif: 1, jpg: 1, ico: 1 };

const readAttr = (tag, name) => {
  const match = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i').exec(tag);
  return match ? (match[2] ?? match[3] ?? match[4]) : undefined;
};

const get = async (url, accept) => {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: { 'user-agent': USER_AGENT, accept },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  return response;
};

/** Identifies the image format from its first bytes. */
const sniffFormat = (bytes) => {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return 'png';
  }
  if (bytes.length >= 6) {
    const header = bytes.subarray(0, 6).toString('ascii');
    if (header === 'GIF87a' || header === 'GIF89a') return 'gif';
  }
  if (bytes.length >= 12 && bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP') {
    return 'webp';
  }
  if (bytes.length >= 4 && bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0x01 && bytes[3] === 0x00) {
    return 'ico';
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'jpg';
  }
  const head = bytes.subarray(0, 512).toString('utf8').trimStart();
  if (head.startsWith('<svg') || (head.startsWith('<?xml') && head.includes('<svg'))) {
    return 'svg';
  }
  return undefined;
};

/** Collects every <link rel="...icon..."> declared by a page, best candidates first. */
const discoverIcons = (html, pageUrl) => {
  const candidates = [];

  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    const rel = (readAttr(tag, 'rel') ?? '').toLowerCase().split(/\s+/);
    const isIcon = rel.includes('icon') || rel.includes('apple-touch-icon') || rel.includes('apple-touch-icon-precomposed');
    if (!isIcon || rel.includes('mask-icon')) continue;

    const href = readAttr(tag, 'href')?.replace(/&amp;/g, '&');
    if (!href) continue;

    let absolute;
    try {
      absolute = new URL(href, pageUrl).toString();
    } catch {
      continue;
    }

    const type = (readAttr(tag, 'type') ?? '').toLowerCase();
    const declared = EXTENSION_BY_TYPE[type];
    const fromPath = path.extname(new URL(absolute).pathname).slice(1).toLowerCase();
    const ext = declared ?? (EXTENSIONS.includes(fromPath) ? fromPath : undefined);
    const size = Number(/(\d+)\s*[x×]\s*(\d+)/.exec(readAttr(tag, 'sizes') ?? '')?.[1] ?? 0);

    candidates.push({ url: absolute, ext, score: FORMAT_SCORE[ext] ?? 0, size });
  }

  candidates.sort((a, b) => b.score - a.score || b.size - a.size);

  // Well-known locations, used only when the markup does not declare anything usable.
  const origin = new URL(pageUrl).origin;
  for (const fallback of ['/favicon.ico', '/favicon.png', '/favicon.svg']) {
    candidates.push({ url: new URL(fallback, origin).toString(), ext: undefined, score: -1, size: 0 });
  }

  return candidates;
};

/** Downloads the first candidate that turns out to be a real image. */
const downloadIcon = async (candidates) => {
  for (const candidate of candidates) {
    try {
      const response = await get(candidate.url, 'image/*,*/*;q=0.8');
      if (!response.ok) continue;

      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length === 0 || bytes.length > 512 * 1024) continue;

      const contentType = (response.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
      const ext = EXTENSION_BY_TYPE[contentType] ?? sniffFormat(bytes);
      if (!ext || !sniffFormat(bytes)) continue;

      return { bytes, ext };
    } catch (error) {
      // Unreachable candidate: try the next one.
    }
  }
  return undefined;
};

const readProject = async (file) => {
  const source = await readFile(path.join(projectsDir, file), 'utf8');
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source)?.[1] ?? '';
  const url = /^url:\s*["']([^"']+)["']/m.exec(frontmatter)?.[1];
  if (!url) return undefined;

  return {
    slug: path.basename(file, path.extname(file)),
    url: url.replace(/&amp;/g, '&'),
  };
};

const removeStale = async (slug, keepExtension) => {
  for (const extension of EXTENSIONS) {
    if (extension === keepExtension) continue;
    await rm(path.join(outputDir, `${slug}.${extension}`), { force: true });
  }
};

const faviconFor = async ({ slug, url }) => {
  let html = '';
  try {
    const response = await get(url, 'text/html');
    if (response.ok) html = await response.text();
  } catch {
    // The page is unreachable, but the icon may still be at a well-known path.
  }

  const icon = await downloadIcon(discoverIcons(html, url));
  if (!icon) return { slug, url, ok: false };

  await writeFile(path.join(outputDir, `${slug}.${icon.ext}`), icon.bytes);
  await removeStale(slug, icon.ext);

  return { slug, url, ok: true, ext: icon.ext, size: icon.bytes.length };
};

const main = async () => {
  await mkdir(outputDir, { recursive: true });

  const files = (await readdir(projectsDir)).filter((file) => /\.mdx?$/.test(file));
  const projects = (await Promise.all(files.map(readProject))).filter(Boolean);

  if (projects.length === 0) {
    console.log('No project URLs found; nothing to do.');
    return;
  }

  const results = await Promise.all(projects.map(faviconFor));

  for (const result of results) {
    if (result.ok) {
      const size = `${(result.size / 1024).toFixed(1)} kB`;
      console.log(`  ✓ ${result.slug}.${result.ext}  (${size})`);
    } else {
      console.log(`  ✗ ${result.slug}  no icon found at ${result.url} (letter tile will be used)`);
    }
  }

  console.log(`\nFavicons written to ${path.relative(root, outputDir)}`);
};

await main();
