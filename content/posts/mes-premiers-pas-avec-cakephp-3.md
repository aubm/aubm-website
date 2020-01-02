+++
categories = []
date = "2015-03-13T16:22:40+01:00"
tags = ["PHP", "CakePHP"]
title = "Mes premiers pas avec CakePHP 3"

+++

## Avant propos

Profitant d'un peu de temps libre j'ai décidé de m'essayer à la dernière version en date de CakePHP, à savoir CakePHP 3. Je suis donc parti dans l'idée de pondre un Twitter-like en version allégée (très allégée).

Après avoir posé le contexte en présentant mon Twitter fait maison, je développerai cet article en apportant des précisions sur le code et les différentes fonctionnalités de CakePHP 3 que j'ai utilisées pour construire le site. A noter que l'objectif premier est de se concentrer sur les spécificités de CakePHP 3. Je suggère - afin de tirer meilleur parti de cette lecture - de bénéficier en amont d'une certaine expérience autour d'outils comme Composer, d'être à l'aise avec le modèle MVC, ou encore de savoir ce qu'est un ORM.

Au départ, mes objectifs étaient de comprendre comment un projet CakePHP 3 est structuré et de découvrir les fonctionnalités offertes par le framework. C'est dans cet esprit que je vais écrire, tâchant de rester dans une simple description. Le but n'est donc pas de comparer CakePHP 3 à d'autres frameworks, ni de répondre directement à des questions comme "Cake est-il adapté pour tel type d'application ?". D'autant que la forme ne s'y prête pas dans la mesure où un projet comme celui-ci ne permet pas de couvrir tous ses aspects.

Cet article est un bilan sur les quelques journées que j'ai passées à jongler entre mon IDE et la documentation officielle de CakePHP 3. Je l'écris avant tout pour moi, afin qu'il puisse éventuellement me servir de point de départ si j'ai un jour besoin de travailler avec ce framework. Ceci étant dit, comme il semble qu'il n'existe encore (du moins à l'heure où j'écris) que relativement peu de ressources sur le sujet (en dehors de la documentation officielle et en français du moins), je serais content d'apprendre qu'il a pu servir à d'autres développeurs.

## Contexte

L'application que j'ai réalisée s'inspire ouvertement du fonctionnement de Twitter. Voilà le contenu de ma check-list en début de projet :

- Les utilisateurs enregistrés peuvent poster des messages (des tweets) de moins de 140 caractères
- Tous les tweets apparaissent en page d'accueil dans l'ordre du plus récent au plus ancien
- La page d'un utilisateur affiche les détails de son profil et la liste de ses tweets
- Possibilité d'ajouter des #hashtags dans les tweets, cliquer sur un hashtag affiche la liste de tous les tweets qui le mentionnent
- Pas de pagination pour les tweets, charger les tweets suivants au défilement de la page
- Les utilisateurs peuvent modifier les détails de leur profil et télécharger une image pour personnaliser leur avatar
- Afficher un bloc listant les hashtags les plus populaires

N'ayant pas souhaité déployer sur un serveur, j'ai pris la peine de réaliser cette vidéo de présentation au cas où vous souhaiteriez voir l'application tourner.

<div class="video-wrapper">
<iframe width="1280" height="750" src="https://www.youtube.com/embed/_-UvsRoXZeM" frameborder="0" allowfullscreen></iframe>
</div>

Les sources sont disponibles sur <a href="https://github.com/aubm/Twitthome-CakePHP3" target="_blank">Github</a>. Je suggère de conserver l'onglet Github ouvert pendant la lecture afin de pouvoir facilement faire des parallèles entre les notions abordées et le code de l'application.

Le fichier <a href="https://github.com/aubm/Twitthome-CakePHP3/blob/master/database.sql" target="_blank">database.sql</a> contient les requêtes à exécuter pour ajouter les tables dans une base de données MySQL.

<figure>
<img src="/img/twitthome_schema.png" alt="Schéma base de données Twitthome"  class="img-responsive"/>
<figcaption>Une représentation graphique du schéma de la base de données.</figcaption>
</figure>

## Généralités et organisation du code

A supposer que vous souhaitiez démarrer un projet CakePHP 3, la seule chose à faire après avoir installé les pré-requis nécessaires (PHP 5.3 et Composer) est de lancer cette commande :

