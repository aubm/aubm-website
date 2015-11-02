import angular from 'angular';
import PostsManager from './posts.manager';

export default angular
    .module('app.posts', [])
    .service('PostsManager', PostsManager);
