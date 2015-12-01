import {Module,RouteConfig,View} from '../../decorators';
import Posts from '../posts';
import NavigationHelper from '../../navigation-helper/navigation-helper';
import template from './posts-list.html!text';

@Module({name: 'app.posts.postsList', modules: [NavigationHelper, Posts]})
@RouteConfig({
    path: '/',
    as: 'plc',
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
})
@View({template: template})
export default class PostsList {
    constructor (posts) {
        "ngInject";
        this.posts = posts;
    }
}
