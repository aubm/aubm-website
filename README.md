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

`npm run test:browser` checks the built site with an existing Chrome/Chromium installation and creates desktop/mobile screenshots in `.review/`. Set `CHROME_PATH` if Chrome is not at `/usr/bin/google-chrome`. It does not download or install a browser.

## Content and URLs

- **Original `content/posts` files are preserved byte-for-byte**, including front matter, filenames, and bundle images. `npm run check` and the archive tests verify the pre-redesign checksum. Article revisions belong in a separate PR; intentionally update the checksum only in that future content PR.
- The new renderer reads the existing YAML-front-matter Markdown directly. Raw HTML, code blocks, heading anchors, publication dates, `/posts/` and `/fr/posts/` paths, and bundle-relative image URLs remain supported.
- Existing `/index.xml`, `/fr/index.xml`, section feeds, tag pages, and tag feeds remain available. Unlisted canonical-redirect articles retain their destination.
- New bilingual editorial descriptions, homepage selections, and podcast metadata live in `src/data/editorial.ts`, outside the published archive. A missing translation leads to a clearly labeled AI-generated summary and the original, rather than silently switching to the homepage. Summary pages are excluded from search indexing and are not advertised as full translations.
- Medium articles are curated in `src/data/medium.ts` from the author’s public RSS feed. All six verified entries appear as tiles in the writing catalog, with three selected on the homepage. They retain their published titles, dates, and original language, use localized descriptions, and link directly to Medium with a visible destination label. No article bodies are imported, and no live feed request runs in the visitor’s browser or during builds.
- Future AI-generated full translations must be separate files/pages, prominently labeled as AI-generated, and link to the unchanged original. No full article translations are introduced in this version.

Routes are declared in `src/lib/i18n.ts`; shared templates are in `src/components/` and `src/layouts/`. The visual system lives in `src/styles/global.css`. `static/` is the public directory. `scripts/archive.mjs` preserves Hugo bundle media in both development and production.

## Images and publication review

The portrait is a metadata-stripped copy of the supplied black-and-white profile photograph, framed for the existing square photo cards. Piggy’s actual logo and the podcast’s existing artwork are used without inventing product screenshots. The music vignette uses the supplied black-and-white guitar photograph, cropped with the rosette centered. The nature card uses `running-water.webp` and links to a bilingual album of all 26 supplied nature photographs at `/photos/` and `/fr/photos/`. The RPG visual is a small SVG illustration.

The first version uses the verified LinkedIn profile for contact; no new email alias, product pricing, maintenance badge, or unpublished article is invented. Employer/project descriptions and new structural copy should receive the owner’s editorial review. Private details, family information, and live locations do not belong in the new pages.

Fonts and images are local. There are no analytics, advertisements, Disqus, autoplay, or remote players. Legacy article scripts are omitted and video embeds become deliberate outbound links at render time; their Markdown sources remain untouched.

Off-site HTTP(S) links open in a new tab with `noopener noreferrer`. `src/middleware.ts` adds these attributes to rendered HTML, including legacy article links, without editing the original Markdown. Internal navigation and language switching retain the current tab.

Buy or Rent is featured on the homepage and Projects page in both languages. Its screenshot shows the public calculator’s default example scenario, not personal financial data; visitors open the actual calculator to explore their own assumptions.

## Deployment

The existing GitHub Pages `gh-pages` branch and `www.aubm.net` domain are retained. Pull requests run checks and build a downloadable artifact. Pushes to `master` publish the checked static `dist/` output through the existing branch-based Pages workflow. GitHub Pages should continue using the `gh-pages` branch as its publishing source.

The old Hugo configuration, templates, and theme submodule remain as reference during review, but the Astro build does not depend on Hugo or initialize the theme. They can be removed in a later cleanup after the redesign is accepted.

## Photo publication boundary

Original photographs stay outside the repository and the public build. The site publishes only resized WebP derivatives in `static/images/photos/`, with neutral, descriptive names. Source filenames and private file paths are not recorded in public data. Captions and alt text describe the scene without naming locations, dates, people, or equipment. The album includes every supplied nature photograph, including mountain views and scenes with buildings or distant hikers. The guitar and a few nature frames use crops to focus on the subject and reduce surrounding details.

Each derivative was auto-oriented, converted to sRGB, decoded to raw pixels, and encoded again from those pixels. No EXIF, GPS, XMP, IPTC, ICC, editing history, comments, Windows origin sidecars, or original embedded thumbnail is retained. `npm run check` verifies the WebP container chunks, metadata flags, filenames, and absence of appended data. To check the exported copies too, run `node scripts/verify-photo-metadata.mjs dist/images/photos` after building.

`src/data/photos.json` contains only sanitized asset paths, image dimensions, and bilingual descriptions. The album’s optional viewer supports next/previous controls, arrow keys, Escape, and focus restoration; without JavaScript, links open the sanitized image itself. Full source photographs are never linked or copied into `dist/`.

Metadata removal does not make a photograph geographically anonymous: visible scenery can still be recognized, and previously published images can be matched. Review the selected images themselves as well as their metadata before public release.
