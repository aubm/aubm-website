+++
categories = []
date = "2016-07-16T15:28:55+02:00"
tags = ["Git"]
title = "Ce qu'il faut savoir pour bien utiliser Git"
draft = true

+++

Git est un outil gestion de sources sophistiqué que vous pouvez placer au centre de votre processus de build/ship.
Par l'utilisation de fonctionnalités comme les branches, les merges ou encore les hooks, Git vous laisse la main pour construire votre propre workflow en fournissant un maximum de flexibilité.

De mon point de vue, **il est tout aussi important de savoir utiliser Git de façon au moins aussi efficace que le(s) language(s) que vous utilisez pour écrire du code**.
Cet article va apporter les clés nécessaires pour bien utiliser Git, ainsi que quelques astuces pour aller un cran plus loin.

## Bien comprendre la notion de remote

Une chose qu'il est important de comprendre est la notion de remote. Il y a deux scénarios, le premier est celui dans lequel vous démarrez un nouveau projet. Dans ce scénario, la commande `git init` va initier un dossier `.git` dans le répertoire de travail. Dans le second scénario, vous reprenez le travail sur un projet existant. Le projet doit alors être initialisé en téléchargeant les sources depuis un serveur distant appelé _remote_ en utilisant la commande `git clone <remote>`.

A partir de là, vous possédez sur votre machine de développement une copie du repository sur laquelle les modifications que vous y apporterez ne seront pas reflétées sur la copie du remote avant d'avoir explicitement resynchronisé les sources à coup de `git push <remote>`, `git pull <remote>`, etc ...
Cela revient à dire qu'il existe autant de versions de la codebase qu'il existe de branches par collaborateurs, d'où la notion de **décentralisation des sources**. 

Lorsque vous utilisez `git clone git@myserver:my/repo`, git télécharge les sources à l'adresse fournie en paramètre et ajoute automatiquement un alias **origin** pour ce remote. Ainsi vous pouvez synchroniser vos source avec ce remote de façon ascendante ou descendante avec `git push origin` ou `git pull origin`.

Il est possible d'enregistrer plusieurs remotes dans un repository local, d'en supprimer ou encore d'en modifier en utilisant les commandes suivantes :

```
# ajoute un nouveau remote nommé upstream
git remote add upstream git@myotherserver:my/repo
 
# modifie l'url pour le remote nommé upstream
git remote set-url upstream git@myotherawesomeserver:my/repo 

# supprime le remote nommé upstream
git remote rm upstream
```

## Effectuer un commit

Apporter des modifications à la codebase a pour effet d'introduire des différences entre votre répertoire de travail et le dernier état dont Git à connaissance. La commande `git status` indique le ou les fichiers altérés, voici un exemple :

```
$ git status
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

        modified:   my-file.txt
        modified:   my-other-file.txt
```

Utilisez `git add <fichier>` pour cibler un fichier à ajouter au **staging**, ou `git add -A` pour tout ajouter en une seule commande.
Le **staging** est un état, il peut être vu comme un pool dans lequel sont placés tous les fichiers qui seront ajoutés à la prochaine révision ou **commit**.

Il est possible de visualiser les modifications apportées dans le répertoire de travail qui ne sont pas encore placées dans le staging à l'aide de la commande `git diff`.
Il est également possible de comparer l'état courant avec l'état de n'importe quel commit en utilisant son hash, par exemple : `git diff 980a837`.
Une astuce : `HEAD` est un alias pointant vers le commit le plus récent, vous n'avez donc pas besoin de connaître son hash pour voir les modifications faites entre le staging et le dernier commit, utilisez simplement `git diff HEAD`.

Pour créer un nouveau commit à partir du staging, utilisez `git commit`. La commande va ouvrir un éditeur de texte dans lequel vous serez invité à saisir un message de commentaire pour le commit. **Ne négligez surtout pas le commentaire**, la pertinence du commentaire est tout aussi importante que la qualité du code que contient le commit. En prenant quelques minutes de plus pour rédiger un message de qualité, un collaborateur ayant besoin de comprendre votre travail gagnera peut-être plusieurs heures. Plus d'informations sur les messages de commit plus loin dans cet article.

