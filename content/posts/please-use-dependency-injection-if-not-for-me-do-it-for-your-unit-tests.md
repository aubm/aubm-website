---
title: "Please Use Dependency Injection, If Not For Me, Do It For Your Unit Tests"
date: 2022-08-10T18:10:01-04:00
draft: false
tags: [Golang]
---

TLDR; see title.

Long time no see, and it's been a while since we haven't talked about Go.
I still love the language, I still use it on a daily basis, and today I feel like talking a bit
about dependency injection. So hold on to your seats because it's going to get boring very soon, or not we'll see.

## What's the problem?

Take the following file.
It has a `Fetch` function that takes base currency and a target currency, and it fetches the exchange rate between
the two currencies by contacting an API that has that information in JSON format.

```golang
package exchangerate

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

const (
    exchangeRateApiAddrEnvVar = "EXCHANGE_RATE_API_ADDR"
)

func Fetch(base, target string) (rate float64, err error) {
    addr := "https://api.exchangerate.host"
    if s := os.Getenv(exchangeRateApiAddrEnvVar); s != "" {
        addr = s
    }

    resp, err := http.Get(fmt.Sprintf("%s/latest?base=%s&symbols=%s", addr, base, target))
    if err != nil {
        return 0, fmt.Errorf("failed to contact exchangerate API: %w", err)
    }
    defer resp.Body.Close()

    r := ExchangeRatesApiResponse{}
    if err := json.NewDecoder(resp.Body).Decode(&r); err != nil {
        return 0, fmt.Errorf("failed to json decode exchange rate api response: %w", err)
    }

    return r.Rates[target], nil
}

type ExchangeRatesApiResponse struct {
    Rates map[string]float64 `json:"rates"`
}
```

Let's say we want to write a unit test for `Fetch`.
Since it's going to be easier to write it if we control the data returned by the API,
and since we can't change what the actual API returns (at least I can't, and maybe you can
and if that's the case, well thank you this is a cool API), we have made the function to
fetch the address set in an environment variable.

So we'll use that to make the test use a local test HTTP server.
It's easy enough, let's do this.


```golang
package exchangerate

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFetch(t *testing.T) {
	tests := []struct {
		name         string
		base         string
		target       string
		expectedRate float64
	}{
		{
			name:         "EUR -> CAD",
			base:         "EUR",
			target:       "CAD",
			expectedRate: 1.30,
		},
		{
			name:         "CAD -> EUR",
			base:         "CAD",
			target:       "EUR",
			expectedRate: 0.75,
		},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			testServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				assert.Equal(t, fmt.Sprintf("/latest?base=%s&symbols=%s", test.base, test.target), r.URL.String())
				_ = json.NewEncoder(w).Encode(&ExchangeRatesApiResponse{
					Rates: map[string]float64{
						"CAD": 1.30,
						"EUR": 0.75,
					},
				})
			}))
			defer testServer.Close()
			_ = os.Setenv(exchangeRateApiAddrEnvVar, testServer.URL)

			rate, err := Fetch(test.base, test.target)
			assert.NoError(t, err)
			assert.Equal(t, test.expectedRate, rate)
		})
	}
}
```

There, the function has a test.

## Okay but what's the problem?

Here is the main file.
It just calls the `Fetch` function and passes it the base currency and the target currency
that it got from command flags.

```golang
package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/aubm/golang-dependency-injection/pkg/exchangerate"
)

func main() {
	var base string
	var target string
	flag.StringVar(&base, "base", "EUR", "the base currency")
	flag.StringVar(&target, "target", "CAD", "the target currency")
	flag.Parse()

	rate, err := exchangerate.Fetch(base, target)
	if err != nil {
		_, _ = fmt.Fprintf(os.Stderr, "failed to fetch %s to %s exchange rate: %v", base, target, err)
	}

	_, _ = fmt.Fprintf(os.Stdout, "%s to %s exchange rate is %v", base, target, rate)
}
```

Now to the problem: since `Fetch(...)` is baked in `main`, if we want
to write a unit test on the main function, we'll have to do the whole
local test http server sh*t again, which is boring (told you) and really
doesn't scale when the code base gains weight.

Let's talk about two very similar techniques to tackle that situation
that I've observed, and why I think they're wrong.

## Make it tomorrow's problem

This is actually a pretty smart technique in situations where the person
who will be working on the project tomorrow is not you.
Some will argue that it is not nice, but I'm not here to judge.

In most situations however, that person is going to be you, and pooping on the floor
that is yours to clean is not a very rational thing to do.
But again I'm not here to judge, so if you think this is okay, by all
means, poop away!

## Make do

Here is the deal: if we don't want to repeat the things we've done in the unit test
for `Fetch`, let's just test the most of `main` that is not the call to `Fetch`.

Here is what the new `main` function looks like.

