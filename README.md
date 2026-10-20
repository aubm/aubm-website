# aubm.net

Aurélien Baumann’s bilingual personal site, built with Astro and published as static files on GitHub Pages.

## Local development

Use Node.js 22.12 or newer (CI uses Node 24) and npm. No global tooling is required.

```sh
npm ci
npm run dev
```

Open the printed local URL (normally `http://localhost:4321`). English lives at `/`, French at `/fr/`.

```sh
npm run check
npm run build
npm test
npm run preview
```

`npm run test:browser` checks the built site with an existing Chrome/Chromium installation and creates desktop/mobile screenshots in `.review/`. The calculator response is replaced with a local fixture so these checks do not depend on the live service. They verify the embedded form, screenshot switching, blocked-frame recovery, and no-JavaScript/unsupported-iframe fallbacks, while rejecting unrelated external requests. Set `CHROME_PATH` if Chrome is not at `/usr/bin/google-chrome`. It does not download or install a browser.

## Content and URLs

- **Original `content/posts` files are preserved byte-for-byte**, including front matter, filenames, and bundle images. `npm run check` and the archive tests verify the pre-redesign checksum. Article revisions belong in a separate PR; intentionally update the checksum only in that future content PR.
- The new renderer reads the existing YAML-front-matter Markdown directly. Raw HTML, code blocks, heading anchors, publication dates, `/posts/` and `/fr/posts/` paths, and bundle-relative image URLs remain supported.
- Existing `/index.xml`, `/fr/index.xml`, section feeds, tag pages, and tag feeds remain available. Unlisted canonical-redirect articles retain their destination.
- New bilingual editorial descriptions, homepage selections, and podcast metadata live in `src/data/editorial.ts`, outside the published archive. A missing translation leads to a clearly labeled AI-generated summary and the original, rather than silently switching to the homepage. Summary pages are excluded from search indexing and are not advertised as full translations.
- Medium articles are curated in `src/data/medium.ts` from the author’s public RSS feed. All six verified entries appear as tiles in the writing catalog, with three selected on the homepage. They retain their published titles, dates, and original language, use localized descriptions, and link directly to Medium with a visible destination label. No article bodies are imported, and no live feed request runs in the visitor’s browser or during builds.
- Future AI-generated full translations must be separate files/pages, prominently labeled as AI-generated, and link to the unchanged original. No full article translations are introduced in this version.

Routes are declared in `src/lib/i18n.ts`; shared templates are in `src/components/` and `src/layouts/`. The visual system lives in `src/styles/global.css`. `static/` is the public directory. `scripts/archive.mjs` preserves Hugo bundle media in both development and production.

## Images and publication review

The portrait is a metadata-stripped copy of the supplied black-and-white profile photograph, framed for the existing square photo cards. Piggy’s actual logo and the podcast’s existing artwork are used without inventing product screenshots. The music vignette uses the supplied black-and-white guitar photograph, cropped with the rosette centered. The nature card uses `running-water.webp` and links to a bilingual album of all 26 supplied nature photographs at `/photos/` and `/fr/photos/`. The RPG cards on the homepage and About page use the original AI-generated landscape from The Campaign Trail and link to the matching English or French journal. The same locally hosted WebP illustrates its Projects listing. The image is stored in `static/images/the-campaign-trail.webp`; shared image metadata and destination URLs live in `src/data/campaign-trail.ts`.

The first version uses the verified LinkedIn profile for contact; no new email alias, product pricing, maintenance badge, or unpublished article is invented. Employer/project descriptions and new structural copy should receive the owner’s editorial review. Private details, family information, and live locations do not belong in the new pages.

The site’s own fonts and images are local, with no advertisements, Disqus, autoplay, or remote video players. Google Analytics is optional and disabled until a measurement ID is configured (see below). The Projects page’s live Buy or Rent calculator is an explicit external-service exception: it loads its own resources, including jsDelivr and Google Analytics, when its lazy iframe approaches the viewport. The privacy page documents this behavior. Legacy article scripts are omitted and video embeds become deliberate outbound links at render time; their Markdown sources remain untouched.

Off-site HTTP(S) links open in a new tab with `noopener noreferrer`. `src/middleware.ts` adds these attributes to rendered HTML, including legacy article links, without editing the original Markdown. Internal navigation and language switching retain the current tab.

Buy or Rent is featured on the homepage and Projects page in both languages. The homepage retains its original static screenshot card. On the Projects page, a linked screenshot progressively enhances into a lazy-loaded, sandboxed iframe with a localized title and no referrer, using the same position and 1440:1050 aspect ratio as the screenshot. The demo scrolls inside that existing frame rather than enlarging the card. The external-tool link remains available. A visible screenshot toggle removes the live iframe, including when a browser blocks it; switching back starts a fresh calculator. Without JavaScript or iframe support, the local screenshot remains in place. Iframe load/error events cannot reliably detect cross-origin failures, so the screenshot toggle is always available while the live view is selected. The screenshot shows the public calculator’s default example scenario, not personal financial data.

