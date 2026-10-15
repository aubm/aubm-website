import { defineMiddleware } from 'astro:middleware';

// Apply to rendered HTML so archive sources stay byte-for-byte unchanged.
// This runs during static builds as well as local development; no browser script is needed.
export const onRequest = defineMiddleware(async ({ url, site }, next) => {
  const response = await next();
  if (!response.headers.get('content-type')?.includes('text/html')) return response;

  const siteHost = (site || url).hostname.replace(/^www\./, '');
  const html = (await response.text()).replace(
    /<!--[\s\S]*?-->|<(script|style|textarea)\b[^>]*>[\s\S]*?<\/\1\s*>|<a\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi,
    (tag: string) => {
      if (!/^<a\s/i.test(tag)) return tag;
      let attributes = tag.slice(2, -1);
      const fields = [
        ...attributes.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g),
      ];
      const value = (name: string) => {
        const field = fields.find((item) => item[1].toLowerCase() === name);
        return field ? (field[2] ?? field[3] ?? field[4] ?? '') : '';
      };
      const href = value('href');
      if (!href) return tag;
      let destination: URL;
      try {
        destination = new URL(href, url);
      } catch {
        return tag;
      }
      if (!['http:', 'https:'].includes(destination.protocol)) return tag;
      if (
        destination.origin === url.origin ||
        destination.hostname.replace(/^www\./, '') === siteHost
      )
        return tag;

      const relations = new Set(value('rel').split(/\s+/).filter(Boolean));
      relations.delete('opener');
      relations.add('noopener');
      relations.add('noreferrer');
      // Preserve every other attribute, including existing rel tokens such as nofollow.
      for (const field of fields.reverse()) {
        if (['target', 'rel'].includes(field[1].toLowerCase())) {
          attributes =
            attributes.slice(0, field.index) + attributes.slice(field.index! + field[0].length);
        }
      }
      const rel = [...relations].join(' ').replace(/"/g, '&quot;');
      return `<a${attributes.trimEnd()} target="_blank" rel="${rel}">`;
    },
  );
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  return new Response(html, { status: response.status, statusText: response.statusText, headers });
});
