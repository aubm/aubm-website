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

Lorsque vous utiliser `git clone git@myserver:my/repo`, git télécharge les sources à l'adresse fournie en paramètre et ajoute automatiquement un alias **origin** pour ce remote. Ainsi vous pouvez synchroniser vos source avec ce remote de façon ascendante ou descendante avec `git push origin` ou `git pull origin`.

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

Apporter des modifications à la codebase a pour effet d'introduire des différences entre votre répertoire de travail et le dernier commit. La commande `git status` indique le ou les fichiers altérés, voici un exemple :

```
$ git status
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

        modified:   my-file.txt
        modified:   my-other-file.txt
```

Utilisez `git add <fichier>` pour cibler un fichier à ajouter au **staging**, ou `git add -A` pour tout ajouter en une seule commande.
Le **staging** est un état, il peut être vu comme un pool dans lequel sont placés tous les fichiers qui seront ajoutés au commit.

Il est possible de visualiser les modifications apportées dans le répertoire de travail qui ne sont pas encore placées dans le staging à l'aide de la commande `git diff`.
Il est également possible de comparer l'état courant avec l'état de n'importe commit en utilisant son hash, par exemple : `git diff 980a837`.
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

# Procéder à la correctif du bug dans votre éditeur préféré (vim)

# Ajouter les fichiers au staging, commiter le correctif et envoyer le commit sur le remote
~/my/proj(master)$ git add -A && git commit -m "Fixes a bug with users management"
~/my/proj(master)$ git push origin master

# Revenir sur la branche de feature et rétablir les modifications précédemment "stashées"
~/my/proj(master)$ git checkout new-feature
~/my/proj(new-feature)$ git stash pop 
```

Pour plus d'informations sur `git stash` : https://git-scm.com/docs/git-stash.

## Merge ou rebase ?

Lorsque vous décidez de synchroniser deux branches - qu'il s'agisse de deux branches locales (typiquement master et une branche de feature) ou une branche locale et sa copie distante (par exemple master et origin/master) - il est probable que des conflits apparaissent. Ces conflits sont dû à des modifications différentes effectuées sur un même fichier. Si Git n'est pas en mesure de résoudre ces conflits automatiquement, il sera alors nécessaire de les résoudre manuellement.

## L'importance des messages de commit

## Rattraper une erreur

### Modifier le dernier commit

### Retirer une diff du staging

### "Décommiter" une diff

### "Dépusher" un commit