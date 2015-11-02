package posts

type Post struct {
	Title        string `json:"title"`
	Slug         string `json:"slug"`
	CreatedAt    string `json:"created_at"`
	ModifiedAt   string `json:"modified_at"`
	ContentShort string `json:"content_short"`
	Content      string `json:"content"`
	Metadesc     string `json:"metadesc"`
}
