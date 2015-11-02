import angular from 'angular';
import navigationHelper from '../navigation-helper/navigation-helper';
import PageHeaderDirective from './page-header.directive';

export default angular
    .module('app.pageHeader', [navigationHelper.name])
    .directive('pageHeader', () => new PageHeaderDirective());
