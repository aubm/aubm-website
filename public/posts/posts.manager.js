export default class PostsManager {
    constructor($q, $http) {
        "ngInject";
        this.$q = $q;
        this.$http = $http;
        this.posts = null;
    }

    getPosts() {
        if (this.posts) {
            return this.$q.when(this.posts);
        }
        return this.$http.get('/api/posts')
            .then(res => {
                this.posts = res.data.reverse();
                return res.data;
            });
    }

    getOnePostBySlug(postSlug) {
        return this.$http.get(`/api/posts/${postSlug}`)
            .then(res => res.data);
    }
}
