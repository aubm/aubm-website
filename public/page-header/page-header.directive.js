import template from './page-header.html!text';

export default class PageHeaderDirective {
    constructor() {
        this.template = template;
        this.restrict = 'E';
        this.scope = true;
        this.controllerAs = 'phd';
    }

    controller($scope, CurrentPostService) {
        "ngInject";

        $scope.$watch(() => CurrentPostService.currentPost, (newValue) => {
            this.currentPost = newValue;
        });
    }
}
