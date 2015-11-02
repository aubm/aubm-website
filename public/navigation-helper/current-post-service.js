export default class CurrentPostService {
    constructor() {
        this.currentPost = null;
    }

    use(deferer) {
        return deferer.then((post) => {
            this.currentPost = post;
            return post;
        });
    }
}