```bash
composer create-project --prefer-dist -s dev cakephp/app my_app_name
```

Composer téléchargera CakePHP 3 et ses dépendances dans un nouveau dossier `my_app_name`. Le script d'installation est lancé automatiquement et propose de configurer les droits des répertoires pour vous. Vous pourrez alors commencer à travailler sur le site en utilisant le serveur HTTP embarqué :

```bash
bin/cake server
```

Comme pour beaucoup de frameworks web, CakePHP 3 propose une implémentation du pattern composite MVC pour la gestion du cycle de vie des requêtes HTTP. Le code de l'application va donc être segmenté en trois couches, chacune pouvant tirer parti d'un certain nombre d'éléments : composants, comportements, helpers, etc ... Il s'agit là de termes propres à CakePHP que je développerai plus tard.

Le fichier d'entrée de l'application est  `/webroot/index.php`. Son rôle est de déclencher le processus de démarrage de l'application, puis d'instancier le **dispatcher** qui se chargera de déléguer la requête au bon contrôleur. `/webroot/` est le répertoire auquel doit être configuré le **document root**.`index.php` devrait y être le seul fichier PHP aux côtés d'autres ressources web comme des images, des fichiers CSS ou Javascript.

Si vous avez besoin d'intervenir sur des étapes du démarrage de l'application, vous aurez alors besoin d'éditer un peu de code dans `/config/`. Dans `/config/app.php` sont notamment définis les paramètres de connexion à la base de données, le niveau de debug ou encore la gestion des sessions. Les routes sont définies programmatiquement dans `/config/routes.php`.

Pour le reste, le répertoire `/src/` se chargera d'héberger les sources de l'application. Les contrôleurs, les modèles ou encore les templates sont situés dans des sous-répertoires de `/src/`. Cette même structure est reprise au travers <a href="http://book.cakephp.org/3.0/fr/plugins.html" target="_blank">des plugins</a>. Pratique pour packager une application dans le but de la réutiliser dans une autre (conceptuellement proche des bundles de Symfony 2).

## Les routes

### Déclarer des routes

Les routes sont définies dans `/config/routes.php` à l'intérieur de **scopes**. Un scope permet - entre autres - de factoriser plusieurs routes afin de leur attribuer un préfix.

```php
Router::scope('/api/', function ($routes) {
    $routes->connect('/tweets', [
        'controller' => 'Tweets',
        'action' => 'index'
    ], [
        '_name' => 'tweets_index'
    ]);
});
```

Le code ci-dessus connecte la route `/api/tweets` au dispatcher. Le dispatcher se chargera de passer la requête à la méthode `TweetsController::index()`. Le tableau d'options en troisième paramètre de la méthode `connect()` est facultatif. Définir l'option `_name` permet de générer les urls plus facilement depuis les templates (vu plus tard).

### Déclarer des ressources restful

Supposons maintenant qu'il s'agisse de mettre en place une API restful. CakePHP 3 offre la possibilité de s'affranchir de portions de code répétitives en tirant parti de quelques conventions sur lesquelles reposent des comportements par défaut du framework. Cette philosophie - sans doute héritée de Ruby on Rails - est omniprésente. Qu'il s'agisse de travailler avec les routes ou encore avec l'ORM, elle peut faire gagner un temps précieux.

Pour l'exemple, jetons un oeil sur ce tableau :

<table class="table table-condensed">
<tr><td>GET</td> <td>/api/tweets.:format</td> <td>TweetsController::index()</td></tr>
<tr><td>GET</td> <td>/api/tweets/:tweet_id.:format</td> <td>TweetsController::view($tweet_id)</td></tr>
<tr><td>POST</td> <td>/api/tweets.:format</td> <td>TweetsController::add()</td></tr>
<tr><td>PUT</td> <td>/api/tweets/:tweet_id.:format</td> <td>TweetsController::edit($tweet_id)</td></tr>
<tr><td>PATCH</td> <td>/api/tweets/:tweet_id.:format</td> <td>TweetsController::edit($tweet_id)</td></tr>
<tr><td>DELETE</td> <td>/api/tweets/:tweet_id.:format</td> <td>TweetsController::delete($tweet_id)</td></tr>
</table>

Ces routes peuvent être configurées automatiquement avec ce seul extrait de code :

