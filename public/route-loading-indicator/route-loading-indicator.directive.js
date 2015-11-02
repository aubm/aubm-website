import template from './route-loading-indicator.html!text';

export default class RouteLoadingIndicatorDirective {
    constructor() {
        this.template = template;
        this.restrict = 'E';
        this.scope = true;
        this.controllerAs = 'rlid';
    }

    controller($rootScope) {
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
