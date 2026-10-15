import { mediumArticles, type MediumArticle } from '../data/medium';
import { articleUrl, catalog, type Post } from './posts';
import type { Language } from './i18n';

export type WritingItem = Post | MediumArticle;

export function isMediumArticle(item: WritingItem): item is MediumArticle {
  return 'source' in item && item.source === 'medium';
}

export function writingCatalog(language: Language): WritingItem[] {
  return [...catalog(language), ...mediumArticles].sort((a, b) => b.date.localeCompare(a.date));
}

export function writingUrl(item: WritingItem, language: Language) {
  return isMediumArticle(item) ? item.url : articleUrl(item, language);
}
