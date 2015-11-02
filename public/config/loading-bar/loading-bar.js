import angular from 'angular';
import 'angular-loading-bar/build/loading-bar.css!';
import './loading-bar.css!';
import angularLoadingBar from 'angular-loading-bar';

export default angular.module('app.config.loadingBar', [angularLoadingBar])
    .config(cfpLoadingBarProvider => { "ngInject"; cfpLoadingBarProvider.includeSpinner = false; });
