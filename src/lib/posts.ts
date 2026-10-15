import { readFileSync } from 'node:fs';
import matter from 'gray-matter';
import { Marked } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import hljs from 'highlight.js/lib/common';
import { walk, postLocation, postsDirectory } from '../../scripts/archive.mjs';
import { descriptions } from '../data/editorial';
import type { Language } from './i18n';

export interface Post {
  id: string;
  language: Language;
  url: string;
  title: string;
  date: string;
  tags: string[];
  topic: 'software' | 'money' | 'society';
  body: string;
  summary: Record<Language, string>;
  minutes: number;
  unlisted: boolean;
  canonical?: string;
}
const markdown = new Marked({ gfm: true });
markdown.use(gfmHeadingId());
const escape = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
markdown.use({
  renderer: {
    code({ text, lang }) {
      const language = lang?.split(/\s/)[0] || 'text';
      const html = hljs.getLanguage(language)
        ? hljs.highlight(text, { language }).value
        : escape(text);
      return `<pre tabindex="0"><code class="hljs language-${escape(language)}">${html}</code></pre>`;
    },
  },
});
export function readPosts(): Post[] {
  return walk(postsDirectory)
    .filter((file: string) => file.endsWith('.md'))
    .flatMap((file: string) => {
      const source = readFileSync(file, 'utf8');
      const { data, content } = matter(source);
      if (data.draft === true) return [];
      const location = postLocation(file);
      const plain = content
        .replace(/<[^>]*>/g, '')
        .replace(/[#*`\[\]]/g, '')
        .trim();
      const tags: string[] = data.tags || [];
      const topic = tags.some((tag) => ['Golang', 'Kubernetes', 'Git'].includes(tag))
        ? 'software'
        : location.id.includes('personal-finances')
          ? 'money'
          : 'society';
      return [
        {
          ...location,
          language: location.language as Language,
          title: String(data.title),
          date: source.match(/^date:\s*(.+)$/m)?.[1]?.trim() || new Date(data.date).toISOString(),
          tags,
          topic,
          body: content,
          summary: descriptions[location.id] || {
            en: String(data.summary || plain.slice(0, 170)),
            fr: String(data.summary || plain.slice(0, 170)),
          },
          minutes: Math.max(1, Math.round(plain.split(/\s+/).length / 220)),
          unlisted: data.unlisted === true,
          canonical: data.canonical,
        },
      ];
    })
    .sort((a: Post, b: Post) => b.date.localeCompare(a.date));
}
export const posts = readPosts();
export function catalog(language: Language): Post[] {
  const selected = new Map<string, Post>();
  for (const post of posts.filter((post) => !post.unlisted)) {
    if (!selected.has(post.id) || post.language === language) selected.set(post.id, post);
  }
  return [...selected.values()].sort((a, b) => b.date.localeCompare(a.date));
}
export function summaryUrl(post: Post, language: Language) {
  return `${language === 'fr' ? '/fr/articles' : '/writing'}/original/${post.id}/`;
}
export function articleUrl(post: Post, language: Language) {
  return (
    posts.find((item) => item.id === post.id && item.language === language)?.url ||
    summaryUrl(post, language)
  );
}
export function counterpart(post: Post) {
  const language: Language = post.language === 'en' ? 'fr' : 'en';
  return articleUrl(post, language);
}
export function renderBody(body: string) {
  // Presentation-only: preserve every source byte while making external embeds opt-in.
  return String(markdown.parse(body))
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(
      /<iframe\b[^>]*\bsrc="([^"]+)"[^>]*>[\s\S]*?<\/iframe>/gi,
      (_match, src) =>
        `<a class="external-embed" href="${escape(src)}" rel="noopener noreferrer">▶ YouTube <span>↗</span></a>`,
    );
}
