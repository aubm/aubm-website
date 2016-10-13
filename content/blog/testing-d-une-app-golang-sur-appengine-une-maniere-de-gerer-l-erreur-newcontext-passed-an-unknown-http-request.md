+++
categories = []
date = "2016-10-13T19:38:59+02:00"
tags = []
title = "Testing d'une app golang sur AppEngine : une manière de gérer l'erreur NewContext passed an unknown http.Request"

+++

## TLDR;

La solution sur Github : https://github.com/aubm/my-test-app

## Mise en évidence du problème

Déployer du go sur AppEngine, c'est cool, se retrouver perplexe lors de l'éxecution des tests face à cette erreur : `panic: appengine: NewContext passed an unknown http.Request`, c'est moins cool.

Trainer ces objets `context` un peu partout dans les couches de l'application n'est pas un aspect très agréable du développement d'une appli web en go.
Sur AppEngine, c'est d'autant plus problématique que le contexte doit être créé à partir d'une requête dont AppEngine a connaissance.

Dans le cas d'un test, une requête passée en paramètre d'un http handler est généralement créée programmatiquement à l'aide de quelque chose comme `req, _ := http.NewRequest("GET", "/", nil)`.

Utilisez cette requête pour créer un contexte avec `ctx := appengine.NewContext(r)` et votre application paniquera lamentablement.

Juste pour illustrer, voici un exemple de code que nous voudrions tester :

```
package app

import (
    "encoding/json"
    "net/http"

    "golang.org/x/net/context"
    "google.golang.org/appengine"
)

func init() {
    booksHandlers := &BooksHandlers{}

    http.HandleFunc("/books", booksHandlers.GetBooks)
}

type BooksHandlers struct {
    BooksService interface {
        FindAll(ctx context.Context) []Book
    }
}

func (h *BooksHandlers) GetBooks(w http.ResponseWriter, r *http.Request) {
    ctx := appengine.NewContext(r)

    books := h.BooksService.FindAll(ctx)

    w.Header().Set("Content-Type", "application/json")
    if err := json.NewEncoder(w).Encode(books); err != nil {
        http.Error(w, "An error occured when encoding JSON", 500)
    }
}

type Book struct {
    Title  string `json:"title"`
    Author string `json:"author"`
}
```

Le contenu du fichier de test :

```
package app

import (
    "net/http"
    "net/http/httptest"
    "testing"

    "golang.org/x/net/context"
)

func TestGetBooks(t *testing.T) {
    w := httptest.NewRecorder()
    r, _ := http.NewRequest("GET", "/", nil)

    mockBooksService := &MockBooksService{}
    h := BooksHandlers{BooksService: mockBooksService}

    h.GetBooks(w, r)

    body := w.Body.String()
    expected := `[{"title":"The Lord of the Rings","author":"J.J.R. Tolkien"},{"title":"Harry Potter","author":"J.K. Rolling"}]
`

    if body != expected {
        t.Errorf("Expected %v, got %v", expected, body)
    }
}

type MockBooksService struct{}

func (m *MockBooksService) FindAll(ctx context.Context) []Book {
    return []Book{
        {Title: "The Lord of the Rings", Author: "J.J.R. Tolkien"},
        {Title: "Harry Potter", Author: "J.K. Rolling"},
    }
}
```

Et un extrait de la sortie standard :

```
2016/10/13 20:05:10 appengine: NewContext passed an unknown http.Request
--- FAIL: TestGetBooks (0.00s)
panic: appengine: NewContext passed an unknown http.Request [recovered]
    panic: appengine: NewContext passed an unknown http.Request

goroutine 5 [running]:
panic(0x25f120, 0xc4201001b0)
    /usr/local/go/src/runtime/panic.go:500 +0x1a1
testing.tRunner.func1(0xc420090180)
    /usr/local/go/src/testing/testing.go:579 +0x25d
panic(0x25f120, 0xc4201001b0)
    /usr/local/go/src/runtime/panic.go:458 +0x243
```

Sur les forums, plusieurs solutions sont évoquées pour contourner le problème, ceci dit aucune ne m'a réellement séduit.
Je vous présente maintenant une solution que je trouve suffisamment élégante pour retrouver le sommeil.

## Une solution

L'idée est d'encapsuler la création du contexte dans un service, que l'on sera en capacité de remplacer par un mock pour les tests.

La définition du type `BooksHandlers` ressemble maintenant à ceci :

```
type BooksHandlers struct {
    BooksService interface {
        FindAll(ctx context.Context) []Book
    }
    Context interface {
        Get(r *http.Request) context.Context
    }
}
```

Dans la méthode `GetBooks`, le contexte est maintenant créé de façon :

```
ctx := h.Context.Get(r)
```

L'implémentation utilisée pour `Context` est très simple :

```
type ContextProvider struct{}

func (p *ContextProvider) Get(r *http.Request) context.Context {
    return appengine.NewContext(r)
}
```

Et il en va de même pour sa cousine mockée :

```
type MockContextProvider struct{}

func (m *MockContextProvider) Get(r *http.Request) context.Context {
    return context.Background()
}
```

Tous les voyants sont maintenant au vert.
Voici le lien vers le code sur Github : https://github.com/aubm/my-test-app.

A la prochaine !
