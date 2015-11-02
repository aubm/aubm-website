import angular from 'angular';
import navigationHelper from '../navigation-helper/navigation-helper';
import PageTitleDirective from './page-title.directive';

export default angular
    .module('app.pageTitle', [navigationHelper.name])
    .directive('pageTitle', () => new PageTitleDirective());
