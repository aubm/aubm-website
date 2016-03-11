+++
categories = []
date = "2016-02-19T21:47:28+01:00"
tags = ["Astuce"]
title = "Aller plus loin avec Postman"

+++

## Présentation rapide de Postman

Postman est [téléchargeable dans la magasin d'applications de Google Chrome](https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop).
Dans son utilisation la plus basique, il s'agit d'un outil permettant d'éxecuter des appels HTTP à un serveur pour en interpréter
la réponse en dehors de tout contexte métier.

Pour commencer à comprendre la valeur ajoutée par rapport à Curl (au délà du côté user-friendly),
il faut s'attarder sur la sauvegarde des requêtes et des [snapshots de réponses](https://www.getpostman.com/docs/responses)
[dans des collections](https://www.getpostman.com/docs/collections).
Il n'y a maintenant plus qu'à vous connecter avec votre compte Google et voilà l'ensemble de vos collections synchronisées entre tous vos postes.

Postman est mon fidèle compagnon pour le développement d'API HTTP. Récemment, je me suis intéressé à plusieurs fonctionnalités spécifiques fournies par l'outil.
Dans cet article, je vais tâcher de présenter comment en tirer parti et jusqu'où Postman est capable de s'intégrer à votre workflow de développement.

## Utiliser des variables

Imaginons une API permettant de CRUDer des chats (essentiel), arrive un point où la sauvegarde de `GET http://localhost:8080/api/cats` s'impose.
Il faut cependant noter que cet appel ne pourra se jouer que dans un environnement local.
En ce qui concerne le jour où les chats partiront en production (probable), il sera alors nécessaire de modifier la requête avant de pouvoir la jouer,
probablement en quelque chose de la forme, `GET http://www.cats.com/api/cats`.

Il est intéressant de noter que seul le host varie.
Le cas présenté ici introduit la nécessité de [configurer des environnements](https://www.getpostman.com/docs/environments).
Un environnement contient un ensemble de clés/valeurs qui lui est propre.
Les clés sont définies de façon arbitraire, et il est possible de passer d'un environnement à un autre d'un simple clic.
Si bien que `GET http://{{domain}}/api/cats` appelera `GET http://localhost:8080/api/cats` en environnement local, et `GET http://www.cats.com/api/cats` en production.

<img src="/img/postman_environnements.gif" alt="Environnements Postman" class="img-responsive"/>

## Automatiser les tests sur les endpoints

Dans le développement d'un site ou d'une appli web, le navigateur occupe un rôle central. Il apporte son ensemble d'outils de développement,
et est également l'environnement cible.
C'est pourquoi le développeur soumet régulièrement son application à des tests navigateur (automatisés ou non)
afin de vérifier qu'une fonctionnalité se comporte comme attendu.

Dans le cas d'une API Rest, typiquement HTTP/JSON, un outil comme Postman permet plus facilement de valider le retour des différents endpoints.
Les choses commencent à devenir plus intéressantes lorsque l'on cherche à automatiser ces validations.
Dans le détail d'une requête, il est possible de fournir des fragments de code javascript à Postman. Le code ci-dessous s'insère dans l'onglet "Tests".

```javascript
var jsonData = JSON.parse(responseBody);

tests["Status code is 200"] = responseCode.code === 200;
tests["Has 1 entry"] = jsonData.length === 1;
tests["Assert name"] = jsonData[0].name === "Doctor Frankeinstein";
tests["Assert color"] = jsonData[0].color === "brown";
```

Lancer l'appel après avoir enregistré ces lignes, Postman sera en mesure d'afficher le nombre d'assertions qui ont été validées.

<img src="/img/postman_tests_validation.png" alt="Validation des assertions au lancement de la requête" class="img-responsive"/>

Le principe est simple : chaque nouvelle entrée du tableau `tests` ajoute un nouveau test à la suite, la valeur associée à la clé doit être l'expression
d'un booléen.
Cette approche a l'avantage d'être très flexible, à souligner que des expressions plus élaborées sont permises.

```javascript
(function() {
    var jsonData = JSON.parse(responseBody);
    var pass = jsonData.constructor.name === 'Array' && jsonData.length === 1 &&
        typeof(jsonData[0]) === 'object';
    var msg = pass ? 'Body is an array of one entry' : 'Expect body to be an array of one entry, body = ' + responseBody;
    tests[msg] = pass;
})();
```

Cette [article](http://blog.getpostman.com/2015/09/29/writing-a-behaviour-driven-api-testing-environment-within-postman/) décrit une solution
permettant d'écrire un environnement de BDD, avec une écriture des tests à la Jasmine, dans Postman.

Il est possible de déclencher l'ensemble des requêtes HTTP enregistrées dans une collection,
et d'obtenir un rapport sur les tests qui ont été lancés pour chacune d'entre elles.
Il faut pour cela ouvrir le lanceur de tests en accédant au bouton Run du détail d'une collection, cf. l'image ci-dessous.

<img src="/img/postman-run-tests-button.jpg" alt="Ouverture du lanceur de tests" class="img-responsive"/>

Le lanceur de tests s'ouvre, reste qu'à choisir une collection et démarrer.

<img src="/img/postman_tests_suite.gif" alt="Lancement d'une suite de tests avec Postman" class="img-responsive"/>

## Exécuter les tests dans un build Travis CI

Conserver une fenêtre Postman ouverte pendant le développement de l'API peut être une solution, cependant
[l'outil newman](http://blog.getpostman.com/2014/05/12/meet-newman-a-command-line-companion-for-postman/) permet de lancer les tests depuis la ligne
de commande.

Newman s'installe avec npm, NodeJS doit donc être installé sur la machine.

```bash
$ new i -g newman
```

En fonction de la version de NodeJS et de l'environnement, il se peut que d'autres dépendances soient nécessaires pour l'installer.
Ces informations peuvent trouvées sur [la page Github du projet](https://github.com/postmanlabs/newman).

Postman permet d'exporter des collections et des environnements au format JSON. Ces fichiers sont nécessaires pour que newman ait connaissance
des tests à lancer.

Cf. l'image ci-dessous pour savoir comment télécharger le fichier d'export d'une collection ...

<img src="/img/export_postman_collection.jpg" alt="Exporter une collection" class="img-responsive"/>

... et d'un environnement ...

<img src="/img/export_postman_environnement.jpg" alt="Exporter un environnement" class="img-responsive"/>

Une fois la collection et l'environnement que l'on souhaite y attacher téléchargés (je les place habituellement dans le répertoire
du projet de façon à pouvoir les versionner à côté des sources), reste plus qu'à les référencer avec les options -c et -e de la commande newman.

<img src="/img/newman_output.png" alt="STDOUT de la commande newman" class="img-responsive"/>

Passer par newman ouvre des portes, comme la possibilité d'intégrer l'exécution des tests dans un build [Travis CI](https://travis-ci.org/).

De nombreuses resources apportent des détails pour démarrer facilement avec Travis CI. L'utilise basique est simple, je suggère de commencer par
la lecture de [cette page de la documentation officielle](https://docs.travis-ci.com/user/getting-started/).

Le projet exemple que j'évoque depuis le début de l'article est [accessible sur Github](https://github.com/aubm/Cats-API), les logs du dernier
build [Travis CI sont disponibles ici](https://travis-ci.org/aubm/Cats-API).

L'utilisation de [Docker](https://www.docker.com/) est ici anecdotique dans la mesure où Travis est cappable de fournir un environnement
comprenant une instance de MongoDB. Cela reste néanmoins intéressant dans la mesure où l'exécution des tests côté Travis CI se déroule
dans le même environnement que mon poste local.

Voici le contenu du fichier `.travis.yml`.

```
sudo: required

language: go

services:
    - docker

go:
    - 1.5

env:
    - TRAVIS_NODE_VERSION="0.12"

before_install:
    - rm -rf ~/.nvm && git clone https://github.com/creationix/nvm.git ~/.nvm && (cd ~/.nvm && git checkout `git describe --abbrev=0 --tags`) && source ~/.nvm/nvm.sh && nvm install $TRAVIS_NODE_VERSION
    - npm i -g newman@1.3.0

script:
    - ./run-tests.sh

addons:
    hosts:
        - dockerhost
```

Parmi les points intéressants à relever :

- Les commandes executées au `before_install` permettent de dérouler le script principal dans un environnement où la version de NodeJS est maîtrisée.
  Ceci est nécessaire pour garantir que la version 1.3.0 de newman installée juste après fonctionnera correctement. Plus de détails sur le gestionnaire
  de versions de NodeJS utilisé peuvent être trouvés sur la [page Github du projet](https://github.com/creationix/nvm).
- Comme les tests vont être executés avec un environnement faisant référence à un domaine `dockerhost`, lui même attaché
  (dans le contexte du build Travis) à l'IP locale `127.0.0.1`, la dernière partie du fichier ajoute l'entrée correspondante dans `/etc/hosts`.
- Enfin, les étapes du build sont contenues dans `run-tests.sh` ci-dessous.

```bash
#!/bin/bash

docker build -t kendo5731/cats-api .
docker-compose up -d --force-recreate
docker ps -a
go test ./...
newman -c cats_api.json.postman_collection -e cats_api.postman_environment -x
```

Ce script va lancer les tests associés au packages Go de l'application (Go restant également anecdotique ici), puis jouer la suite de tests
Postman sur l'environnement Docker monté au préalable.

Il est important de renseigner l'option `-x` dans ce contexte. Cette option indique à newman de sortir avec un code différent de 0 en cas d'échec.
Si cette option est manquante, Travis CI ne marquera jamais le build comme ayant échoué, même en cas d'assertions non vérifiées.

## Générer de la documentation

Mettre à disposition une documentation détaillée pour une API est une tâche fastidieuse car il est nécessaire de garder cette
documentation synchronisée avec le code.

S'il existe de nombreux outils capables de générer de la documentation à partir de commentaires formattés dans le code source, j'ai également songé
à utiliser mes collections Postman comme source.
Pratiquement tous les types d'item dans Postman (collections, dossiers, requêtes) peuvent être enrichis d'un nom et d'une description (dont le
contenu écrit en markdown est d'ailleurs directement parsé puis affiché dans l'interface de Postman).
Ces données étant accessibles dans le fichier JSON exporté, pourquoi ne pas les utiliser pour présenter une documentation mise en forme à la main ?
Libre à celui qui se chargera de la documentation, d'utiliser le moteur de template qui lui plaira.

Pour ma part, j'ai choisi Go et mis à disposition un projet très récent permettant de générer la documentation via un outil en ligne de commande.
Cet outil est [disponible sur mon compte Github](https://github.com/aubm/postmanerator) et le projet est ouvert aux contributions :)

Avant cela, mes recherches m'avaient rapidement [amené à cet outil](http://docman.launchrock.com/) qui semble plus mature à l'heure actuelle.

En espérant que cet article sera utile, à la prochaine !
