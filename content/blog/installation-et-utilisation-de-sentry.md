+++
categories = []
date = "2015-01-24T19:33:05+01:00"
tags = ["Solution"]
title = "Installation et utilisation de Sentry"

+++

## Qu'est ce que Sentry ?

Sentry est une application web open-source que vous pouvez utiliser pour logger les erreurs de vos applications. 

Le fonctionnement de Sentry repose sur l'exploitation de son API accessible par HTTP. Des librairies existent pour de nombreux langages et framework afin de faciliter son implémentation.

Rendez vous sur le <a href="https://github.com/getsentry/sentry" target="_blank">github du projet</a> pour en apprendre plus sur les fonctionnalités. 

## A propos de cet article

Cet article comporte deux parties. La première détaille la procédure d'installation de la dernière version de Sentry (7.1.4 à l'heure où je rédige) sur une machine virtuelle Ubuntu server 64 bits. La seconde contient des morceaux de code commentés, issus de deux applications exemple : une en PHP brut, l'autre réalisée à l'aide du framework Symfony2 full-stack. Le but est d'apporter quelques exemples d'utilisation <a href="https://github.com/getsentry/raven-php" target="_blank">de la librairie PHP</a>.

## Installation et configuration de Sentry

### Pré-requis

Pour préparer cet article, j'ai monté une machine virtuelle Ubuntu server 64 bits afin de pouvoir travailler en local. Sentry peut cependant s'installer sur n'importe quel système Unix.

Sentry est codé en langage python, il nous faudra donc l'avoir installé ainsi que quelques outils de développement.

```bash
sudo su
apt-get update
apt-get upgrade
apt-get install python-setuptools python-pip python-dev libxslt1-dev libxml2-dev
```

Nous avons besoin d'une base de données, le guide d'installation officiel recommande PostgreSQL, <a href="http://redis.io/" target="_blank">Redis</a> est également requis. Vous pouvez aussi installer Postfix pour supporter l'envoi des notifications par mail.

```bash
apt-get install postgresql postgresql-server-dev-all
apt-get install redis-server
apt-get install postfix
```

Enfin un serveur HTTP est requis, Apache pourra convenir si vous l'avez déjà installé. Étant donné qu'il s'agit d'une nouvelle installation, je fais le choix d'installer Nginx.

```bash
apt-get install nginx
```

### Préparation de la base de données

Les commandes suivantes créent un nouvel utilisateur `sentry` avec le mot de passe `sentry`, à qui nous allons accorder tous les privilèges sur une nouvelle base de données également nommée `sentry`.

```bash
su postgres
psql
CREATE USER sentry WITH PASSWORD 'sentry';
CREATE DATABASE sentry ENCODING 'UTF8';
GRANT ALL PRIVILEGES ON DATABASE sentry to sentry;
\q
exit
```

### Création de l'environnement virtuel python, téléchargement et configuration de Sentry via pip

Nous allons maintenant nous servir de l'utilitaire `virtualenv` pour créer un environnement virtuel dans lequel nous allons installer Sentry avec la commande `pip`.

```bash
pip install -U virtualenv
virtualenv /www/sentry/
source /www/sentry/bin/activate
pip install -U sentry
pip install -U sentry[postgres]
```

Utilisons maintenant la commande suivante pour générer un fichier de configuration pour Sentry.

```bash
sentry init /etc/sentry.conf.py
```

Nous allons maintenant éditer ce fichier pour renseigner les informations de base de données. Il faudra également descendre un peu plus bas pour modifier le paramètre `SENTRY_URL_PREFIX`. Ce paramètre doit contenir le nom de domaine qui servira à accéder à notre serveur Sentry.

Pour l'exemple, j'ai mis `sentry.local`, j'ai également pensé à ajouter une entrée dans mon fichier `/etc/hosts` (sur ma machine hôte) afin de rattacher le domaine à l'IP de ma VM. Si vous travaillez sur un serveur en live, vous aurez besoin d'un domaine et d'une entrée DNS faisant pointer ce domaine vers l'IP du serveur.

Nous allons configurer Nginx comme reverse proxy pour servir les requêtes adressées à Sentry. Pour cette raison, la ligne contenant le paramètre `SENTRY_WEB_HOST` sera commentée de façon à ce que Sentry ne réponde qu'à des adresses IP locales.

Mon fichier de configuration est le suivant : <a href="https://gist.github.com/aubm/00b0ba9a602312e26717#file-sentry-conf-py" target="_blank">Voir le gist</a>.

Une fois que tout est bon, nous pouvons lancer les migrations pour fournir la base de données.

```bash
sentry --config=/etc/sentry.conf.py upgrade
```

Sentry est maintenant configuré et écoute sur le port 9000 en local uniquement. Une dernière chose avant de passer à la suite : créons un utilisateur qui nous servira à nous connecter à l'interface web.

```bash
sentry --config=/etc/sentry.conf.py createsuperuser
```

Note : la commande `deactivate` permet de sortir de l'environnement virtuel python.

### Configurer Nginx

Nous allons ajouter un hôte virtuel, que nous activerons en utilisant les commandes suivantes :

```bash
nano /etc/nginx/sites-available/sentry.local
ln -s /etc/nginx/sites-available/sentry.local /etc/nginx/sites-enabled/sentry.local
service nginx restart
```

