## Introduction

Joomla - à l'instar de Wordpress et Drupal -  est un CMS permettant à des utilisateurs non-développeurs d'installer et de configurer un site internet. Le CMS s'adresse également aux développeurs, en leur proposant une API leur permettant d'étendre ses fonctionnalités. D'aucuns sont alors tentés de choisir Joomla pour démarrer un projet impliquant du développement spécifique. Sur le papier l'argumentaire est imparable : pourquoi ne pas utiliser le CMS comme base pour ce projet, pour lequel Joomla sorti de la boite couvre 80% des besoins du client ? C'est autant de temps de gagner.

Pendant presque deux ans, j'ai eu l'occasion de prendre part à de nombreux développements sur Joomla. Cette expérience m'a conduit à penser que dans certains cas, cette logique est applicable. En effet, pour un budget moyen et dans le cas d'un projet de site web répondant aux caractéristiques classiques d'un blog, d'une vitrine ou éventuellement d'un e-commerce, cette hypothèse semble se vérifier. Il est cependant de nombreux cas où le besoin métier du client représentant les 20% de développement restant représentent en réalité bien plus que 20% du temps de développement global. Pour ce type de projets, mieux vaut s'assurer de choisir un bon environnement de développement pour travailler.

Alors Joomla est-il un bon terrain de jeu ? Sur le sujet ma position est claire : non. Dans cet article je vais tâcher de défendre ce point de vue.
Sans vouloir tomber dans du troll, certains points de vue restent personnels et donc discutables. Il pourrait être intéressant de les confronter à des visions différentes.

## Modulaire mais pas extensible

L'argumentaire "commercial" de Joomla repose sur sa modularité. L'architecture du CMS permet effectivement de développer des extensions afin d'ajouter des fonctionnalités sans altérer le core du logiciel. Vous pouvez donc envisager de développer un forum, un composant de petites annonces, ou encore une solution permettant d'exporter des données vers un CRM ; le tout en cohabitation avec la gestion du blog et des utilisateurs fournie par le CMS.

Bien, je souhaite maintenant étendre le composant de gestion des contenus du site afin d'y ajouter la possibilité de renseigner un champ supplémentaire. La désillusion commence ici, car à problème simple, solution ... pas simple. Malheureusement le CMS ne permet pas d'étendre les fonctionnalités des composants natifs. Pour un besoin comme celui-ci il faudra passer par le développement d'un composant à part entière afin d'ajouter les fonctionnalités manquantes (ou éventuellement l'utilisation d'un composant tiers, mais cela pourrait apporter de nouvelles contraintes).

On serait tenté de dire qu'il s'agit là d'un exemple isolé et que ces problématiques ne sont pas récurrentes. J'ai pourtant été confronté à des cas similaires de nombreuses fois. La raison pour laquelle cela est réellement gênant est que ces problèmes trahissent en vérité des erreurs importantes de conception. Dans le meilleur des mondes, Joomla mettrait à disposition un composant d'injection de dépendances couplé à une stratégie d'abstraction sur les classes utilisées dans les composants du core. Ainsi une hypothétique classe concrète `Content` pourrait être remplacée par une classe `MyCustomContent`, quelques détails à régler, un petit script de migration pour modifier la structure de la base de données et le tour est joué. On est très loin de ça.

J'aborde là des notions relatives au design objet, le but n'est pas de m'égarer dans des idées trop éloignées du sujet. Je suis conscient que l'utilisation de certaines techniques pourrait sembler surévaluée et en ça il s'agit là d'un point de vue discutable. Ceci étant dit, s'il est question de choisir un environnement pour développer une application relativement complexe, alors s'orienter vers une solution plus ouverte me semble plus judicieux. Car si le problème mis en évidence ici est relatif à la couche fonctionnelle du CMS, des erreurs similaires existent au niveau du framework.

<img src="/images/posts/assets/saquedeneu.png" alt="Saquedeneu" class="img-responsive"/>

