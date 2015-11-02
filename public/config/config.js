import angular from 'angular';
import Theme from './theme/theme';
import Markdown from './markdown/markdown';
import Socialshare from './socialshare/socialshare';
import Disqus from './disqus/disqus';
import LoadingBar from './loading-bar/loading-bar';
import Analytics from './analytics/analytics';
import RouteConfig from './route';

export default angular.module('app.config', [
  Theme.name,
  Markdown.name,
  Socialshare.name,
  Disqus.name,
  LoadingBar.name,
  Analytics.name,
  RouteConfig.name
]);
