import template from './post-details.html!text';

export default class PostDetailsCtrl {
    constructor (post) {
        "ngInject";

        this.post = post;
    }

    static routeConfig($routeProvider) {
        "ngInject";

        $routeProvider
            .when('/blog/:postSlug', {
                template: template,
                controller: 'PostDetailsCtrl',
                controllerAs: 'pdc',
                resolve: {
                    post: ($route, CurrentPostService, PostsManager) => {
                        "ngInject";
                        return CurrentPostService.use(
                            PostsManager.getOnePostBySlug($route.current.params.postSlug)
                        );
                    }
                }
            });
    }
}
