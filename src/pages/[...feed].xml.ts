import { posts } from '../lib/posts';
import { paths, type Language } from '../lib/i18n';
export function getStaticPaths() {
  return (['en', 'fr'] as const).flatMap((language) => {
    const prefix = language === 'fr' ? 'fr/' : '';
    const feeds = [
      'index',
      'posts/index',
      'tags/index',
      'categories/index',
      ...[...new Set(posts.flatMap((post) => post.tags))].map(
        (tag) => `tags/${tag.toLowerCase()}/index`,
      ),
    ];
    return feeds.map((feed) => ({
      params: { feed: prefix + feed },
      props: {
        language,
        tag: feed.startsWith('tags/') && feed !== 'tags/index' ? feed.split('/')[1] : undefined,
      },
    }));
  });
}
const xml = (value: string) =>
  value.replace(
    /[<>&"']/g,
    (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]!,
  );
export function GET({ props, url }: { props: { language: Language; tag?: string }; url: URL }) {
  const { language, tag } = props;
  const items = posts.filter(
    (post) =>
      post.language === language &&
      !post.unlisted &&
      (!tag || post.tags.some((item) => item.toLowerCase() === tag)),
  );
  const body = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Aubm</title><link>https://www.aubm.net${paths.writing[language]}</link><description>${language === 'fr' ? 'Les articles d’Aurélien Baumann' : 'Writing by Aurélien Baumann'}</description><language>${language}</language><atom:link href="https://www.aubm.net${url.pathname}" rel="self" type="application/rss+xml"/>${items.map((post) => `<item><title>${xml(post.title)}</title><link>https://www.aubm.net${post.url}</link><guid isPermaLink="true">https://www.aubm.net${post.url}</guid><pubDate>${new Date(post.date).toUTCString()}</pubDate><description>${xml(post.summary[language])}</description></item>`).join('')}</channel></rss>`;
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
