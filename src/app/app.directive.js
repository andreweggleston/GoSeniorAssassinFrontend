/** @ngInject */
export function AutofocusDirective($timeout) {
    // Directive for automatically an element when it is added, such
    // as via `ng-if`
    return {
        restrict: 'A',
        link: function link(scope, element) {
            $timeout(function () {
                element.focus();
            });
        },
    };
}