```
Router::scope('/api/', function ($routes) {
    $routes->extensions(['xml', 'json']);
    $routes->resources('tweets');
});
```

### Les routes auto-déclarées

Une chose à savoir à propos de CakePHP 3 est qu'il connecte automatiquement une route au dispatcher pour chaque nouvelle action de contrôleur. Le nom de ces routes est défini en fonction du nom du contrôleur et de la méthode.
Si bien que le code si dessous :

```php
class TweetsController
{
    function index()
    {
        ...
    }

    function add()
    {
        ...
    }

    function load()
    {
        ...
    }
}
```

Connectera automatiquement les routes `/tweets`, `/tweets/add` et `/tweets/load`. Ce comportement est induit par cette instruction du fichier `/config/routes.php` :

```php
$routes->fallbacks('InflectedRoute');
```

Naturellement, supprimer cette instruction supprimera ce comportement.

## La couche Controller

### Les classes de contrôleur

Les classes de contrôleur sont situées dans `/src/Controller/`. Elles doivent étendre la classe `\Cake\Controller\Controller` et leur nom doit - par convention - se terminer par le suffixe `Controller`.

L'application Twitthome utilise quatre classes de contrôleur : `TweetsController`, `HashtagsController`, `UsersController` et `AccountParametersController`. Comme suggéré dans la documentation officielle, ces classes étendent `AppController`. Cette pratique est un moyen simple de définir des comportements globaux pour l'application, comme par exemple des règles liées à l'authentification.
L'instruction ci-dessous extraite de la classe `AppController` autorise les accès non-authentifiés aux actions (i.e. aux méthodes) `index`, `view` et `display` pour tous les contrôleurs.

```php
$this->Auth->allow(['index', 'view', 'display']);
```

Le router mis à part, le contrôleur est le point d'entrée de l'application. Depuis le contrôleur, CakePHP 3 permet de manipuler la requête et la réponse HTTP au moyen des attributs <a href="http://api.cakephp.org/3.0/class-Cake.Network.Request.html" target="_blank">`request`</a> et <a href="http://api.cakephp.org/3.0/class-Cake.Network.Response.html" target="_blank">`response`</a>. Les paramètres des routes sont quant à eux injectés en tant que paramètres des méthodes (des actions).

Le contrôleur délègue la génération du contenu de la réponse à une vue. La méthode `\Cake\Controller\Controller::render()` est automatiquement appelée et se charge d'invoquer le template correspondant à l'action (vu plus tard). Le contrôleur peut passer des données au template au moyen de `\Cake\View\ViewVarsTrait::set()`.

```php
$this->set([
    'tweets' => $tweets,
    'hashtag_name' => $name
]);
```

### Les composants (components)

Les composants sont des objets qui peuvent être invoqués par un contrôleur dans le but de remplir une tâche spécifique. Le core de CakePHP 3 embarque des composants pour l'authentification, la manipulation des cookies ou encore l'utilisation de messages flash.

Charger des composants dans un contrôleur peut se faire à l'intérieur du hook `initialize()` du contrôleur.

```php
public function initialize()
{
    $this->loadComponent('Flash');
}
```

Une fois fait, le composant est accessible en tant que variable d'instance du contrôleur :

```php
class UsersController extends Controller
{
    public function add()
    {
        ...
        $this->Flash->success(__('Your account has been created.'));
        ...
    }
}
```

Créer ses propres composants est une solution simple et ludique permettant d'isoler de la logique dans des classes utilisables à l'intérieur d'un ou plusieurs contrôleurs. "Où placer la logique ?" est une des premières questions que je me suis posées. Un cas pratique d'utilisation était la possibilité de télécharger une photo de profil pour les utilisateurs. Le téléchargement d'une image représente une portion de code susceptible de vouloir être ré-utilisée à différents emplacements de l'application.
Comme CakePHP 3 ne semble pas embarquer de composant d'injection de dépendances qui permettrait de travailler avec des classes de service (à l'instar de Symfony 2 par exemple) et qu'avoir recours à l'héritage n'est pas toujours approprié, je me suis lancé de la construction de <a href="https://github.com/aubm/Twitthome-CakePHP3/blob/master/src/Controller/Component/ImageUploadComponent.php" target="_blank">mon propre composant d'upload</a>.

