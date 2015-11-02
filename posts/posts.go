package posts

import (
	"bufio"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
)

var dataDir string = "./posts/posts_content"

func GetPosts() []Post {
	var p []Post
	file, _ := os.Open(dataDir + "/posts.json")
	reader := bufio.NewReader(file)
	decoder := json.NewDecoder(reader)
	err := decoder.Decode(&p)
	check(err)
	file.Close()
	return p
}

func GetOnePostBySlug(postSlug string) (Post, error) {
	for _, p := range GetPosts() {
		if p.Slug == postSlug {
			content, _ := getPostContent(postSlug)
			p.Content = string(content)
			return p, nil
		}
	}
	return Post{}, errors.New("No post found")
}

func getPostContent(postSlug string) ([]byte, error) {
	filePath := dataDir + "/" + postSlug + ".md"
	return ioutil.ReadFile(filePath)
}

func check(e error) {
	if e != nil {
		fmt.Println(e)
	}
}
