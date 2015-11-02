import angular from 'angular';
import navigationHelper from '../navigation-helper/navigation-helper';
import PageMetadescDirective from './page-metadesc.directive';

export default angular
    .module('app.pageMetadesc', [navigationHelper.name])
    .directive('pageMetadesc', () => new PageMetadescDirective());
