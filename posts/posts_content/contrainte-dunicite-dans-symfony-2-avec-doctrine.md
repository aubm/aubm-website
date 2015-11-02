## Introduction

Le <a href="http://symfony.com/doc/current/book/validation.html" target="_blank">composant de validation de Symfony</a> embarque des contraintes pré-définies (outre la possibilité de créer des contraintes personnalisées évidemment). Par ailleurs, l'intégration de Doctrine dans le framework full-stack fournit une autre contrainte prête à l'emploi : `UniqueEntity`, qui permet de valider l'unicité dans une table de la base de données d'un ou plusieurs champs d'une entité.

Cette contrainte est référencée dans la <a href="http://symfony.com/doc/current/reference/constraints/UniqueEntity.html" target="_blank">documentation officielle de Symfony</a>. Cet article se propose d'apporter quelques exemples et explications en complément de cette documentation. J'ajoute qu'à l'heure où j'écris, la version en français de la documentation ne semble pas être à jour. Elle est en effet incomplète en comparaison avec la version anglaise qui recense un plus grand nombre d'options.

## Contexte

Les extraits de code de cet article sont issus de l'application exemple <a href="https://github.com/aubm/Doctrine-Unique-Entity-Example-App" target="_blank">dont le code est disponible sur Github</a>. Il s'agit d'une application réalisée à l'aide de Symfony 2.6 Standard Edition. La procédure à suivre pour installer l'application en local (si jamais vous souhaitez tester) est la suivante :

- Installer les pré-requis nécessaires : Git, PHP > 5.3, Composer, MySQL (ou un autre système de base de données compatible).
- Cloner le repo `git clone https://github.com/aubm/Doctrine-Unique-Entity-Example-App.git` et se déplacer dans le répertoire du projet `cd Doctrine-Unique-Entity-Example-App/`.
- Installer les dépendances avec Composer `composer install`
- Modifier au besoin le nom et les paramètres de connexion à la base de données dans `app/config/parameters.yml`.
- Créer la base de données, vous pouvez le faire avec l'outil cli `php app/console doctrine:database:create`.
- Générer le schéma `php app/console doctrine:schema:update --dump-sql --force`.
- Servir l'app `php app/console server:run` (CTLR + C pour arrêter).

Cette application est un système fictif de votes. Il est possible de lui adresser une requête HTTP qui ajoutera une entrée dans la table des votes. Un vote peut être positif ou négatif, cet état est représenté par la colonne `positive` supposée recevoir une valeur `1` ou `0`. Afin d'illustrer l'utilisation de la contrainte `UniqueEntity`, nous souhaitons ajouter une règle d'unicité sur l'IP entrante, afin de ne permettre à un client de n'enregistrer qu'un seul vote.

Si vous avez installé l'application, vous pouvez lui adresser cette requête :

```
POST /votes
positive=1
```

A défaut d'autre chose, <a href="https://chrome.google.com/webstore/detail/postman-rest-client/fdmmgilgnpjigdojojpjoooidkmcomcm" target="_blank">Postman</a> est un outil très pratique pour construire des requêtes HTTP et les envoyer via une interface web.

## Utiliser la contrainte UniqueEntity

Ce code est extrait du contrôleur responsable de l'enregistrement des votes :

```php
public function createAction(Request $request)
{
    $votes_manager = $this->container->get('ab.voting_system.votes_manager');
    $vote = $votes_manager->newEntity([
            'remote_addr' => $request->server->get('REMOTE_ADDR')
        ] + $request->request->all());
    $validation_errors = $votes_manager->validateEntity($vote);
    if (count($validation_errors) == 0) {
        $votes_manager->saveEntity($vote);
        return new JsonResponse(null, 201);
    } else {
        return new JsonResponse(null, 400);
    }
}
```

L'entité `Vote` est une simple classe contenant les attributs suivants :

```php
class Vote
{
    private $id;
    private $positive;
    private $remote_addr;

    ...
}
```

Le mapping des attributs pour Doctrine est défini dans <a href="https://github.com/aubm/Doctrine-Unique-Entity-Example-App/blob/master/src/AB/VotingSystemBundle/Resources/config/doctrine/Vote.orm.yml" target="_blank">`src/AB/VotingSystemBundle/Resources/config/doctrine/Vote.orm.yml`</a>.

Il est possible de réduire légèrement le contrôleur en passant par une classe de formulaire. Pour cette exemple, j'ai fait le choix de valider manuellement l'entité afin de faciliter la compréhension du code (notamment pour des lecteurs moins familiers avec le framework).
L'ajout de la contrainte d'unicité sur `remote_addr` peut être fait en yaml comme ceci :

```yaml
# src/AB/VotingSystem/Resources/config/validation.yml
AB\VotingSystemBundle\Entity\Vote:
    constraints:
        - Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity:
            fields: remote_addr
```

A ce niveau le contrôleur n'autorisera pas l'enregistrement d'une nouvelle ligne si la valeur contenue dans `remote_addr` existe déjà dans la table. A noter que si notre application est servie derrière un proxy, il se peut qu'elle ne se comporte pas comme nous le souhaitons. Auquel cas il serait judicieux d'enregistrer également la valeur de l'en-tête `HTTP_X_FORWARDED_FOR` afin de s'assurer de l'unicité de la paire `remote_addr` + `http_x_forwarded_for` dans la table.

Commençons par mettre à jour l'entité `Vote` :

```php
class Vote
{
    ...
    private $http_x_forwarded_for;
    ...
}
```

Puis le fichier de configuration des contraintes de validation :

```yaml
# src/AB/VotingSystem/Resources/config/validation.yml
AB\VotingSystemBundle\Entity\Vote:
    constraints:
        - Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity:
            fields: [remote_addr, http_x_forwarded_for]
```

`fields` prend maintenant un tableau de champs à vérifier. Il faut préciser que Symfony s'assurera de l'unicité *du groupe de champs* et non des deux champs de manière isolée.

## Contrainte UniqueEntity et champ nullable

Un comportement par défaut de la contrainte `UniqueEntity` dont il faut être conscient est que celle-ci n'enregistrera aucune erreur si un ou plusieurs champs ont une valeur nulle (autrement dit, la contrainte sera ignorée). Dans l'état, il est donc possible dans la table en base de données d'avoir ces valeurs enregistrées :

<table class="table table-condensed">
<thead>
    <tr>
        <th>id</th>
        <th>positive</th>
        <th>remote_addr</th>
        <th>http_x_forwarded_for</th>
    </tr>
</thead>
<tbody>
    <tr>
        <td>1</td>
        <td>0</td>
        <td>80.13.81.94</td>
        <td>NULL</td>
    </tr>
    <tr>
        <td>2</td>
        <td>1</td>
        <td class="text-danger">213.80.109.42</td>
        <td>NULL</td>
    </tr>
    <tr>
        <td>3</td>
        <td>1</td>
        <td class="text-danger">213.80.109.42</td>
        <td>NULL</td>
    </tr>
    <tr>
        <td>4</td>
        <td>1</td>
        <td class="text-danger">213.80.109.42</td>
        <td>NULL</td>
    </tr>
</tbody>
</table>

Dans le cas de cette application, ce comportement n'est pas celui attendu. Il est donc nécessaire de définir une autre valeur pour l'option `ignoreNull` :

```yaml
# src/AB/VotingSystem/Resources/config/validation.yml
AB\VotingSystemBundle\Entity\Vote:
    constraints:
        - Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity:
            fields: [remote_addr, http_x_forwarded_for]
            ignoreNull: false
```

Cette fois tout devrait être bon :)
