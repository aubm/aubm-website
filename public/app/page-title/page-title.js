import {Module,Component} from '../decorators';
import NavigationHelper from '../navigation-helper/navigation-helper';

@Module({name: 'app.pageTitle', modules: [NavigationHelper]})
@Component({
    restrict: 'A',
    selector: 'page-title',
    as: 'ptd'
})
export default class PageTitle {
    constructor($scope, $element, CurrentPostService) {
        "ngInject";

        $scope.$watch(() => CurrentPostService.currentPost, (newValue) => {
            $element.text(newValue ? newValue.title : 'Aubm');
        });
    }
}
