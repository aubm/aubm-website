import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import {
  archiveDigest,
  bundleAssets,
  walk,
  postsDirectory,
  postLocation,
} from '../scripts/archive.mjs';

test('all 29 original archive files retain their pre-redesign bytes and paths', () => {
  assert.equal(walk(postsDirectory).length, 29);
  assert.equal(archiveDigest(), '9a75e4ee87393095e978e82df981ae1d12f75cc8c8d09a60b79bc62844306010');
});
test('every original article is built at its existing URL with its original title and date', () => {
  const originals = walk(postsDirectory).filter((file) => file.endsWith('.md'));
  assert.equal(originals.length, 20);
  for (const file of originals) {
    const source = readFileSync(file, 'utf8');
    const { data } = matter(source);
    const { url, language } = postLocation(file);
    const output = readFileSync(path.join('dist', url, 'index.html'), 'utf8');
    assert.ok(output.includes(`<html lang="${language}"`), url);
    const title = data.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    assert.ok(output.includes(title), `Original title: ${url}`);
    const originalDate = source.match(/^date:\s*(.+)$/m)?.[1].trim();
    assert.ok(output.includes(`datetime="${originalDate}"`), `Original date: ${url}`);
    assert.ok(!/<script\b[^>]*src="https?:/.test(output), `No external script: ${url}`);
    assert.ok(!/<iframe\b/.test(output), `No automatic video request: ${url}`);
  }
});
test('all original bundle images are copied byte-for-byte to their article paths', () => {
  const assets = bundleAssets();
  assert.equal(assets.length, 9);
  for (const { source, url } of assets)
    assert.deepEqual(readFileSync(path.join('dist', url)), readFileSync(source), url);
});
test('existing feed endpoints and the original canonical redirect survive', () => {
  for (const feed of [
    'index.xml',
    'fr/index.xml',
    'posts/index.xml',
    'fr/posts/index.xml',
    'tags/golang/index.xml',
    'fr/tags/politics/index.xml',
  ]) {
    const output = readFileSync(path.join('dist', feed), 'utf8');
    assert.ok(output.includes('<rss version="2.0"'), feed);
    assert.ok(
      output.includes(`<language>${feed.startsWith('fr/') ? 'fr' : 'en'}</language>`),
      feed,
    );
  }
  const redirect = readFileSync(
    'dist/posts/le-moment-le-plus-triste-du-z-event-2022/index.html',
    'utf8',
  );
  assert.ok(redirect.includes('http-equiv="refresh"'));
  assert.ok(
    redirect.includes('https://www.aubm.net/fr/posts/the-saddest-moment-of-the-z-event-2022/'),
  );
  assert.ok(
    !readFileSync('dist/index.xml', 'utf8').includes(
      '/posts/le-moment-le-plus-triste-du-z-event-2022/',
    ),
  );
});
test('missing translations are labeled summaries and do not claim to be translated originals', () => {
  const summary = readFileSync('dist/writing/original/la-depression-joyeuse/index.html', 'utf8');
  assert.ok(summary.includes('AI-generated summary — this is not the original article.'));
  assert.ok(summary.includes('href="/fr/posts/la-depression-joyeuse/"'));
  assert.ok(summary.includes('noindex,follow'));
  const original = readFileSync('dist/fr/posts/la-depression-joyeuse/index.html', 'utf8');
  assert.ok(!/<link\b[^>]*hreflang="en"/.test(original));
  const bilingual = readFileSync(
    'dist/posts/everybody-should-play-dungeons-and-dragons/index.html',
    'utf8',
  );
  assert.ok(bilingual.includes('hreflang="fr"'));
});
test('the production artifact keeps the custom domain and is independent of Hugo', () => {
  assert.equal(readFileSync('dist/CNAME', 'utf8').trim(), 'www.aubm.net');
  for (const file of [
    'index.html',
    'fr/index.html',
    '404.html',
    'sitemap.xml',
    'robots.txt',
    'images/social-card.png',
  ])
    assert.ok(existsSync(path.join('dist', file)), file);
  const home = readFileSync('dist/index.html', 'utf8');
  assert.ok(!/google-analytics|adsbygoogle|disqus|fonts.googleapis/.test(home));
});