## Deployment

The existing GitHub Pages `gh-pages` branch and `www.aubm.net` domain are retained. Pull requests run checks and build a downloadable artifact. Pushes to `master` publish the checked static `dist/` output through the existing branch-based Pages workflow. GitHub Pages should continue using the `gh-pages` branch as its publishing source.

The old Hugo configuration, templates, and theme submodule remain as reference during review, but the Astro build does not depend on Hugo or initialize the theme. They can be removed in a later cleanup after the redesign is accepted.

## Google Analytics (GA4)

Analytics is optional. When `PUBLIC_GOOGLE_ANALYTICS_ID` is empty, the site emits no Google tag or analytics initialization. `npm run dev` never loads analytics, even if the variable is set. Configured production builds load Google's asynchronous `gtag.js` once per page through the shared layout; its `config` command records the page view. Navigation uses full page loads, so no additional navigation listener or manual `page_view` is needed. Google Signals and advertising personalization are disabled in the tag configuration. Standard analytics cookies are used; this integration loads immediately and does not include a consent dialog. The English and French privacy pages reflect whether analytics is configured.

### Set up and enable

1. Open [Google Analytics](https://analytics.google.com/) and create an account if needed. In **Admin → Create → Property**, create a GA4 property for `aubm.net` with your preferred reporting time zone and currency.
2. Under **Admin → Data collection and modification → Data streams**, add a **Web** stream for `https://www.aubm.net`. Enhanced measurement can remain enabled to capture standard interactions.
3. Copy the stream's **Measurement ID**, beginning with `G-` (not a numeric property/stream ID or a `GTM-` container ID). The site already installs the tag; do not paste another snippet into the templates.
4. In [this repository's Actions variables](https://github.com/aubm/aubm-website/settings/variables/actions), choose **New repository variable**. Name it **`PUBLIC_GOOGLE_ANALYTICS_ID`** and use your `G-…` ID as the value. This is a public identifier embedded in the HTML, so a repository variable is appropriate.
5. Merge the PR. The next `master` build deploys the configured tag. If you add, change, or remove the variable after deployment, run **Actions → Build and publish → Run workflow** on **`master`** to rebuild and republish. Existing HTML does not change until a new build is deployed. PR artifacts always omit analytics.
6. Visit the deployed English and French pages with analytics blocking disabled for your test. Check [Tag Assistant](https://tagassistant.google.com/) and GA's **Realtime** report for page views. Initial collection can take up to 30 minutes; standard reports take longer.

To disable collection, clear/delete the repository variable and rebuild `master`. The embedded Buy or Rent calculator manages its own analytics independently.

For a local production preview, use a test property's ID:

```sh
PUBLIC_GOOGLE_ANALYTICS_ID=G-YOURTESTID npm run build
npm run preview
```

Run browser checks against an unconfigured build (`PUBLIC_GOOGLE_ANALYTICS_ID= npm run build`), since they intentionally reject external requests from the site's own pages. The build-output tests in `npm test` accept either state and verify tag consistency and initialization.

References: [Google's GA4 setup guide](https://support.google.com/analytics/answer/9304153), [Google tag installation](https://developers.google.com/tag-platform/gtagjs), [GA4 configuration fields](https://developers.google.com/analytics/devguides/collection/ga4/reference/config).

## Photo publication boundary

Original photographs stay outside the repository and the public build. The site publishes only resized WebP derivatives in `static/images/photos/`, with neutral, descriptive names. Source filenames and private file paths are not recorded in public data. Captions and alt text describe the scene without naming locations, dates, people, or equipment. The album includes every supplied nature photograph, including mountain views and scenes with buildings or distant hikers. The guitar and a few nature frames use crops to focus on the subject and reduce surrounding details.

Each derivative was auto-oriented, converted to sRGB, decoded to raw pixels, and encoded again from those pixels. No EXIF, GPS, XMP, IPTC, ICC, editing history, comments, Windows origin sidecars, or original embedded thumbnail is retained. `npm run check` verifies the WebP container chunks, metadata flags, filenames, and absence of appended data. To check the exported copies too, run `node scripts/verify-photo-metadata.mjs dist/images/photos` after building.

`src/data/photos.json` contains only sanitized asset paths, image dimensions, and bilingual descriptions. The album’s optional viewer supports next/previous controls, arrow keys, Escape, and focus restoration; without JavaScript, links open the sanitized image itself. Full source photographs are never linked or copied into `dist/`.

Metadata removal does not make a photograph geographically anonymous: visible scenery can still be recognized, and previously published images can be matched. Review the selected images themselves as well as their metadata before public release.
