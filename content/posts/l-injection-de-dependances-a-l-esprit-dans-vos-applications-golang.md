+++
categories = []
date = "2016-05-09T18:45:44+01:00"
tags = ["Golang"]
title = "L'injection de dépendances à l'esprit dans vos applications Golang"
+++

L'injection de dépendances est utilisée pour séparer les responsabilités entre les briques d'une application.
Ce pattern couplé à une stratégie d'abstraction utilisant efficacement des interfaces permet également
de simplifier l'écriture des tests unitaires. L'intérêt étant de pouvoir remplacer une implémentation par une autre, supprimant
ainsi les potentiels effets de bords (requête en base de données, écriture sur le disque, requête HTTP, etc ...).

Dans cet article, je vais vous présenter une approche permettant d'appliquer ces principes à du code Go de façon simple et pratique.

## Un problème

L'apporche la plus directe pour récupérer une liste d'articles en base de données et les servir au format JSON est la suivante :

```
package main

import (
    "database/sql"
    "encoding/json"
    "fmt"
    "net/http"

    _ "github.com/go-sql-driver/mysql"
)

type Post struct {
    Title   string `json:"title"`
    Content string `json:"content"`
}

func main() {
    http.HandleFunc("/posts", func(w http.ResponseWriter, r *http.Request) {
        db, err := sql.Open("mysql", "root:root@/my_posts")
        defer db.Close()
        rows, err := db.Query("SELECT title, content FROM posts")
        if err != nil {
            http.Error(w, "Internal server error", 500)
            return
        }
        defer rows.Close()
        posts := []Post{}
        for rows.Next() {
            p := Post{}
            err := rows.Scan(&p.Title, &p.Content)
            if err != nil {
                http.Error(w, "Internal server error", 500)
                return
            }
            posts = append(posts, p)
        }
        b, err := json.Marshal(posts)
        if err != nil {
            http.Error(w, "Internal server error", 500)
            return
        }
        w.Write(b)
        w.Header().Set("Content-Type", "application/json")
    })
    fmt.Println("Application started on port 8080")
    http.ListenAndServe(":8080", nil)
}
```

Le code est facile à comprendre et tient en moins de 50 lignes, cependant mis à l'échelle d'une application du monde réel,
il présente des défauts évidents :

- il est impossible de réutiliser la moindre portion de code
- les différents rôles sont étroitement liés, les effets de bord de potentielles modifications dans la récupération des données
  sur la construction de la réponse HTTP sont difficiles à contrôler
- il ne permet pas d'écrire de tests unitaires efficacement

## Une solution

Construire l'application avec l'injection de dépendances à l'esprit permet d'apporter une solution à ces différents problèmes.
Dans cette nouvelle approche, plusieurs structures sont identifiées.

### Un serializer JSON

```
type DefaultEncoder struct{}

func (de *DefaultEncoder) ToJSON(w http.ResponseWriter, src interface{}) {
    b, err := json.Marshal(src)
    if err != nil {
        http.Error(w, "Internal server error", 500)
        return
    }
    w.Write(b)
    w.Header().Set("Content-Type", "application/json")
}
```

Cette structure expose une méthode `ToJSON` qui écrit la résultat sérialisé en JSON du second paramètre `src interface{}`
dans le premier `w http.ResponseWriter`.

### Un gestionnaire contenant le code métier non relatif à la couche HTTP

```
type PostsManager struct {
    DB *sql.DB
}

func (pm *PostsManager) FindPosts() ([]Post, error) {
    rows, err := pm.DB.Query("SELECT title, content FROM posts")
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    posts := []Post{}
    for rows.Next() {
        p := Post{}
        err := rows.Scan(&p.Title, &p.Content)
        if err != nil {
            return nil, err
        }
        posts = append(posts, p)
    }
    return posts, nil
}
```

Cette structure expose une méthode `FindPosts` qui founit en retour une liste de posts.
Il est nécessaire de fournir un pointeur vers une instance de `sql.DB` à la construction.
A noter que la construction de ce paramètre n'est pas directement pris en charge par `PostsManager`, ce qui est offre
une certaine souplesse pour ce qui est de l'écriture des tests. En effet il ne sera pas nécessaire de déployer une instance
de MySQL, enregistrer [un driver de mocks](https://godoc.org/github.com/DATA-DOG/go-sqlmock) sera bien plus pratique.

### Une interface HTTP

```
type PostsHandlers struct {
    Manager interface {
        FindPosts() ([]Post, error)
    }
    Encoder interface {
        ToJSON(w http.ResponseWriter, src interface{})
    }
}

func (ph *PostsHandlers) GetPosts(w http.ResponseWriter, r *http.Request) {
    posts, err := ph.Manager.FindPosts()
    if err != nil {
        http.Error(w, "internal server error", 500)
        return
    }
    ph.Encoder.ToJSON(w, posts)
}
```

Cette structure expose une méthode `GetPosts` capable de servir une liste de posts traduite en JSON via une interface HTTP.
Il est intéressant de noter que cette structure possède deux dépendances définies comme étant des interfaces.
Bien évidemment, `DefaultEncoder` et `PostsManager` sont conçues de façon à satisfaire ces interfaces.
Encore une fois, outre la valeur apportée au regard du découplage du code, cela permet également de simplifier l'écriture des tests
en [fournissant des mocks](https://github.com/stretchr/testify#mock-package) à `PostsHandlers`.

### L'assemblage simplifié grâce à facebookgo/inject

La fonction `main` est maintenant ramenée à :

```
func main() {
    db, err := sql.Open("mysql", "root:root@/my_posts")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    postsManager := &PostsManager{DB: db}
    encoder := &DefaultEncoder{}
    postsHandlers := &PostsHandlers{Manager: postsManager, Encoder: encoder}

    http.HandleFunc("/posts", postsHandlers.GetPosts)

    fmt.Println("Application started on port 8080")
    http.ListenAndServe(":8080", nil)
}
```

Il apparaît que si la construction de l'arbre des dépendances est relativement simple dans ce cas, elle n'en reste pas moins peu pratique.
Dans des cas plus complexes, il peut être intéressant de considérer l'utilisation de [facebookgo/inject](https://github.com/facebookgo/inject).
Il s'agit d'une librarie capable de résoudre automatiquement les dépendances d'une liste d'objets incomplets, au runtime et sans génération de code.

La définition des structures, et la construction des objets ressemblent maintenant à ceci :

```
type PostsHandlers struct {
    Manager interface {
        FindPosts() ([]Post, error)
    } `inject:""`
    Encoder interface {
        ToJSON(w http.ResponseWriter, src interface{})
    } `inject:""`
}
```

```
type PostsManager struct {
    DB *sql.DB `inject:""`
}
```

```
type DefaultEncoder struct{}
```

A noter : le tag `inject:""` sur les champs qu'`inject` devra prendre en charge.

```
var postsManager PostsManager
var encoder DefaultEncoder
var postsHandlers PostsHandlers

if err := inject.Populate(db, &postsHandlers, &encoder, &postsManager); err != nil {
    fmt.Fprintln(os.Stderr, err)
    os.Exit(1)
}
```

Le code complet [est disponible ici](https://github.com/aubm/dependency-injection-by-example) :).

Et vous, quelle(s) solution(s) utilisez-vous pour découpler efficacement votre code Go ? :)
