import { posts } from '../lib/posts';
import { paths } from '../lib/i18n';
import { episodes } from '../data/editorial';
export function GET() {
  const urls = [
    ...Object.values(paths).flatMap((page) => [page.en, page.fr]),
    ...posts.filter((post) => !post.unlisted).map((post) => post.url),
    ...episodes.flatMap((episode) => [`/podcast/${episode.id}/`, `/fr/podcast/${episode.id}/`]),
  ];
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>https://www.aubm.net${url}</loc></url>`).join('')}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
}
