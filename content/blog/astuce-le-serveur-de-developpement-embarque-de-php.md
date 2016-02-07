+++
categories = []
date = "2014-05-22T02:15:15+01:00"
tags = ["PHP"]
title = "Astuce : le serveur de développement embarqué de PHP"

+++

Bonjour, ce petit article pour partager une de mes découvertes récentes. Il s'agit du serveur web interne de PHP, intégré depuis la version 5.4. La lecture de cette article ne vous apprendra surement pas grand chose si vous avez déjà connaissance de cette fonctionnalité.

Pour en savoir plus, rendez vous directement sur la <a href="http://php.net/manual/fr/features.commandline.webserver.php" target="_blank">documentation officielle de PHP</a>. La documentation explique comment utiliser de façon très simple ce service. A noter que celui n'est pas pensé pour être utilisé dans un environnement de production, mais est destiné à servir dans un environnement de développement. Il n'est, par conséquent, plus nécessaire de configurer une nouvelle vhost sur votre serveur http (typiquement apache ou nginx), et d'ajouter une entrée dans le fichier hosts. Démarrez votre application à l'aide d'une simple commande dans votre terminal, et testez directement votre application !

## Encore mieux

De nombreux framework de développement PHP, dont Symfony ou encore Laravel facillitent encore plus l'utilisation de ce service. Pour l'exemple, si vous utilisez Symfony2 pour développer votre application, tapez directement dans votre terminal la commande suivante :

```bash
php app/console server:run
```

La console vous affichera un message comme :

```bash
Server running on http://localhost:8000
```

Ouvrez votre navigateur et rendez vous à l'adresse `http:/localhost:8000` pour utiliser votre application. Note : la commande lance l'application dans l'environnement de développement, vous n'avez donc pas besoin de faire précéder toutes vos route par `app_dev.php`.

Pour finir un petit coup d'oeil sur les informations que nous fournit la commande suivante :

```bash
php app/console server:run --help
```

Enfin, pour en savoir plus, rendez-vous directement sur la <a href="http://symfony.com/doc/current/cookbook/web_server/built_in.html" target="_blank">documentation officelle de Symfony</a>.

Et voilà, have fun :)
