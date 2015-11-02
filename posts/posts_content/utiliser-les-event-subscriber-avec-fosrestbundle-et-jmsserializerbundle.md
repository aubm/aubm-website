## Présentation de la problèmatique

J'écris cet article car j'ai été confronté à une problématique lors d'un projet que j'ai réalisé il y a peu. Le projet impliquait la création d'un webservice au standard Rest dans une application Symfony2. J'ai fait le choix d'utiliser FosRestBundle et JMSSerializerBundle. Pour en apprendre plus sur l'utilisation de ces bundles, je vous invite à consulter <a href="http://obtao.com/blog/2013/12/creer-une-api-rest-dans-une-application-symfony/" target="_blank">cet article</a> du blog de obtao.com. Le problème auquel j'ai été confronté était le suivant.

Une méthode du webservice devait retourner une collection d'objets de la classe File suivante (j'épure volontairement le code) :

```php
class File
{    
    private $id;
    private $originalClientName;
    private $filename;
}
```

Le nom du fichier original qui a été uploadé est conservé dans l'attribut $originalClientName. Potentiellement, cet attribut contient des valeurs comme "chat.jpg" ou "photos.zip" L'attribut $filename quant à lui contient le nom du fichier tel qu'il est stocké sur le serveur, il s'agit d'une chaîne de caractères aléatoire générée lors de l'enregistrement de l'entité dans la base de données.

La représentation json retournée par le webservice pour chaque entité File devait être de la forme suivante.

```json
{
    "id" : 34,
    "originalClientName" : "chat.jpg",
    "downloadUrl" : "http://mon-serveur.com/download/z3r4gez775gd2dczzdf261gr0y66e"
}
```

Comme on peut le voir, l'attribut $filename (supposé contenir la string `"z3r4gez775gd2dczzdf261gr0y66e"` dans cet exemple), n'est pas directement retourné dans le flux. Il s'agit en fait d'une uri facilement exploitable pour le client, pointant directement vers la  resource. Ayant parcouru la document du JMSSerializerBundle j'ai pensé à utiliser l'annotion `@VirtualProperty` sur une méthode de mon entité File qui ressemblerait à ceci.

```php
class File
{
    private $id;
    private $originalClientName;
    private $filename;

    /**
    * @VirtualProperty
    */
    public function getDownloadUrl()
    {
        return "http://mon-serveur.com/download/" . $this->filename;
    }
}
```

Je n'aimais qu'à moitié cette solution car elle m'imposait d'écrire mon uri "en dur" dans le code source de mon entité. Cela pouvait poser problème si pendant le développement je voulais changer de hostname et tout simplement passer d'un environnement à un autre (dev -> prod ou l'inverse).

J'ai donc voulu utiliser le service "router" de Symfony pour générer l'uri dynamiquement. Sauf que manque de chance, utiliser un service dans une entité, ce n'est pas si simple à faire. Et ce pour la bonne raison que c'est une mauvaise pratique, l'entité devant pouvoir exister de façon indépendante à tout service externe.

Epluchant les documentations et les forums, je ne trouvais pas de solution simple ou suffisamment "good practice" à mon goût pour régler le problème. J'avais d'abord réfléchi à une solution qui me permettrait d'injecter un service dans une classe abtraite, ce qui me permettrait d'appeler une méthode statique sur cette classe. Mais ça me paraissait bien compliqué à réaliser, voire même tout simplement impossible.

Je suis finalement tombé sur un forum, dans lequel une personne rencontrant une problématique semblable à la mienne se voyait soumettre un début de solution qui a pu m'aider à me dépatouiller.

## Ma solution

La solution que j'ai choisie pour répondre à cette problématique consistait à utiliser la <a href="http://jmsyst.com/libs/serializer/master/event_system" target="_blank">gestion des évènements du serializer</a>. Concrétement, voici comment j'ai exploité cette fonctionnalité dans mon webservice. Dans la configuration de mes services (au niveau de mon WebServiceBundle), j'ai ajouté le service défini de la façon suivante :

```yml
parameters:
    aubm_web_service.serialize_handler_file.class: Aubm\WebServiceBundle\SerializeEventHandler\FileHandler
services:
    aubm_web_service.serialize_handler_file:
    class: %aubm_web_service.serialize_handler_file.class%
    tags:
        - { name: jms_serializer.event_subscriber }
```

L'astuce ici est d'ajouter le tag `jms_serializer.event_subscriber` au service. Si vous n'avez jamais travaillé avec les services taggés, n'hésitez pas à parcourir rapidement la <a href="http://symfony.com/fr/doc/current/components/dependency_injection/tags.html" target="_blank">documentation officielle du framework</a> afin de mieux comprendre leur utilité. Le tag `jms_serializer.event_subscriber` va indiquer au serializer qu'il doit effectuer un certains nombre d'actions sur ce service lors de certaines étapes de la serialisation des objets. Le "quoi effectuer" et "quand l'effectuer" sont définis dans le service lui même. Ce service doit implémenter l'interface `\JMS\Serializer\EventDispatcher\EventSubscriberInterface` et doit donc implémenter la méthode statique `getSubscribedEvents`. Voici le code de la classe du service.

```php
class FileHandler implements EventSubscriberInterface
{
    /**
    * {@inheritdoc}
    */
    public static function getSubscribedEvents()
    {
        return array(
            array('event' => 'serializer.pre_serialize', 'method' => 'onPreSerialize', 'class' => 'Aubm\WebServiceBundle\Entity\File'),
        );
    }

    public function onPreSerialize(PreSerializeEvent $event)
    {
        $file = $event->getObject();
        // effectuer des manipulation sur l'objet avant sa serialisation ...
    }
}
```

Dans la méthode onPreSerialize, je peux manipuler mon entité File comme je souhaite avant sa sérialisation. Par ailleurs, ma classe FileHandler est définie en tant que service dans ma configuration, je peux donc y injecter toutes les dépendances dont j'ai besoin. Pour la suite, le code parle de lui-même ...

Dans mon entité File ...

```php
class File
{
    ...

    private $downloadUrl;

    public function setDownloadUrl($downloadUrl)
    {
        $this->downloadUrl = $downloadUrl;
    }

    public function getDownloadUrl()
    {
        return $this->downloadUrl;
    }

    ...
}
```

Dans mon services.yml ...

```yml
parameters:
    aubm_web_service.serialize_handler_file.class: Aubm\WebServiceBundle\SerializeEventHandler\FileHandler
services:
    aubm_web_service.serialize_handler_file:
    class: %aubm_web_service.serialize_handler_file.class%
    arguments:
        router: "@router"
    tags:
        - { name: jms_serializer.event_subscriber }
```

Enfin, dans ma classe de service FileHandler ...

```php
public function onPreSerialize(PreSerializeEvent $event)
{
    $file = $event->getObject();
    $file->setDownloadUrl(
        $this->router->generate("aubm_download_file", array(
            "filename" => $file->getFilename()
        ));
    );
}
```

En espérant que cet article pourra aider des personnes à la recherche d'une solution pour un problème similaire, merci de m'avoir lu et n'hésitez pas à backlinker :)

Aurélien.
