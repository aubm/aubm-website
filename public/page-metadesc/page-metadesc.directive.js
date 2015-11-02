export default class PageMetadescDirective {
    constructor() {
        this.restrict = 'A';
        this.scope = true;
        this.controllerAs = 'pmetad';
    }

    link(scope, element, attrs, controller) {
        scope.$watch(() => controller.value, (newValue) => {
            element.attr('content', newValue);
        });
    }

    controller($scope, CurrentPostService) {
        "ngInject";

        const initialValue = "Blog d'un développeur web qui partage ses retours d'expérience et quelques bonnes astuces";
        $scope.$watch(() => CurrentPostService.currentPost, (newValue) => {
            this.value = newValue ? newValue.metadesc : initialValue;
        });
    }
}
