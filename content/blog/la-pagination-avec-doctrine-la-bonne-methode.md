+++
categories = []
date = "2014-10-06T19:45:13+01:00"
tags = ["PHP", "Symfony", "Doctrine"]
title = "La pagination avec Doctrine : la bonne méthode"

+++

Cet article a pour but de venir compléter la documentation de Doctrine, et plus particulièrement <a href="http://doctrine-orm.readthedocs.org/en/latest/tutorials/pagination.html" target="_blank">la section abordant la pagination</a>, en y apportant quelques précisions, et surtout quelques exemples. En espérant que d'autres y trouveront une utilité, ayant moi-même déjà été confronté à quelques petites incompréhensions quant à l'utilisation du <a href="http://www.doctrine-project.org/api/orm/2.4/class-Doctrine.ORM.Tools.Pagination.Paginator.html" target="_blank">Paginator de Doctrine</a>.

Les exemples de code sont extraits d'une application blog exemple réalisée à l'aide du framework Symfony 2. Cette application comporte une entité Post.

## Pagination simple

Le but est d'afficher un maximum de 20 posts par page, ainsi que le nombre total de posts. Doctrine nous propose d'utiliser la classe `Doctrine\ORM\Tools\Pagination\Paginator`.

Voici comment utiliser cette classe :

```php
class PostRepository extends EntityRepository
{
    public function getPosts($first_result, $max_results = 20)
    {
        $qb = $this->createQueryBuilder('post');
        $qb
            ->select('post')
            ->setFirstResult($first_result)
            ->setMaxResults($max_results);

        $pag = new Paginator($qb);
        return $pag;
    }
}
```

Le constructeur prend en premier paramètre une instance de `Doctrine\ORM\Query` ou de `Doctrine\ORM\QueryBuilder`. Paginator implémente les interfaces Countable et IteratorAggregate, si bien qu'obtenir le total d'enregistrements en base de données est aussi simple que ceci :

```php
count($pag);
```

Lister les 20 premiers posts peut se faire de la façon suivante :

```php
$posts = $post_repository->getPosts(0);
foreach ($posts as $post) {
    echo $post->getTitle() . '&lt;br /&gt;';
}
```

En bonus : le code du template (twig) :

```
{% block body %}
    <ul>
        {% for post in posts %}
            <li>{{ post.title }}</li>
        {% endfor %}
    </ul>
    <p>Total : {{ posts.count }}</p>
{% endblock %}
```

## Pagination avec jointure one-to-many ou many-to-many

Dans certains cas, Doctrine peut utiliser le langage natif du moteur de base de données pour limiter le nombre de résultats et obtenir le total d'enregistrements. Dans d'autres cas, il n'est pas possible de procéder ainsi, et notamment lorsque la requête contient des jointures sur des tables comportant des relations one-to-many ou many-to-many.

Dans ces cas de figure, Doctrine va procéder différemment. Cette procédure, tout à fait transparente, est expliquée <a href="http://doctrine-orm.readthedocs.org/en/latest/tutorials/pagination.html" target="_blank">dans la documentation</a>.

Ajoutons une nouvelle entité Tag qui pourra appartenir à plusieurs Post.

La méthode de la classe repository ressemble maintenant à ceci :

```php
public function getPosts($first_result, $max_results = 20)
{
    $qb = $this->createQueryBuilder('post');
    $qb
        ->select('post')
        ->addSelect('tag')
        ->leftJoin('post.tags', 'tag')
        ->setFirstResult($first_result)
        ->setMaxResults($max_results);

    $pag = new Paginator($qb);
    return $pag;
}
```

Et le template mis à jour :

```
{% block body %}
    <table>
        <thead>
        <tr>
            <th>Post</th>
            <th>Tags</th>
        </tr>
        </thead>
        <tbody>
        {% for post in posts %}
            <tr>
                <td>{{ post.title }}</td>
                <td>
                    {% for tag in post.tags %}
                        {{ tag.name }}
                    {% endfor %}
                </td>
            </tr>
        {% endfor %}
        </tbody>
        <tfooter>
            <tr>
                <td colspan="2">Total : {{ posts|length }}</td>
            </tr>
        </tfooter>
    </table>
{% endblock %}
```

La raison d'être de cet article est en réalité le point que je vais aborder maintenant. Il s'agit d'un piège dans lequel je suis tombé lors de mes premiers essais avec la classe Paginator.

L'objet Paginator permet d'accéder à notre objet Query passé en paramètre du constructeur. Si bien que l'on peut être tenté de l'exploiter directement dans notre template, boycottant ainsi l'utilisation du Paginator. Considérez le code suivant :

```php
$pag = $post_repository->getPosts(0);
$posts = $pag->getQuery()->getResult();
foreach ($posts as $post) {
    echo $post->getTitle() . '<br />';
}
echo 'Total : ' . $pag->count();
```

Si la requête ne comporte pas de jointure, le résultat affiché sera le même. Les suprises arriveront lorsque la requête comportera des jointures. Des anomalies pourraient se produire en raison du fait que l'hydratation d'un objet pourrait nécessiter la lecture de plusieurs lignes.

Un bon moyen d'obtenir le tableau des 20 premiers Post est le suivant :

```php
$posts = $pag->getIterator()->getArrayCopy();
```

Merci pour la lecture et n'hésitez pas à partager :)

Code de l'application exemple : <a href="https://github.com/aubm/tuto-doctrine-pagination" target="_blank">https://github.com/aubm/tuto-doctrine-pagination</a>

Aurélien.
