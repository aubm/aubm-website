import {Module,Component,View} from '../decorators';
import NavigationHelper from '../navigation-helper/navigation-helper';
import template from './page-header.html!text';

@Module({name: 'app.pageHeader', modules: [NavigationHelper]})
@Component({
    selector: 'page-header',
    as: 'phd'
})
@View({
    template: template
})
export default class PageHeader {
    constructor($scope, CurrentPostService) {
        "ngInject";

        $scope.$watch(() => CurrentPostService.currentPost, (newValue) => {
            this.currentPost = newValue;
        });
    }
}
