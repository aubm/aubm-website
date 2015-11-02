Si vous choisissez Symfony pour construire une application de webservice, il est un détail à relever à propos des champs de type Datetime dans le cas d'utilisation des objets formulaires.

Prenons par exemple ce code qui génère un formulaire à partir des champs d'une entité Post fictive :

```php
$builder
    ->add('title')
    ->add('content')
    ->add('published')
     ;
```

Dans cet exemple, le champ published est de type Datetime. Si on utilise ce formulaire pour générer du code HTML, Symfony générera pour le champ published le code suivant :

```html
<div>
    <label class="required">Published</label>
    <div id="acme_demobundle_post_published">
        <div id="acme_demobundle_post_published_date">
            <select id="acme_demobundle_post_published_date_year" name="acme_demobundle_post[published][date][year]">
                <option value="2009">2009</option>
                <option value="2010">2010</option>
                ...
            </select>
            <select id="acme_demobundle_post_published_date_month" name="acme_demobundle_post[published][date][month]">
                <option value="1">Jan</option>
                <option value="2">Feb</option>
                ...
            </select>
            <select id="acme_demobundle_post_published_date_day" name="acme_demobundle_post[published][date][day]">
                <option value="1">1</option>
                <option value="2">2</option>
                ...
            </select>
        </div>
        <div id="acme_demobundle_post_published_time">
            <select id="acme_demobundle_post_published_time_hour" name="acme_demobundle_post[published][time][hour]">
                <option value="0">00</option>
                <option value="1">01</option>
                <option value="2">02</option>
                ...
            </select>
            <select id="acme_demobundle_post_published_time_minute" name="acme_demobundle_post[published][time][minute]">
                <option value="0">00</option>
                <option value="1">01</option>
                <option value="2">02</option>
                ...
            </select>
        </div>
    </div>
</div>
```

A noter que la valeur du champs est construite dans un tableau rassemblant les différents informations year, month, day, etc ...

Si on utilise ce formulaire pour mettre à jour les informations d'un objet Post via une route `PUT /posts/{postId}` par exemple, le client devra construire la valeur de l'attribut published de la même façon que dans ce formulaire. Soit quelque chose comme ça :

```
published[date][year] = 2000
published[date][month] = 12
published[date][day] = 15
published[time][hour] = 12
published[time][minute] = 12
```

Voilà qui pourrait convenir, cependant pour une question de simplicité pour le client, nous souhaitons que celui-ci nous envoie l'information published de cette façon :

```
published = 2000-12-15
```

Pour ce faire, la solution est très simple, il suffit de changer la valeur par défaut de certaines options de l'entrée published de la classe du formulaire.

Voici le code du formulaire, modifié de façon à ce qu'il se comporte comme nous le souhaitons :

```php
$builder
    ->add('title')
    ->add('content')
    ->add('published', null, array(
        "widget" => "single_text",
        "format" => "yyyy-MM-dd",
     ))
     ;
```

Nous avons défini deux options. L'option widget est définie à single_text de manière à ce que le formulaire attende la valeur du champ dans une seule variable. L'option format quant à elle permet de définir le format qui est attendu pour la date.

N'hésitez pas à consulter la <a href="http://symfony.com/fr/doc/current/reference/forms/types/date.html" target="_blank">documentation de Symfony</a> pour en savoir plus sur ces options ainsi que sur les autres options disponibles pour le type champ Date.
