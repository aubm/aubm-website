import angular from 'angular';
import 'angulartics';
import angularticsGoogleAnalytics from 'angulartics-google-analytics';

export default angular
    .module('app.config.analytics', ['angulartics', angularticsGoogleAnalytics]);
