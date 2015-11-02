import angular from 'angular';
import CurrentPostService from './current-post-service';

export default angular
    .module('app.navigationHelper', [])
    .service('CurrentPostService', CurrentPostService);
