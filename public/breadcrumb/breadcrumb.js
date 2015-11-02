import angular from 'angular';
import navigationHelper from '../navigation-helper/navigation-helper';
import BreadcrumbDirective from './breadcrumb.directive';

export default angular
    .module('app.breadcrumb', [navigationHelper.name])
    .directive('breadcrumb', () => new BreadcrumbDirective());
