package main

import (
	"fmt"
	"github.com/aubm/aubm-website/api"
	"github.com/gorilla/mux"
	"io/ioutil"
	"log"
	"net/http"
	"os"
)

func main() {
	f, err := os.OpenFile("app.log", os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
	defer f.Close()

	if err != nil {
		panic("Error opening log file")
	}
	log.SetOutput(f)

	router := mux.NewRouter()
	apiRouter := router.PathPrefix("/api").Subrouter()
	apiRouter.HandleFunc("/posts", api.GetPosts).Methods("GET")
	apiRouter.HandleFunc("/posts/{postSlug}", api.GetOnePost).Methods("GET")

	fs := http.FileServer(http.Dir("./dist/"))
	router.PathPrefix("/").Handler(&errorHandle{fs})

	http.Handle("/", router)

	fmt.Println("Application running on port 8080")
	http.ListenAndServe(":8080", nil)
}

type errorHandle struct {
	http.Handler
}

func (h *errorHandle) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	h.Handler.ServeHTTP(&errorWriter{w, false}, r)
}

type errorWriter struct {
	http.ResponseWriter
	ignore bool
}

func (w *errorWriter) Write(p []byte) (int, error) {
	if w.ignore {
		var err error
		p, err = ioutil.ReadFile("./dist/index.html")
		if err != nil {
			panic(err)
		}
	}
	return w.ResponseWriter.Write(p)
}

func (w *errorWriter) WriteHeader(status int) {
	if status == 404 {
		w.ignore = true
		w.ResponseWriter.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.ResponseWriter.WriteHeader(200)
	} else {
		w.ResponseWriter.WriteHeader(status)
	}
}