```golang
package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/aubm/golang-dependency-injection/pkg/exchangerate"
)

func main() {
	base, target := getBaseAndTarget()

	rate, err := exchangerate.Fetch(base, target)
	if err != nil {
		_, _ = fmt.Fprintf(os.Stderr, "failed to fetch %s to %s exchange rate: %v", base, target, err)
	}

	_, _ = fmt.Fprintf(os.Stdout, "%s to %s exchange rate is %v", base, target, rate)
}

func getBaseAndTarget() (string, string) {
	var base string
	var target string
	flag.StringVar(&base, "base", "EUR", "the base currency")
	flag.StringVar(&target, "target", "CAD", "the target currency")
	flag.Parse()
	return base, target
}
```

There, now we can just have a unit test on `getBaseAndTarget` and job done.
If you feel satisfied with this solution, then I respectfully disagree.

To me this feels like admitting our defeat.
We paid the lack of a better solution in test reliability.
Conclusion: Go sucks, programming sucks, bye.

![David Goodenough](/img/david-goodenough.webp)

Or we can try another approach.

## Dependency injection is your scary friend

Look at this new main file.

```golang
package main

import (
	"log"

	"github.com/aubm/golang-dependency-injection/pkg/app"
)

func main() {
	app := app.Initialize()
	app.Run()
}
```

Beautiful, isn't it? I like it empty too.

Now I've moved everything into a new `app` package.
Let's open it and see what is different from before.

This is `app.go`.

```golang
package app

import (
	"flag"
	"fmt"
	"os"

	"github.com/aubm/golang-dependency-injection/pkg/exchangerate"
)

func NewApp(fetcher *exchangerate.ApiFetcher) *App {
	return &App{fetcher: fetcher}
}

type App struct {
	fetcher exchangerate.Fetcher
}

func (a *App) Run() error {
	var base string
	var target string
	flag.StringVar(&base, "base", "EUR", "the base currency")
	flag.StringVar(&target, "target", "CAD", "the target currency")
	flag.Parse()

	rate, err := a.fetcher.Fetch(base, target)
	if err != nil {
		return fmt.Errorf("failed to fetch %s to %s exchange rate: %w", base, target, err)
	}

	_, _ = fmt.Fprintf(os.Stdout, "%s to %s exchange rate is %v", base, target, rate)
	return nil
}
```

Everything that used to be in `main` is now in `Run`, with one
little change though: `Run` is attached to `*App`, which has a `fetcher` property
of type `exchangerate.Fetcher`.

What is it, you asked? It's an interface, take a look at it.

```golang
type Fetcher interface {
    Fetch(base, target string) (rate float64, err error)
}
```

What's good with an interface is that you can pass an actual
implementation, let say something like that.

```golang
func NewApiFetcher() *ApiFetcher {
    return &ApiFetcher{}
}

type ApiFetcher struct{}

func (*ApiFetcher) Fetch(base, target string) (rate float64, err error) {
    // nothing new under the sun
}
```

or you something completely different, say...

```golang
type MockFetcher struct{}

func (*MockFetcher) Fetch(base, target string) (rate float64, err error) {
	println("I do nothing lol")
	return 0, nil
}
```

And with that, we could write a proper unit test on `*App.Run`, because that
will build.

```golang
package app

import "testing"

func TestApp_Run(t *testing.T) {
	app := &App{
		fetcher: &MockFetcher{},
	}
	app.Run()
}
```

And the cherry on the top: to a certain extent (which is the interface definition)
we can change the implementation of `*ApiFetch.Fetch` without changing a single line
to `*App.Run` or its unit test. Now we have scalability.

![Success kid](/img/success-kid.jpeg)

In a real world case, it would be good to have `MockFetcher` work for us
by making the returned values configurable so that we can test how `*App.Run`
reacts to different values. For the test to be complete, we would also want to
make sure `*App.fetcher.Fetch` is actually called.
There are libraries out there that can help you generate mocks based on interfaces
definitions. One I like is [github.com/golang/mock](https://github.com/golang/mock).

## Bonus take

You notice that I haven't zoomed in `app.Initialize()`, which is the first line in the
new almost empty `main`.

I assume you guessed what's in there but let's look anyway at `init.go`.

```golang
package app

import "github.com/aubm/golang-dependency-injection/pkg/exchangerate"

func Initialize() *App {
	fetcher := exchangerate.NewApiFetcher()
	app := NewApp(fetcher)
	return app
}
```

Here we use the constructor functions that we saw earlier
to build the whole application graph.

Since in this case we only have two types, this is easy enough.
But keeping `Initialize` in sync with the changes throughout a codebase that
goes larger and larger as we add more types that depend on each others is boring.
It's not particularly difficult, but it really is boring.

This is something [github.com/google/wire](https://github.com/google/wire) can help you with.