Force est de constater que les contributeurs de Joomla fournissent un travail important pour améliorer la qualité du code. Je précise au passage que certains aspects sont intéressants (comme notamment le fonctionnement des plugins). Cependant Joomla (à l'origine fork de Mambo) est construit de manière empirique et à ce stade du projet, la tâche est herculéenne. Conscients des faiblesses de Drupal 7, les développeurs de Drupal 8 ont choisi de reprendre le projet à zéro.

## Joomla le vilain petit canard

### PSR quoi ?

A l'heure où j'écris, une partie du framework est réécrite avec dans l'optique d'embrasser des techniques de codage plus au goût de ce qui se fait aujourd'hui dans le monde de PHP. Bien que pour le développeur d'extensions cela relève plus de l'anecdote qu'autre chose, c'est plutôt une bonne nouvelle. Car si Joomla 3.4 requiert au minimum PHP 5.3, l'utilisation des namespaces dans le code des extensions suscitera éventuellement de timides "pourquoi pas ?" mais toujours pas d'applaudissements. On attend avec impatience le jour où l'auto-chargement des classes conforme PSR-0 ou PSR-4 sera géré par le CMS. En attendant vous pouvez continuer à le configurer manuellement pour chacune de vos classes.

### Un router pour le moins original

Les composants du CMS doivent respecter une structure pour fonctionner. Des contrôleurs sont définis pour isoler la logique de l'application. En réalité cette responsabilité est partagée entre les contrôleurs et les vues. C'est un peu différent de ce qu'on peut trouver dans d'autres frameworks mais pourquoi pas.

Ce qui me laisse un peu perplexe en revanche c'est le fonctionnement du router. Le contrôleur et l'action qui prendront en charge la requête sont définis par des variables de requête. Si bien que cette requête `index.php?option=com_forum&task=message.save` sera prise en charge par la méthode `save()` du contrôleur `Message` du composant `Forum`. Le flow d'exécution de la requête est donc sous le contrôle partiel de l'utilisateur du site. Il est possible de la même façon de déterminer le fichier de vue et le template à utiliser en forçant une valeur pour les variables `view` et `tmpl`. Pour info, si une combinaison de valeurs ne fonctionne pas, <a href="http://www.joomla.org/index.php?option=com_content&task=john.doe" target="_blank">l'application renverra une 500</a>.

Pour utiliser des urls plus "SEO friendly", il faudra donc mettre en place un fichier `router.php` à l'intérieur du composant, fichier dans lequel la réécriture des urls est définie programmatiquement. Pas franchement simple donc, à titre d'exemple, le fichier router du composant de gestion de contenu embarqué dans le CMS <a href="https://github.com/joomla/joomla-cms/blob/staging/components/com_content/router.php" target="_blank">compte pas loin de 500 lignes</a>, quid des performances ? Sans compter qu'il est impossible de personnaliser les routes des composants natifs de Joomla.

A noter qu'activer la réécriture des urls n'empêchera pas les utilisateurs de la boycotter et d'accéder à `index.php?option=com_....`. Cela ne les empêchera pas non plus d'accéder aux autres fichiers du site d'ailleurs, étant donné que le point d'entrée (supposé) de l'application est situé à un niveau d'arborescence supérieur aux fichiers des composants. Forçant ainsi à vérifier la déclaration de la constante `_JEXEC` au début de chaque fichier (pas très élégant ...), et accessoirement de placer un `index.html` vide dans chaque sous répertoire.

### A propos d'élégance

A propos d'élégance (ou plus exactement de praticité), il y a un certain nombre de points qui méritent d'être soulignés.

Par exemple, si une mise à jour d'un composant du site implique des modifications dans la structure de la base de données, il est préférable d'ajouter un fichier de migration afin de faciliter la mise à jour de ce composant sur le serveur de production. Un peu dommage que ces fichiers contiennent des requêtes SQL qu'il faut écrire à la main. Doctrine ou Eloquent (à titre d'exemples) peuvent tous deux générer des scripts équivalents via un CLI avec en bonus des possibilités de rollback (ce qui n'est pas le cas ici je précise).

En parlant d'ORM, à noter que Joomla n'embarque pas d'ORM. Il faudra se contenter d'un composant d'abstraction sur la base de données (une petite sur-couche à PDO) présentant au moins l'avantage de pouvoir construire des requêtes SQL plus facilement en manipulant des objets. C'est regrettable, surtout quand il s'agit d'extraire des données de plusieurs tables, l'utilisation d'un ORM peut faire gagner un temps précieux.

Parmi les éléments qui me viennent à l'esprit, j'évoquerai aussi la définition des formulaires dans des fichiers XML. L'idée est bonne sur la papier dans la mesure où cela vise à faciliter des tâches fastidieuses comme la validation des données ou la génération de templates. Dans la pratique il est des cas où cette approche apporte plus de contraintes qu'autre chose. Quid des formulaires dynamiques par exemple ?
 
Rien de bien grave dans tout ça me direz-vous et c'est sans doute vrai. Rien de véritablement bloquant pour achever le développement du site, mais je rappelle qu'il est question de choisir un environnement de développement confortable permettant de travailler efficacement (et donc plus rapidement). Sur les points cités plus haut comme sur de nombreux autres, Joomla n'est clairement pas au niveau de ce que proposent des frameworks concurrents.
 
### Une maturité discutable

Si il semble qu'aujourd'hui, la culture du test commence à rentrer dans les moeurs, ce n'était pas le cas il y a encore relativement peu de temps. La communauté semble effectivement avoir <a href="http://developer.joomla.org/news/597-release-postmortem.html" target="_blank">appris de ses erreurs</a> et une grande partie du code est aujourd'hui (enfin) couverte par des tests. Ces tests ne garantissent évidemment pas le fonctionnement de l'application mais permettent au moins de contrôler un certain nombre de régressions.

<img src="/images/posts/assets/iron_man.gif" alt="Iron man" class="img-responsive"/>

Cela reste un avis très personnel mais je ne peux m'empêcher de penser qu'une prise de conscience aussi tardive pourrait témoigner d'un certain manque de maturité du logiciel, ce qui est assez paradoxal étant donné son ancienneté.

On pourrait en dire autant sur la documentation officielle pour les développeurs, qui aujourd'hui encore paraît assez maigre (notamment en terme d'exemples) à côté de la quantité de ressources que l'on peut trouver sur les sites respectifs de Laravel ou de Symfony (pour ne citer qu'eux).
Encore un paradoxe d'ailleurs, étant donné que ce n'est pourtant pas le contenu qui manque entre <a class="http://dev.joomla.fr/" target="_blank">dev.joomla.fr</a>, <a href="http://developer.joomla.org/" target="_blank">developper.joomla.org</a> ou encore <a href="https://docs.joomla.org/Portal:Developers" target="_blank">docs.joomla.org/Portal:Developers</a> ... J'y mets peut-être un peu de mauvaise volonté mais quelqu'un pourrait me dire par où commencer ?

