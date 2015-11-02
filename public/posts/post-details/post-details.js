import angular from 'angular';
import PostDetailsCtrl from './post-details.controller';
import AppRouteConfig from '../../config/route';
import NavigationHelper from '../../navigation-helper/navigation-helper';
import AppPosts from '../posts';

export default angular
    .module('app.posts.postDetails', [
        AppRouteConfig.name,
        AppPosts.name,
        NavigationHelper.name
    ])
    .controller('PostDetailsCtrl', PostDetailsCtrl)
    .config(PostDetailsCtrl.routeConfig);
