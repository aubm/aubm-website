import template from './breadcrumb.html!text';

export default class Breadcrumb {
    constructor() {
        this.restrict = 'E';
        this.scope = true;
        this.controllerAs = 'bread';
        this.template = template;
    }

    controller($scope, CurrentPostService) {
        "ngInject";

        $scope.$watch(() => CurrentPostService.currentPost, (newValue) => {
            this.currentPost = newValue;
        });
    }
}
