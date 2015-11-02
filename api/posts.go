package api

import (
	"github.com/aubm/aubm-website/posts"
	"github.com/gorilla/mux"
	"io"
	"net/http"
)

func GetPosts(w http.ResponseWriter, r *http.Request) {
	p := posts.GetPosts()

	w.Header().Set("Content-Type", "application/json")
	io.WriteString(w, string(toJson(p)[:]))
}

func GetOnePost(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	p, err := posts.GetOnePostBySlug(vars["postSlug"])
	if err != nil {
		http.Error(w, "Post not found", 404)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	io.WriteString(w, string(toJson(p)[:]))
}
