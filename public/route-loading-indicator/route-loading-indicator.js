import angular from 'angular';
import 'angular-spinkit';
import 'angular-spinkit/build/angular-spinkit.min.css!';
import RouteLoadingIndicatorDirective from './route-loading-indicator.directive';

export default angular
    .module('app.routeLoadingIndicator', ['angular-spinkit'])
    .directive('routeLoadingIndicator', () => new RouteLoadingIndicatorDirective());
