import type { Language } from '../lib/i18n';

export interface MediumArticle {
  id: string;
  source: 'medium';
  title: string;
  url: string;
  date: string;
  language: Language;
  topic: 'software' | 'money' | 'society';
  tags: string[];
  summary: Record<Language, string>;
  minutes?: never;
}

// Curated from https://medium.com/feed/@kendo5731 on 2026-10-14.
// Titles, publication dates, languages, and destinations preserve the published metadata.
// Descriptions are short editorial summaries, not copies or translations of the articles.
// Keep this local: rendering and building the site must not depend on a live Medium feed.
export const mediumArticles: MediumArticle[] = [
  {
    id: '1a277d9c9ded',
    source: 'medium',
    title: 'No Prize for Pessimism: Why Optimism Drives Innovation',
    url: 'https://medium.com/@kendo5731/no-prize-for-pessimism-why-optimism-drives-innovation-1a277d9c9ded',
    date: '2025-04-17',
    language: 'en',
    topic: 'software',
    tags: ['podcast', 'technology', 'code', 'optimism'],
    summary: {
      en: 'Curiosity, experimentation, and optimism as a skill for building new things. An English adaptation of Revues de Code.',
      fr: 'La curiosité, l’expérimentation et l’optimisme comme compétence pour innover. Une adaptation en anglais de Revues de Code.',
    },
  },
  {
    id: '95291947751f',
    source: 'medium',
    title: 'Argent magique, entretien avec un adolescent communiste (ils sachent)',
    url: 'https://medium.com/@kendo5731/argent-magique-entretien-avec-un-adolescent-communiste-ils-sachent-95291947751f',
    date: '2024-04-04',
    language: 'fr',
    topic: 'society',
    tags: ['politics', 'en-français'],
    summary: {
      en: 'A satirical dialogue about public debt, wealth, and the appeal of apparently simple political solutions.',
      fr: 'Un dialogue satirique sur la dette publique, la richesse et l’attrait des solutions politiques apparemment simples.',
    },
  },
  {
    id: '93dd286e5e29',
    source: 'medium',
    title: 'You are not ready to buy a home',
    url: 'https://medium.com/@kendo5731/you-are-not-ready-to-buy-a-home-93dd286e5e29',
    date: '2023-12-07',
    language: 'en',
    topic: 'money',
    tags: ['money-management', 'investment', 'personal-finance', 'real-estate', 'budgeting'],
    summary: {
      en: 'Buying versus renting, the costs beyond a mortgage, and questioning the idea that ownership is always the better investment.',
      fr: 'Acheter ou louer, regarder au-delà du crédit et questionner l’idée que devenir propriétaire est toujours le meilleur investissement.',
    },
  },
  {
    id: '5697b0fbd2c9',
    source: 'medium',
    title: 'How I cured my overspending disease',
    url: 'https://medium.com/@kendo5731/how-i-cured-my-overspending-disease-5697b0fbd2c9',
    date: '2023-11-16',
    language: 'en',
    topic: 'money',
    tags: ['lifestyle', 'personal-finance'],
    summary: {
      en: 'Moving beyond the bank balance as a spending guide, and building a more deliberate relationship with money.',
      fr: 'Ne plus se fier au seul solde bancaire pour dépenser et construire une relation plus réfléchie avec son argent.',
    },
  },
  {
    id: '30422b7a56c4',
    source: 'medium',
    title: 'Mes vacances dans l’endroit le plus magique du monde',
    url: 'https://medium.com/hexagone/mes-vacances-dans-lendroit-le-plus-magique-du-monde-30422b7a56c4',
    date: '2023-06-26',
    language: 'fr',
    topic: 'society',
    tags: ['vacation', 'tourism', 'francais-vf', 'ethics'],
    summary: {
      en: 'A visit to Disney World, with a personal look at consumerism, everyday behavior, and the stories we tell ourselves.',
      fr: 'Un séjour à Disney World et un regard personnel sur la consommation, les comportements ordinaires et les histoires qu’on se raconte.',
    },
  },
  {
    id: '999ecf1b4011',
    source: 'medium',
    title: 'Aurélien Barrau, le philosophe qui abhorre l’humanité',
    url: 'https://medium.com/hexagone/aur%C3%A9lien-barrau-le-philosophe-qui-abhorre-lhumanit%C3%A9-999ecf1b4011',
    date: '2023-06-22',
    language: 'fr',
    topic: 'society',
    tags: ['ecology', 'capitalism', 'essay', 'francais-vf', 'society'],
    summary: {
      en: 'A critical response to Aurélien Barrau’s ecological arguments and the vision of humanity behind them.',
      fr: 'Une réponse critique aux arguments écologiques d’Aurélien Barrau et à la vision de l’humanité qui les accompagne.',
    },
  },
];

// A small homepage selection; the complete list remains in the writing catalog.
export const featuredMediumIds = ['1a277d9c9ded', '93dd286e5e29', '5697b0fbd2c9'];
