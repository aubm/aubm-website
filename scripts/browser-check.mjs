import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { once } from 'node:events';
import assert from 'node:assert/strict';
import { walk } from './archive.mjs';

const chrome =
  process.env.CHROME_PATH ||
  [
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].find(existsSync);
if (!chrome)
  throw new Error(
    'Set CHROME_PATH to an existing Chrome or Chromium executable. This check will not install a browser.',
  );
const root = path.resolve('dist');
assert.ok(existsSync(path.join(root, 'index.html')), 'Run npm run build first.');
mkdirSync('.review', { recursive: true });
const types = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
};
const server = createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  let file = path.resolve(root, '.' + pathname);
  if (!file.startsWith(root + path.sep) && file !== root) {
    res.writeHead(403).end();
    return;
  }
  if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!existsSync(file)) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(readFileSync(path.join(root, '404.html')));
    return;
  }
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  res.end(readFileSync(file));
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch({ executablePath: chrome, headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce',
  });
  const errors = [];
  const externalRequests = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (!request.url().startsWith(base) && !request.url().startsWith('data:'))
      externalRequests.push(request.url());
  });
  const screenshots = [
    ['/', 'home-desktop', 1440, 1000],
    ['/fr/', 'home-fr-desktop', 1440, 1000],
    ['/', 'home-mobile', 390, 844],
    ['/fr/', 'home-fr-mobile', 390, 844],
    ['/writing/', 'writing-desktop', 1440, 1000],
    ['/projects/', 'projects-desktop', 1440, 1000],
    ['/podcast/', 'podcast-desktop', 1440, 1000],
    ['/posts/everybody-should-play-dungeons-and-dragons/', 'article-mobile', 390, 844],
  ];
  for (const [url, name, width, height] of screenshots) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(base + url, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200, url);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(async () => {
      const images = [...document.images];
      for (const image of images) image.loading = 'eager';
      await Promise.all(
        images.map((image) =>
          image.complete
            ? Promise.resolve()
            : new Promise((resolve) => {
                image.onload = resolve;
                image.onerror = resolve;
              }),
        ),
      );
    });
    assert.equal(
      await page
        .locator('img')
        .evaluateAll((images) => images.filter((image) => image.naturalWidth === 0).length),
      0,
      `Images load: ${url}`,
    );
    await page.screenshot({ path: `.review/${name}.png`, fullPage: true });
    if (name === 'home-desktop') await page.screenshot({ path: '.review/home-first-screen.png' });
  }
  // Exercise filtering and the real counterpart route, rather than just inspecting markup.
  await page.goto(base + '/writing/');
  const total = await page.locator('.writing-card').count();
  assert.ok(total > 10);
  await page.locator('[data-filter="software"]').click();
  const software = await page.locator('.writing-card:visible').count();
  assert.ok(software > 0 && software < total);
  assert.equal(await page.locator('.writing-card:visible:not([data-topic="software"])').count(), 0);
  assert.equal(await page.locator('[data-count]').innerText(), String(software));
  await page.locator('[data-filter="all"]').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('.writing-card:visible').count(), total);
  await page.goto(base + '/posts/everybody-should-play-dungeons-and-dragons/');
  await page.locator('.language-switch').click();
  assert.equal(
    new URL(page.url()).pathname,
    '/fr/posts/everybody-should-play-dungeons-and-dragons/',
  );
  await page.goto(base + '/fr/posts/la-depression-joyeuse/');
  await page.locator('.language-switch').click();
  assert.equal(new URL(page.url()).pathname, '/writing/original/la-depression-joyeuse/');
  assert.ok((await page.locator('.translation-notice').innerText()).includes('AI-generated'));

  // Audit every generated HTML page at the narrowest supported viewport.
  await page.setViewportSize({ width: 320, height: 800 });
  const pages = walk(root).filter((file) => file.endsWith('.html') && !file.endsWith('/404.html'));
  const brokenLinks = new Set();
  const overflow = [];
  for (const file of pages) {
    const route =
      '/' +
      path
        .relative(root, file)
        .replace(/index\.html$/, '')
        .split(path.sep)
        .join('/');
    // This historical page intentionally sends the reader to its canonical target.
    if (route === '/posts/le-moment-le-plus-triste-du-z-event-2022/') continue;
    await page.goto(base + route, { waitUntil: 'load' });
    const audit = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      viewport: innerWidth,
      h1: document.querySelectorAll('main h1').length,
      links: [...document.querySelectorAll('a[href],img[src]')].map((element) =>
        element.getAttribute(element.tagName === 'IMG' ? 'src' : 'href'),
      ),
    }));
    assert.equal(audit.h1, 1, `One main heading: ${route}`);
    if (audit.width > audit.viewport + 1) overflow.push({ route, width: audit.width });
    for (const href of audit.links) {
      if (!href || /^(?:https?:|mailto:|tel:|data:|#)/.test(href)) continue;
      const url = new URL(href, base + route);
      const target = path.join(root, decodeURIComponent(url.pathname));
      if (!existsSync(target)) brokenLinks.add(`${route} → ${url.pathname}`);
    }
  }
  assert.deepEqual([...brokenLinks], [], 'All internal links and images resolve');
  assert.deepEqual(overflow, [], 'No page overflows at 320px');
  assert.deepEqual(errors, [], 'No client-side exceptions');
  assert.deepEqual(externalRequests, [], 'No automatic third-party requests');

  // Navigation and the whole archive remain usable without enhancement.
  const plain = await browser.newPage({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  await plain.goto(base + '/fr/articles/');
  assert.equal(await plain.locator('.writing-card:visible').count(), total);
  await plain.locator('.main-nav a').filter({ hasText: 'Projets' }).click();
  assert.equal(new URL(plain.url()).pathname, '/fr/projets/');
  await plain.close();
  console.log(
    `Browser checks passed: ${pages.length} pages, 320px layouts, filters, language switching, no-JS navigation, local images, and no third-party requests. Screenshots: .review/`,
  );
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
