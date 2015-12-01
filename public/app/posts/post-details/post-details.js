import {Module,RouteConfig,View} from '../../decorators';
import NavigationHelper from '../../navigation-helper/navigation-helper';
import Posts from '../posts';
import template from './post-details.html!text';

@Module({name: 'app.posts.postDetails', modules: [Posts, NavigationHelper]})
@RouteConfig({
    path: '/blog/:postSlug',
    as: 'pdc',
    resolve: {
        post: ($route, CurrentPostService, PostsManager) => {
            "ngInject";
            return CurrentPostService.use(
                PostsManager.getOnePostBySlug($route.current.params.postSlug)
            );
        }
    }
})
@View({template: template})
export default class PostDetails {
    constructor(post) {
        "ngInject";
        this.post = post;
    }
}
