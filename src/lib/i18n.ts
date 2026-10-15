export type Language = 'en' | 'fr';
export type Page =
  | 'home'
  | 'writing'
  | 'projects'
  | 'piggy'
  | 'podcast'
  | 'about'
  | 'photos'
  | 'contact'
  | 'privacy';
export const paths: Record<Page, Record<Language, string>> = {
  home: { en: '/', fr: '/fr/' },
  writing: { en: '/writing/', fr: '/fr/articles/' },
  projects: { en: '/projects/', fr: '/fr/projets/' },
  piggy: { en: '/projects/piggy/', fr: '/fr/projets/piggy/' },
  podcast: { en: '/podcast/', fr: '/fr/podcast/' },
  about: { en: '/about/', fr: '/fr/a-propos/' },
  photos: { en: '/photos/', fr: '/fr/photos/' },
  contact: { en: '/contact/', fr: '/fr/contact/' },
  privacy: { en: '/privacy/', fr: '/fr/confidentialite/' },
};
export const opposite = (language: Language): Language => (language === 'en' ? 'fr' : 'en');
export const labels = {
  en: {
    home: 'Home',
    writing: 'Writing',
    projects: 'Projects',
    piggy: 'Piggy',
    podcast: 'Podcast',
    about: 'About',
    photos: 'Photo album',
    contact: 'Contact',
    privacy: 'Privacy',
    allWriting: 'All writing',
    read: 'Read the article',
    latest: 'From the archive',
    back: 'Back to writing',
    listen: 'Listen in French',
    explore: 'Explore my work',
    talk: 'Let’s talk',
    software: 'Software & technology',
    money: 'Money & decisions',
    society: 'Society & ideas',
    all: 'Everything',
    minutes: 'min read',
    original: 'Original article',
    summary: 'Summary',
    skip: 'Skip to content',
  },
  fr: {
    home: 'Accueil',
    writing: 'Articles',
    projects: 'Projets',
    piggy: 'Piggy',
    podcast: 'Podcast',
    about: 'À propos',
    photos: 'Album photo',
    contact: 'Contact',
    privacy: 'Confidentialité',
    allWriting: 'Tous les articles',
    read: 'Lire l’article',
    latest: 'Dans les archives',
    back: 'Retour aux articles',
    listen: 'Écouter en français',
    explore: 'Découvrir mes projets',
    talk: 'Discutons',
    software: 'Logiciel et technologie',
    money: 'Argent et décisions',
    society: 'Société et idées',
    all: 'Tout',
    minutes: 'min de lecture',
    original: 'Article original',
    summary: 'Résumé',
    skip: 'Aller au contenu',
  },
};
export const formatDate = (date: string | Date, language: Language) =>
  new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(typeof date === 'string' ? `${date.slice(0, 10)}T12:00:00Z` : date));
export const social = {
  github: 'https://github.com/aubm',
  linkedin: 'https://www.linkedin.com/in/aurelienbaumann/',
  piggy: 'https://getpiggy.app/',
  buyOrRent: 'https://buy-or-rent.getpiggy.app/',
  medium: 'https://medium.com/@kendo5731',
  optimism:
    'https://medium.com/@kendo5731/no-prize-for-pessimism-why-optimism-drives-innovation-1a277d9c9ded',
  apple: 'https://podcasts.apple.com/ca/podcast/revues-de-code/id1783421651',
  podbean: 'https://aubm.podbean.com/',
};
