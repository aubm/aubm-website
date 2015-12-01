import {Component, View, Module} from '../decorators.js';
import template from './breadcrumb.html!text';
import NavigationHelper from '../navigation-helper/navigation-helper';

@Module({
    name: 'app.breadcrumb',
    modules: [NavigationHelper]
})
@Component({
    selector: 'breadcrumb',
    as: 'bread'
})
@View({
    template: template
})
export default class Breadcrumb {
    constructor($scope, CurrentPostService) {
        "ngInject";

        $scope.$watch(() => CurrentPostService.currentPost, (newValue) => {
            this.currentPost = newValue;
        });
    }
}