Le contenu du fichier est disponible ici : <a href="https://gist.github.com/aubm/00b0ba9a602312e26717#file-sentry-local-nginx-file" target="_blank">Voir le gist</a>.

### Lancer les processus avec Supervisor

A ce stade, Sentry est correctement installé et prêt à fonctionner en démarrant ces deux processus :

```bash
sentry --config=/etc/sentry.conf.py start http
sentry --config=/etc/sentry.conf.py celery worker -B
```

Le premier correspond à l'application web et embarque l'interface utilisateur et le webservice. Le second démarre les workers Celery qui traitent les tâches asynchrones qui permettent à Sentry de fonctionner.

Cependant, pour des questions pratiques nous allons utiliser le gestionnaire de processus Supervisor qui prendra en charge le démarrage de ces deux programmes.

Commençons par installer Supervisor et générer un fichier de configuration.

```bash
easy_install supervisor
echo_supervisord_conf > /etc/supervisord.conf
```

Éditons maintenant le fichier `/etc/supervisord.conf` pour y ajouter (à la fin) le contenu de <a href="https://gist.github.com/aubm/00b0ba9a602312e26717#file-end-of-supervisord-conf" target="_blank">ce gist</a>.

Enfin, la commande suivante démarrera Supervisor et Sentry par la même.

```bash
supervisord
```

## Utiliser Sentry avec des applications PHP

### Installation de raven-php

La première chose à faire est de télécharger le paquet raven-php. Utilisons composer et ajoutons le paquet comme dépendance pour le projet.

Voilà le contenu du fichier `composer.json` :

```json
{
    "require": {
        "raven/raven": "dev-master"
    }
}
```

Une fois fait la commande `composer install` se chargera de télécharger la dernière version de la librairie.

Enfin - si ce n'est pas déjà fait - ajoutons la ligne suivante en début de fichier pour configurer le chargement automatique des classes du paquet.

```php
require_once __DIR__ . '/vendor/autoload.php';
```

### Envoyer nos premiers messages

Nous allons créer un objet de type `Raven_Client` que nous utiliserons pour communiquer nos erreurs au serveur Sentry.

Voilà les lignes de code à ajouter à la suite de notre fichier :

```php
$sentry_api_key = 'http://21e21b43f3834e04b826ac24f9ef8cc9:acc747a904dc446793c5d31d9406ec79@sentry.local/2'; 
$sentry_client = new Raven_Client($sentry_api_key);
```

La valeur de la variable `$sentry_api_key` est propre à un projet. Cette information se récupère via l'interface web de Sentry en naviguant dans le projet, puis "Settings" puis "API Keys".

Il ne reste plus qu'à envoyer notre premier message :

```php
$sentry_client->captureMessage('Message test !');
```

Capturer une exception est tout aussi simple en utilisant par exemple le code suivant :

```php
try {
    throw new Exception('Exception test', 500); 
} catch (Exception $e) { 
    $sentry_client->captureException($e);
 }
```

<figure>
<img src="/images/posts/assets/message_exception_test.png" alt="Affichage des messages d'erreur dans l'interface web de Sentry" class="img-responsive"/>
<figcaption>Les messages tels qu'ils sont affichés dans l'interface web de Sentry.</figcaption>
</figure>

### Enregistrer Sentry comme gestionnaire d'erreurs

Il est possible de configurer Sentry comme gestionnaire d'erreurs et d'exceptions avec le code suivant :

```php
$error_handler = new Raven_ErrorHandler($sentry_client); 
set_error_handler(array($error_handler, 'handleError'));
 set_exception_handler(array($error_handler, 'handleException'));
```

Avec cette configuration, toutes les erreurs et les exceptions non "catchées" seront automatiquement envoyées à Sentry. 

### Configurer Sentry pour Symfony2

Configurer Sentry dans une application utilisant le framework full-stack de Symfony2 peut se faire de façon très simple grâce à <a href="https://github.com/Seldaek/monolog/blob/master/src/Monolog/Handler/RavenHandler.php" target="_blank">Monolog qui intègre un handler pour Sentry</a>.

Dans la configuration de Monolog, dans le fichier `config_prod.yml` par exemple, il suffit de configurer ce handler.

```yaml
monolog:
    handlers:
        main:
            type: fingers_crossed
            action_level: error
            handler: nested
        nested:
            type:  stream
            path:  "%kernel.logs_dir%/%kernel.environment%.log"
            level: debug
        console:
            type:  console
        sentry:
            type: raven
            dsn: http://21e21b43f3834e04b826ac24f9ef8cc9:acc747a904dc446793c5d31d9406ec79@sentry.local/2
            level: notice
```

## Ressources

- <a href="http://sentry.readthedocs.org/en/latest/quickstart/" target="_blank">Guide d'installation officiel de Sentry</a>
- <a href="https://virtualenv.pypa.io/en/latest/" target="_blank">Pour en apprendre plus sur les virtualenv python</a>
- <a href="https://pypi.python.org/pypi/pip" target="_blank">Pour en apprendre plus sur le gestionnaire de paquets python pip</a>
- <a href="http://supervisord.org/installing.html" target="_blank">Pour en apprendre plus sur le gestionnaire de processus supervisor</a>
- <a href="https://packagist.org/packages/raven/raven" target="_blank">Page packagist de raven-php</a>
- <a href="https://getcomposer.org/doc/00-intro.md" target="_blank">Introduction au gestionnaire de paquets php composer</a>