Le composant est une classe résident dans `/src/Controller/Component/` dont le nom doit se terminer par le suffixe `Component`. Si la méthode `initialize()` du composant attend des paramètres (comme c'est le cas pour mon `FileUploadComponent` dont hérite `ImageUploadComponent`) :

```php
class FileUploadComponent extends Component
{
    public function initialize(array $config)
    {
        $this->upload_dir = $this->_getSystemPath($config['upload_dir']);
    }
}
```

Les contrôleurs utilisant le composant fourniront ces paramètres lors du chargement de ce dernier. Exemple dans mon `AccountParametersController` :

```php
class AccountParametersController extends AppController
{
    public function initialize()
    {
        parent::initialize();
        $this->loadComponent('ImageUpload', [
            'upload_dir' => 'webroot/img/avatars'
        ]);
    }
}
```

## La couche Model

### Les tables (repositories)

#### Extraire des données
Utiliser l'ORM pour extraire les informations de la base de données est facile et ne requiert la création d'aucune classe personnalisée.
A l'intérieur de `TweetsController`, l'instruction ci-dessous permet d'extraire l'ensemble des lignes de la table `tweets`.

```php
$tweets = $this->Tweets->find('all')->toArray();
```

Encore une fois, CakePHP 3 repose sur des conventions pour faire fonctionner cette instruction :

- Par soucis de performance (je suppose), les données des tweets ne sont chargées automatiquement que dans le `TweetsController`. Le chargement de ce modèle de données devra <a href="http://api.cakephp.org/3.0/class-Cake.Datasource.ModelAwareTrait.html#_loadModel" target="_blank">être fait manuellement</a> s'il s'agit d'un autre contrôleur.
- Le nom de la table dans la base de données doit correspondre au nom du contrôleur transformé en lower-case + underscores - soit pour cet exemple : `tweets`.

CakePHP 3 matérialise l'interface entre l'application et une table de la base de données par la création d'un objet de type `\Cake\ORM\Table`. Sorti des conventions listées plus haut,  pour créer des règles de validation ou encore pour exploiter des relations avec d'autres tables, vous aurez besoin de créer une classe spécialisée pour matérialiser cette interface.

La classe `TweetsTable` qui étend `\Cake\ORM\Table` dans le fichier `/src/Model/Table/TweetsTable.php` sert justement ce rôle. Le hook `initialize()` est utilisé pour définir les relations avec les autres tables.

```php
public function initialize(array $config)
{
    $this->belongsTo('Users');
    $this->belongsToMany('Hashtags');
}
```

La documentation officielle fournit les informations nécessaires pour <a href="http://book.cakephp.org/3.0/fr/orm/associations.html" target="_blank">utiliser les relations entre les tables</a>.

Il est intéressant de noter que cet appel : `$this->Tweets->find('all');` va - de manière transparente - exécuter la méthode `\Cake\ORM\Table::findAll()`. Il est donc possible de modifier le comportement de cette méthode en la redéfinissant à l'intérieur de `TweetsTable`. Voici comment demander à l'ORM de charger les données des modèles associés, et de trier les résultats du plus récent au plus ancien :

```php
public function findAll(Query $query, array $options)
{
    $query->contain(['Users', 'Users.AccountParameters']);
    $query->order(['Tweets.created' => 'DESC']);
    return $query;
}
```

Cette technique permet de garder les classes de contrôleur DRY tout en continuant d'exploiter toute la puissance de l'ORM. De la même manière il est possible de définir d'autres **finders**. Cette méthode est utilisée afin d'extraire les tweets pour un hashtag donné :

```php
// Dans la classe TweetsTable
public function findTagged(Query $query, array $options)
{
    $query->contain(['Users', 'Users.AccountParameters', 'Hashtags']);
    $query->matching('Hashtags', function ($q) use ($options) {
        return $q->where(['Hashtags.name' => $options['tag_name']]);
    });
    $query->order(['Tweets.created' => 'DESC']);
    return $query;
}
```

```php
// Dans la classe HashtagsController
$this->Tweets->find('tagged', [
    'tag_name' => $tag_name
]);
```

#### Insérer de nouvelles lignes

Insérer de nouvelles lignes dans la base de données ne pose pas de problème particulier.
Pour l'exemple, mon application requiert de pouvoir enregistrer de nouveaux utilisateurs. A chaque nouvel utilisateur, une nouvelle entrée dans la table `account_parameters` doit également être ajoutée.
Le code ci-dessous permet d'accomplir cette tâche avec très peu de code :

```php
class UsersController extends AppController
{
    public function add()
    {
        ...
        $user = $this->Users->newEntity($user_data);
        $user->set('account_parameter', $this->AccountParameters->newEntity());
        $this->Users->save($user);
        ...
    }
}
```

#### Valider des données

CakePHP 3 propose une double approche pour permettre de valider les données d'une entité.
De lors que des données de requête sont converties en entité, CakePHP 3 effectue automatiquement une validation basée sur les règles configurées dans le hook `validationDefault()`. Il est possible à ce niveau de s'assurer qu'une chaine de caractères respecte un format pré-défini ou encore de vérifier qu'un attribut reçoit bien une valeur en s'inspirant de ce code :

```php
class UsersTable extends Table
{
    public function validationDefault(Validator $validator)
    {
        return $validator
            ->notEmpty('username', __('Username must not be empty'))
            ->notEmpty('password', __('Password must not be empty'))
            ->notEmpty('email', __('E-mail must not be empty'))
            ->add('email', 'validFormat', [
                'rule' => 'email',
                'message' => __('E-mail must be valid')
            ])
            ->notEmpty('first_name', __('First name must not be empty'))
            ->notEmpty('last_name', __('Last name must not be empty'));
    }
}
```

D'autre part, lorsqu'une entité s'apprête à être persistée en base de données, CakePHP 3 s'assure que les données respectent les contraintes définies dans le hook `buildRules()`. Il s'agit là de <a href="http://book.cakephp.org/3.0/fr/orm/saving-data.html#appliquer-des-regles-pour-l-application" target="_blank">**règles de domaine**</a>, elles sont relatives à un besoin métier de l'application. Vous pourriez par exemple vous assurer que le statut de ce ticket l'autorise à recevoir un commentaire, ou bien que ce produit est toujours disponible avant de l'ajouter au panier. L'exemple ci-dessous est extrait de Twitthome et montre comment s'assurer de l'unicité des champs `username` et `email` de la table `users` :

```php
class UsersTable extends Table
{
    public function buildRules(RulesChecker $rules)
    {
        $rules->add($rules->isUnique(['username']));
        $rules->add($rules->isUnique(['email']));
        return $rules;
    }
}
```

### Les comportements (behaviors)

Tout comme les composants permettent de factoriser de la logique des contrôleurs, les comportements permettent de réutiliser de la logique de la couche Model. La <a href="http://book.cakephp.org/3.0/fr/orm/behaviors.html" target="_blank">documentation officielle de CakePHP 3</a> les présente comme étant "conceptuellement similaires aux traits". Bien que n'ayant pas eu besoin de créer mes propres comportements, j'ai pu tirer parti de l'utilisation du <a href="http://api.cakephp.org/3.0/class-Cake.ORM.Behavior.TimestampBehavior.html" target="_blank">`TimestampBehavior`</a> (défini dans le core du framework) pour mettre à jour automatiquement les champs `created` et `modified` des tables `tweets` et `users`. Voici comment utiliser un comportement dans une table :

```php
class UsersTable extends Table
{
    public function initialize(array $config)
    {
        $this->addBehavior('Timestamp');
    }
}
```

### Les entités

Les objets table manipulent des objets de type `\Cake\ORM\Entity`. Chaque instance représente une ligne d'une table de la base de données. Comme pour les tables, il est possible de créer des classes spécialisées qui seront utilisées par l'ORM pour représenter les entités de l'application. Ces classes sont définies dans des fichiers à l'intérieur de `/src/Model/Entity/` et leur nom (par convention) correspond au nom de la table ramené au singulier.

Un intérêt d'utiliser des classes spécialisées réside dans la possibilité de surcharger les accesseurs et les mutateurs des différents attributs. Pratique notamment dans le cas de l'entité `User` pour crypter le mot de passe de manière transparente :

```php
class User extends Entity
{
    protected function _setPassword($password)
    {
        return (new DefaultPasswordHasher)->hash($password);
    }
}
```

J'ai utilisé cette même technique afin <a href="https://github.com/aubm/Twitthome-CakePHP3/blob/master/src/Model/Entity/Tweet.php" target="_blank">d'extraire des informations du contenu d'un tweet</a>, comme les hashtags ou les liens externes.

## La couche View

### Les templates

Les templates sont des fichiers contenant essentiellement du code HTML. Ils sont situés dans `/src/Templates/` et portent l'extension `.ctp`. Le répertoire contient les templates responsables du rendu d'une action spécifique d'un contrôleur, mais également des fichiers responsables du rendu des <a href="http://book.cakephp.org/3.0/fr/views.html#elements" target="_blank">éléments</a>, des **cellules** (vu un peu après), ou encore des **layouts**.

Par défaut, le rendu des actions des contrôleurs est encapsulé à l'intérieur du fichier `/src/Template/Layout/default.ctp`. C'est dans ce fichier que doit être inséré le code commun à tous les templates. Pour mieux comprendre, partons du principe que le layout par défaut devrait contenir au minimum le code suivant :

```php
<!DOCTYPE html>
<html>
<head>
	<title><?= $this->fetch('title') ?></title>
</head>
<body>
	<?= $this->fetch('content') ?>
</body>
</html>
```

L'affichage généré par le contrôleur sera rendu à l'emplacement de  `<?= $this->fetch('content') ?>`.  Pour fonctionner, les templates doivent être nommés en corrélation avec le nom des méthodes des contrôleurs. Ainsi la méthode `TweetsController::index()` cherchera par default le fichier `/src/Template/Tweets/index.ctp`.

Le fonctionnement des layouts est basé sur la possibilité de travailler avec des <a href="http://book.cakephp.org/3.0/fr/views.html#utiliser-les-blocks-de-vues" target="_blank">blocks de vue</a> à l'intérieur de vues étendues. Comme vu précédemment, le rendu de l'action sera positionné dans le block `content`, mais il est possible de définir d'autres blocks de façon arbitraire.

Pour l'application Twitthome, je m'étais donné à faire une sidebar dont le contenu serait susceptible de changer d'une page à l'autre. Un cas typique d'utilisation des blocks de vue. J'ai donc modifié mon layout `default.ctp` afin qu'il se rapproche de quelque chose comme ça :

```php
...
<body>
<div class="row">
    <aside class="col-md-4">
        <?= $this->fetch('sidebar') ?>
    </aside>
    <div class="col-md-8">
        <?= $this->fetch('content') ?>
    </div>
</div>
</body>
...
```

Le contenu du block `sidebar` peut maintenant être défini dans un autre template, dans  `/src/Template/Tweets/index.ctp` par exemple :

```php
<?php $this->start('sidebar'); ?>
<p>Contenu de la sidebar !</p>
<?php $this->end(); ?>

<?php foreach($tweets as $tweet): ?>
    ...
<?php endforeach; ?>
```

Dans cet exemple, la variable `$tweets` est issue de l'appel à la méthode `\Cake\View\ViewVarsTrait::set()` dans le contrôleur (cf. partie sur les classes de contrôleur).

### Les helpers

Les helpers sont ce qui facilite la création des templates et ce qui la rend plus ludique. A l'image des composants pour les contrôleurs ou des comportements pour les tables, les helpers permettent de ré-utiliser de la logique de vue. Le core de CakePHP 3 embarque une dizaine de classes helpers chargées par défaut dans les vues et qui permettent entre autres :

De générer des urls :

```php
<a href="<?= $this->Url->build(['_name' => 'login']) ?>"><?= __('Sign in') ?></a>
```

D'afficher des formulaires :

```php
<?= $this->Form->create(new Tweet()); ?>
<?= $this->Form->input('content', [
    'label' => false,
    'class' => 'form-control',
    'placeholder' => __('What\'s up ?')
]); ?>
<?= $this->Form->button(__('Tweeter')); ?>
<?= $this->Form->end(); ?>
```

Ou encore d'insérer une feuille de style :

```php
<?= $this->Html->css('app.min.css') ?>
```

Des classes helpers personnalisées peuvent être ajoutées dans `/src/View/Helper`, leur nom doit se terminer par le suffixe `Helper`.  L'exemple ci-dessous est utilisé dans l'application Twitthome pour générer le code HTML correspondant à l'avatar d'un utilisateur.

```php
class AvatarHelper extends Helper
{
    public $helpers = ['Html'];

    public function render($avatar_file_name)
    {
        $avatar_path = $avatar_file_name ?
            'avatars/' . h($avatar_file_name) : 'no-avatar.jpg';

        return $this->Html->image($avatar_path, [
            'alt' => 'Avatar',
            'class' => 'img-responsive thumbnail'
        ]);
    }
}

// Dans un template ...
...
<?= $this->Avatar->render($avatar_file_name) ?>
...
```

Comme le montre cet exemple, un helper peut dépendre d'autres helpers. Les classes d'helper correspondant aux éléments du tableau `public $helpers` seront automatiquement instanciées et ajoutées comme attributs.

Si vous souhaitez charger vos helpers pour les rendre utilisables à l'échelle de votre application, vous pouvez demander à CakePHP 3 de les instancier dans `AppView`  via le hook `\Cake\View\View::initialize()`.

```php
class AppView extends View
{
    public function initialize()
    {
        $this->loadHelper('Avatar');
    }
}
```

### Les cellules (cells)

Il arrive que des fragments de page HTML dépendent de données qui n'ont pas de lien direct avec le contenu principale de la page. Par exemple : un nuage de tags, un feed Instagram ou une remontée des posts les plus récents d'un blog. Si ces fragments apparaissent dans plusieurs templates, cela implique que les données doivent être rassemblées et passées à la vue dans chaque action de contrôleur correspondant. En adoptant cette approche, le code des contrôleurs risque d'être rapidement pollué. Utiliser des cellules est une solution plus pratique pour répondre à ce genre de problématiques.

La <a href="http://book.cakephp.org/3.0/fr/views/cells.html" target="_blank">documentation officielle du framework</a> définit les cellules comme "des mini-controllers qui peuvent invoquer de la logique de vue et afficher les templates". Dans le cadre de Twitthome, j'ai utilisé une cellule pour afficher le bloc "Tendances". La cellule existe au travers de deux fichiers. Le premier est une classe définie dans `/src/View/Cell/PopularHashtagsCell.php` :

```php
class PopularHashtagsCell extends Cell
{
    public function display()
    {
        $this->loadModel('Hashtags');
        $hashtags = $this->Hashtags->find('popular')->toArray();
        $this->set('hashtags', $hashtags);
    }
}
```

Le comportement de cette classe est similaire à celui d'un contrôleur. Celle-ci est capable de charger un modèle, dans le but d'extraire les informations nécessaires de la base de données. Le second fichier est le template responsable du rendu de la cellule. Ce template est définit dans <a href="https://github.com/aubm/Twitthome-CakePHP3/blob/master/src/Template/Cell/PopularHashtags/display.ctp" target="_blank">`/src/Template/Cell/PopularHashtags/display.ctp`</a>.

Enfin la dernière étape consiste à afficher la cellule à l'intérieur d'un template. Une <a href="http://api.cakephp.org/3.0/class-Cake.View.CellTrait.html#_cell" target="_blank">méthode</a> est justement prévue pour tenir ce rôle.

```php
<?= $this->cell('PopularHashtags'); ?>
```

## Le mot de la fin

Il reste évidemment de nombreux points à aborder. Certains sur lesquels je me suis penchés sont volontairement passés sous silence (comme notamment la partie sur l'internationalisation) afin de ne pas trop alourdir la lecture de cet article. D'autres sujets mériteraient une attention particulière, comme l'outil en ligne de commande, la gestion du cache, les logs ou encore l'intégration des tests.

Ceci étant dit, si cet article ne peut pas prétendre couvrir (même de loin) tous les aspects de CakePHP 3, j'ai bon espoir qu'il aide à se forger un premier avis sur le framework et puisse éventuellement servir de support pour le démarrage d'un projet.
Pour aller plus loin, la <a href="http://book.cakephp.org/3.0/fr/contents.html" target="_blank">documentation officielle</a> est plutôt bien fournie. Elle contient des exemples d'applications, un cookbook complet et une documentation soignée de l'API.

Si le coeur vous en dit, je vous encourage à commenter si vous pensez pouvoir souligner certains axes d'amélioration, autant sur le support (Twitthome) que sur la forme.
Je vous remercie pour la lecture et happy coding à tous !
