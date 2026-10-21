import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { walk } from '../scripts/archive.mjs';

const home = readFileSync('dist/index.html', 'utf8');
const scripts = (html) => [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
const googleTag = (html) => scripts(html).filter(([, attributes]) => attributes.includes('googletagmanager.com/gtag/js'));
const initialization = (html) => scripts(html).filter(([, , code]) => code.includes('window.dataLayer'));
const tags = googleTag(home);
const measurementId = tags[0]?.[1].match(/\?id=(G-[A-Z0-9]+)"/)?.[1];

test('the optional Google tag is consistent across every page using the shared layout', () => {
  if (process.env.PUBLIC_GOOGLE_ANALYTICS_ID !== undefined) {
    assert.equal(measurementId, process.env.PUBLIC_GOOGLE_ANALYTICS_ID.trim() || undefined);
  }
  assert.equal(tags.length, measurementId ? 1 : 0);
  for (const file of walk('dist').filter((file) => file.endsWith('.html'))) {
    const html = readFileSync(file, 'utf8');
    // Only layout pages share the analytics integration.
    if (!html.includes('class="site-shell"')) continue;
    const pageTags = googleTag(html);
    const pageInitialization = initialization(html);
    assert.equal(pageTags.length, measurementId ? 1 : 0, file);
    assert.equal(pageInitialization.length, measurementId ? 1 : 0, file);
    if (measurementId) {
      assert.ok(pageTags[0][1].includes(`src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"`), file);
      assert.match(pageTags[0][1], /\basync\b/, file);
      assert.ok(html.indexOf(pageTags[0][0]) < html.indexOf('</head>'), file);
    }
  }
});

test('initialization queues one GA4 configuration and preserves any existing data layer', () => {
  if (!measurementId) {
    assert.equal(initialization(home).length, 0);
    return;
  }
  const code = initialization(home)[0][2];
  for (const existing of [undefined, [['existing-event']]]) {
    const window = existing ? { dataLayer: existing } : {};
    const start = existing?.length || 0;
    runInNewContext(code, { window });
    if (existing) assert.equal(window.dataLayer, existing);
    const events = window.dataLayer.slice(start).map((args) => Array.from(args));
    assert.equal(events.length, 2);
    assert.equal(events[0][0], 'js');
    assert.equal(Object.prototype.toString.call(events[0][1]), '[object Date]');
    assert.deepEqual(JSON.parse(JSON.stringify(events[1])), ['config', measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    }]);
  }
});

test('English and French privacy disclosures match the built analytics configuration', () => {
  for (const file of ['dist/privacy/index.html', 'dist/fr/confidentialite/index.html']) {
    const html = readFileSync(file, 'utf8');
    assert.equal(html.includes('href="https://policies.google.com/technologies/partner-sites"'), Boolean(measurementId), file);
    assert.equal(html.includes('Google Signals'), Boolean(measurementId), file);
    assert.equal(html.includes(file.includes('/fr/') ? 'aucun cookie de suivi' : 'no tracking cookies'), !measurementId, file);
  }
});
