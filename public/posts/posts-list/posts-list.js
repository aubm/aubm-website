import angular from 'angular';
import PostsListCtrl from './posts-list.controller';
import AppRouteConfig from '../../config/route';
import AppPosts from '../posts';
import NavigationHelper from '../../navigation-helper/navigation-helper';

export default angular
    .module('app.posts.postsList', [AppRouteConfig.name, NavigationHelper.name, AppPosts.name])
    .controller('PostsListCtrl', PostsListCtrl)
    .config(PostsListCtrl.routeConfig);
