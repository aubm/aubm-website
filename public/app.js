import angular from 'angular';
import Config from './config/config';
import AppPostsList from './posts/posts-list/posts-list';
import AppPostDetails from './posts/post-details/post-details';
import PageHeader from './page-header/page-header';
import PageTitle from './page-title/page-title';
import PageMetadesc from './page-metadesc/page-metadesc';
import Breadcrumb from './breadcrumb/breadcrumb';
import RouteLoadingIndicator from './route-loading-indicator/route-loading-indicator';

let app = angular.module('app', [
  Config.name,
  AppPostsList.name,
  AppPostDetails.name,
  PageHeader.name,
  PageTitle.name,
  PageMetadesc.name,
  Breadcrumb.name,
  RouteLoadingIndicator.name
]);

angular.element(document).ready(() =>  angular.bootstrap(document.documentElement, [ app.name ], { strictDi: false }));
