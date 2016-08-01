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

// git add
// git diff, git diff HEAD

Contrairement à d'autres logiciels de gestion de versions, Git ne synchronisent pas automatiquement les nouveaux commits avec le remote. Il est donc tout à fait possible d'être dans une situation où votre repository local possède quelques commits d'avance sur le remote. Cela offre une flexibilité intéressante, comme par exemple la possibilité de garder une fonctionnalité en WIP (Work In Progress) pendant plusieurs jours sur un poste local tout en gardant le travail organisé et découpé en plusieurs commits si nécessaire.

## Utiliser les branches

## Merge ou rebase ?

## L'importance des messages de commit

## Rattraper une erreur

### Retirer une diff du staging

### "Décommiter" une diff

### "Dépusher" un commit
