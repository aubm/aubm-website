// Editorial metadata lives outside the immutable, published Markdown archive.
export const descriptions: Record<string, { en: string; fr: string }> = {
  'everybody-should-play-dungeons-and-dragons': {
    en: 'A few dice, a shared story, and a very good reason to gather around a table.',
    fr: 'Quelques dés, une histoire partagée et une excellente raison de se retrouver autour d’une table.',
  },
  'how-my-programming-skills-helped-me-with-my-personal-finances-part-1': {
    en: 'What happens when a programmer starts asking better questions about money.',
    fr: 'Ce qui se passe quand un développeur commence à se poser de meilleures questions sur son argent.',
  },
  'please-use-dependency-injection-if-not-for-me-do-it-for-your-unit-tests': {
    en: 'A practical case for dependencies that make your Go code easier to test.',
    fr: 'Un plaidoyer pratique pour des dépendances qui facilitent les tests de votre code Go.',
  },
  'being-the-best-is-not-enough': {
    en: 'Technical ability matters. So does the way we work with the people around us.',
    fr: 'Les compétences techniques comptent. Notre façon de travailler avec les autres aussi.',
  },
  'la-depression-joyeuse': {
    en: 'A personal response to the ideas of degrowth and the questions they raise.',
    fr: 'Une réaction personnelle aux idées de la décroissance et aux questions qu’elles soulèvent.',
  },
  '3-ways-of-shooting-yourself-in-the-foot-when-writing-applications-in-go': {
    en: 'Concurrency, channels, and cancellation: three ways Go applications can surprise you.',
    fr: 'Concurrence, canaux et annulation : trois façons de se laisser surprendre en Go.',
  },
  'extending-the-kubernetes-api': {
    en: 'Exploring custom resources and the possibilities of the Kubernetes API.',
    fr: 'Explorer les ressources personnalisées et les possibilités de l’API Kubernetes.',
  },
  'the-case-of-a-git-linear-history': {
    en: 'Why the shape of a Git history can make a difference to everyday development.',
    fr: 'Pourquoi la forme de l’historique Git peut changer le quotidien du développement.',
  },
  'the-certified-kubernetes-application-developer-and-administrator-certifications': {
    en: 'Reflections on preparing for the CKAD and CKA certifications.',
    fr: 'Un retour sur la préparation des certifications CKAD et CKA.',
  },
  'how-to-better-promote-your-bad-ideas': {
    en: 'A tour of the reasoning shortcuts that make a bad argument sound convincing.',
    fr: 'Un tour des raccourcis de raisonnement qui rendent un mauvais argument convaincant.',
  },
  'i-like-slack-as-much-as-i-like-being-interrupted-at-my-desk': {
    en: 'A reflection on interruptions, communication, and the space we need to think.',
    fr: 'Une réflexion sur les interruptions, la communication et l’espace nécessaire pour réfléchir.',
  },
  'the-saddest-moment-of-the-z-event-2022': {
    en: 'Charity, environmental choices, and the politics of a shared responsibility.',
    fr: 'Charité, choix environnementaux et politique d’une responsabilité partagée.',
  },
  'je-vivrai-dans-le-pays-avec-l-etat-le-moins-obese': {
    en: 'An opinion on the role of the state, public spending, and individual choices.',
    fr: 'Un point de vue sur le rôle de l’État, les dépenses publiques et les choix individuels.',
  },
  'l-isf-pour-sauver-notre-systeme-de-retraites': {
    en: 'Examining a proposal to fund pensions through a wealth tax.',
    fr: 'Examiner une proposition de financement des retraites par l’impôt sur la fortune.',
  },
  'melenchon-m-a-insulte-et-je-le-vis-bien': {
    en: 'A personal disagreement about responsibility, solidarity, and political ideas.',
    fr: 'Un désaccord personnel autour de la responsabilité, de la solidarité et des idées politiques.',
  },
  'my-vacation-at-the-most-magical-place-on-earth': {
    en: 'A visit to Disney, and the thoughts about society that came along for the ride.',
    fr: 'Un séjour chez Disney et les réflexions sur la société qui ont accompagné le voyage.',
  },
};
export const featuredIds = [
  'please-use-dependency-injection-if-not-for-me-do-it-for-your-unit-tests',
  'how-my-programming-skills-helped-me-with-my-personal-finances-part-1',
  'everybody-should-play-dungeons-and-dragons',
];
export const episodes = [
  {
    id: 'no-prize-for-pessimism',
    number: '02',
    date: '2025-04-09',
    book: 'No Prize for Pessimism',
    author: 'Sam Schillace',
    title: {
      en: 'What optimism changes about innovation',
      fr: 'Ce que l’optimisme change dans l’innovation',
    },
    summary: {
      en: 'Curiosity, technological toys, and choosing to believe that something might work. A personal reading of Sam Schillace’s case for optimism.',
      fr: 'La curiosité, les jouets technologiques et le choix de croire que ça peut marcher. Une lecture personnelle du plaidoyer de Sam Schillace pour l’optimisme.',
    },
    questions: {
      en: [
        'Why does innovation often begin as a toy?',
        'Can optimism be a skill we practice?',
        'How do we stay curious about AI without giving up critical thinking?',
      ],
      fr: [
        'Pourquoi l’innovation commence-t-elle souvent par un jouet ?',
        'L’optimisme est-il une compétence qui se travaille ?',
        'Comment rester curieux face à l’IA sans renoncer à l’esprit critique ?',
      ],
    },
    url: 'https://podcasts.apple.com/ca/podcast/id1783421651?i=1000702811940',
    adaptation:
      'https://medium.com/@kendo5731/no-prize-for-pessimism-why-optimism-drives-innovation-1a277d9c9ded',
  },
  {
    id: 'irreplaceable',
    number: '01',
    date: '2024-12-04',
    book: 'Irreplaceable',
    author: 'Pascal Bornet',
    title: {
      en: 'The art of standing out in the age of AI',
      fr: 'L’art de se démarquer à l’ère de l’IA',
    },
    summary: {
      en: 'Creativity, critical thinking, and human connection. What can we cultivate as artificial intelligence changes the way we work?',
      fr: 'Créativité, esprit critique et lien humain. Que cultiver alors que l’intelligence artificielle transforme notre façon de travailler ?',
    },
    questions: {
      en: [
        'Which human abilities deserve more of our attention?',
        'How can AI complement our thinking?',
        'What does staying irreplaceable mean in practice?',
      ],
      fr: [
        'Quelles capacités humaines méritent davantage notre attention ?',
        'Comment l’IA peut-elle compléter notre réflexion ?',
        'Que signifie rester irremplaçable en pratique ?',
      ],
    },
    url: 'https://podcasts.apple.com/ca/podcast/id1783421651?i=1000679274848',
    adaptation: undefined,
  },
];
