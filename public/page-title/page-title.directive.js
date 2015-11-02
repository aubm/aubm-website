export default class PageTitleDirective {
    constructor() {
        this.restrict = 'A';
        this.scope = true;
        this.controllerAs = 'ptd';
    }

    link(scope, element, attrs, controller) {
        scope.$watch(() => controller.value, (newValue) => element.text(newValue));
    }

    controller($scope, CurrentPostService) {
        "ngInject";

        const initialValue = 'Aubm';
        $scope.$watch(() => CurrentPostService.currentPost, (newValue) => {
            this.value = newValue ? newValue.title : initialValue;
        });
    }
}