Contrairement à d'autres logiciels de gestion de versions, Git ne synchronisent pas automatiquement les nouveaux commits avec le remote. Il est donc tout à fait possible d'être dans une situation où votre repository local possède quelques commits d'avance sur le remote. Cela offre une flexibilité intéressante, comme par exemple la possibilité de garder une fonctionnalité en WIP (Work In Progress) pendant plusieurs jours sur un poste local tout en gardant le travail organisé et découpé en plusieurs commits si nécessaire. Au moment venu, utilisez `git push` pour "envoyer" vos derniers commits sur le remote.

## Utiliser les branches

Il est probable que vous travailliez la plupart du temps dans la branche **master**, qui est la branche créée par défaut dans le repository. La plupart des actions qui vous effectuez consistent donc à synchroniser votre master local avec le master du remote. Il est bien des cas où ce workflow est trop simple pour permettre de réagir efficacement à certains éléments de la vie du projet : hotfixs, développements parallèles, etc ....

Supposons que la **v1.0.0** de votre projet soit en production et que la **v1.1.0** en soit à son 3ème commit. A ce moment arrive la nécessité de publier la correction d'un bug mettant temporairement en suspens les développements. Le problème est le suivant : si le patch est publié à la suite des 3 derniers commits, déployer ce patch aura pour effet de bord de déployer également le travail inachevé de la v1.1.0. Apparaît ici la nécessité de faire évoluer de plusieurs façons différentes l'historique du projet à partir d'un point A. L'utilisation des branches permet d'adresser ce problème.

Un usage classique consiste à identifier une branche comme contenant la dernière version stable de l'application, branche sur laquelle des tags correspondant aux différentes versions déployées en production sont appliqués. Prenons la branche par défaut **master**, pour faire simple : *master == production*.

