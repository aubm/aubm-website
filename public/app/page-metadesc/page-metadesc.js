import {Module,Component} from '../decorators';
import NavigationHelper from '../navigation-helper/navigation-helper';

@Module({name: 'app.pageMetadesc', modules: [NavigationHelper]})
@Component({
    restrict: 'A',
    selector: 'page-metadesc',
    as: 'pmetad'
})
export default class PageMetadesc {
    constructor($scope, $element, CurrentPostService) {
        "ngInject";

        const initialValue = "Blog d'un développeur web qui partage ses retours d'expérience et quelques bonnes astuces";
        $scope.$watch(() => CurrentPostService.currentPost, (newValue) => {
            $element.attr('content', newValue ? newValue.metadesc : initialValue);
        });
    }
}
