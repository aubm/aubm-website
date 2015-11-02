import template from './posts-list.html!text';

export default class PostsListCtrl {
    constructor (posts) {
        "ngInject";

        this.posts = posts;
    }

    static routeConfig($routeProvider) {
        "ngInject";

        $routeProvider
            .when('/', {
                template: template,
                controller: 'PostsListCtrl',
                controllerAs: 'plc',
                resolve: {
                    posts: (CurrentPostService, PostsManager) => {
                        "ngInject";

                        return PostsManager.getPosts()
                            .then((posts) =>  posts )
                            .then((posts) => {
                                CurrentPostService.currentPost = null;
                                return posts;
                            });
                    }
                }
            });
    }
}