## Performance, scalabilité et maintenance

La performance c'est souvent la bête noire des CMS. En tout cas pour ceux orientés "end-user", étant donné que beaucoup font le choix de stocker un (trop) grand nombre d'informations en base de données et que les accès I/O sont généralement les opérations les plus couteuses.

Joomla peine à déroger à la règle, c'est effectivement délicat quand le choix est fait de stocker en base de données, des données relatives au paramétrage des composants par exemple. <a href="http://www.chronoengine.com/downloads/chronoforms.html" target="_blank">Certains composants</a> poussent le vice assez loin en allant jusqu'à stocker en base de données des fragments de code destinés à être exécutés.

La complexification des requêtes SQL peut également être une conséquence indirecte de la nature modulaire mais peu extensible du CMS (cf. début de l'article). En effet si ajouter une information sur le numéro de téléphone des utilisateurs ne peut être fait en modifiant directement la table des utilisateurs, un composant tiers n'aura alors d'autre choix que d'ajouter une table `users_extra_data` comportant une clé étrangère vers la table `users`.

Une mauvaise optimisation de la base de données ne représente pas un problème majeur au départ. On peut toujours investir 200 euros de plus par an pour que l'application s'exécute convenablement. C'est sur le moyen/long terme que ces problèmes peuvent devenir gênants, alors que le traffic augmente sur le site, la besoin en resources augmentera de manière exponentielle.

A noter également qu'en terme de maintenance, qu'il s'agisse de versionner le projet ou de configurer un environnement de test, cette mauvaise utilisation de la base de données ne facilitera pas la tâche.

## Le mot de la fin

Le tour n'est pas encore complet et il y aurait évidemment encore beaucoup à dire (en bon comme en mauvais). Je pense cependant avoir donné suffisamment d'éléments pour défendre mon point de vue.

N'hésitez pas à commenter pour donner votre retour, et merci pour la lecture !