![Extrait d'un historique Git](/img/git-history.jpg)

Sur l'image ci-dessus, master est tracée en bleu. Il apparaît à la suite du commit *Writes some documentation about the build* que master a été "forkée" afin d'entamer le développement d'une nouvelle fonctionnalité dans une nouvelle branche dédiée appelée **new-feature**. La commande `git checkout -b new-feature` permet de réaliser cette opération.

L'historique de master dévoile qu'un bug survenu sur la version déployée en production a pu être corrigé avant la finalisation de la nouvelle fonctionnalité. Avoir déporté le développement de cette fonctionnalité dans une branche dédiée a permis de déployer le correctif en production sans attendre. En plein travail sur **new-feature**, une approche possible pour démarrer le correctif est la suivante.

```
# Si nécessaire, sauvegarder l'ensemble des modifications en cours non commitées dans un "stash"
~/my/proj(new-feature)$ git stash

# Changer la branche courante
~/my/proj(new-feature)$ git checkout master

# Procéder à la correction du bug dans votre éditeur

# Ajouter les fichiers au staging, commiter le correctif et envoyer le commit sur le remote
~/my/proj(master)$ git add -A && git commit -m "Fixes a bug with users management"
~/my/proj(master)$ git push origin master

# Revenir sur la branche de feature et rétablir les modifications précédemment "stashées"
~/my/proj(master)$ git checkout new-feature
~/my/proj(new-feature)$ git stash pop 
```

Pour plus d'informations sur `git stash` : https://git-scm.com/docs/git-stash.

## Synchroniser des branches divergentes

### Une première approche

A la synchronisation de deux branches (typiquement master et une branche de feature) ou une branche locale et sa copie distante (par exemple master et origin/master) - il est probable que des conflits apparaissent. Ces conflits sont dus à des divergences dans les évolutions parallèles apportées à un même fichier dans les deux branches distinctes. Si Git n'est pas en mesure de résoudre ces conflits automatiquement, il sera alors nécessaire de les résoudre manuellement. Ces conflits surviennent très régulièrement et il est important d'être à l'aise avec les méthodes permettant de les régler.

Considérons la situation que nous avons laissé à l'image précédente, le développement de la nouvelle fonctionnalité est maintenant achevé et il est maintenant temps d'intégrer les modifications apportées dans cette branche dans master. La démarche permettant de réaliser cette opération est la suivante.

```
# Se déplacer dans la branche dans laquelle nous souhaitons intégrer les modifications
~/my/proj(new-feature)$ git checkout master

# Utiliser la commande merge en indiquant en paramètre la branche que nous souhaitons utiliser comme source des modifications
~/my/proj(master)$ git merge new-feature
```

L'ensemble des commits ajoutés à la branche de feature depuis son fork vont être appliqués sur master, or au moment où cette opération est réalisée, la branche de feature compte 2 commits d'avance sur master, **ainsi qu'un commit de retard**.
Voici le résultat dans la sortie standard.

```
~/my/proj(master)$ git merge new-feature
Auto-merging users.js
CONFLICT (content): Merge conflict in users.js
Automatic merge failed; fix conflicts and then commit the result.

~/my/proj(master)$ git status
On branch master
You have unmerged paths.
  (fix conflicts and run "git commit")

Unmerged paths:
  (use "git add <file>..." to mark resolution)
       both modified:   users.js

no changes added to commit (use "git add" and/or "git commit -a")
```

Git bloque l'opération et nous informe de la nécessité d'intervenir sur la résolution de conflits dans `users.js`. Git a transformé le contenu du fichier, à l'ouverture dans un éditeur de code, des fragments de la forme ci-dessous apparaissent.

```
<<<<<<< HEAD
// Etat du fragment dans la branche master
========
// Etat du fragment dans la branche de feature qui tente d'être introduite
>>>>>>> new-feature
```

Il est alors de votre responsabilité de reconsidérer les modifications apportées par la branche de feature en tenant compte du nouvel état de la branche master qui a évoluée depuis le fork.
Intervenir directement dans les sources pour résoudre les conflits de merge n'est pas toujours la solution la plus pratique. Dans la plupart des éditeurs comme Atom, Sublime ou Intellij, il est possible d'utiliser des plugins spécifiques pour vous aider dans cette tâche.

Une fois les conflits réglés, assurez vous que ceux-ci soient bien ajoutés au staging avec `git add -A` puis terminez l'opération de merge avec `git commit`. Voici l'historique du repository après l'opération de merge.

![Extrait d'un historique Git après une opération de merge](/img/git-history-after-merge.png)

### Eviter de réparer les pots cassés

L'historique fait apparaître un commit *Merge branch 'new-feature'* qui contient l'ensemble des modifications apportées par les commits de la branche new-feature, ainsi que les correctifs apportés lors de la résolution des conflits apparus lors de l'opération de merge. Il existe un certain nombre de raisons pour lesquelles il est préférable de ne pas voir apparaître ces commits.

- Ces commits apparaissent pour une raison purement technique, la valeur qu'ils apportent à l'historique du projet à quasi-nulle, pire : elle rend plus difficile sa lecture.
- La résolution de certains conflits peut faire s'éloigner de façon plus ou moins importante le contenu effectif de la fonctionnalité mergée dans master, et les différences apportées par la somme des commits de la branche de feature. Si tel est le cas, cela revient à dire que l'historique de la branche de feature est invalidé.
- Une personne est susceptible d'introduire de nouveaux bugs dans la fonctionnalité lors de la phase de résolution des conflits, c'est d'autant plus risqué si la personne qui prend en charge le merge n'est pas celle qui est à l'origine du code de la branche de feature.

J'ai tendance à considérer que si une branche présente des conflits avec la branche de référence (et donc que celle-ci ne peut pas être mergée directement), c'est que le travail n'est pas achevé. L'étape de merge doit se dérouler sans obstacles, mieux vaut donc résoudre ces conflits **avant de procéder au merge** et ainsi éviter de réparer les pots cassés.

### Résoudre les conflits avant le merge

### Un mot sur la technique du rebase

## L'importance des messages de commit

## Rattraper une erreur

### Modifier le dernier commit

### Retirer une diff du staging

### "Décommiter" une diff

### "Dépusher" un commit