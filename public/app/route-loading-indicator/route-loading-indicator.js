import {Module,Component,View} from '../decorators';
import 'angular-spinkit';
import template from './route-loading-indicator.html!text';
import 'angular-spinkit/build/angular-spinkit.min.css!';

@Module({name: 'app.routeLoadingIndicator', modules: ['angular-spinkit']})
@Component({
    selector : 'route-loading-indicator',
    as : 'rlid'
})
@View({template: template})
export default class RouteLoadingIndicatorDirective {
    constructor($rootScope) {
        "ngInject";

        let firstRouteLoaded = false;
        this.isRouteLoading = false;

        $rootScope.$on('$routeChangeStart', () => {
            if (firstRouteLoaded) return;
            this.isRouteLoading = true;
        });

        $rootScope.$on('$routeChangeSuccess', () => {
            if (firstRouteLoaded) return;
            this.isRouteLoading = false;
            firstRouteLoaded = true;
        });
    }
}
