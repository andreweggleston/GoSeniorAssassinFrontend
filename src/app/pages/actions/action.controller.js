require('./action.html');

angular
    .module('seniorassassin.controllers')
    .controller('ActionController', ActionController);

/** @ngInject */
function ActionController($rootScope, $scope, ActionService, Settings, User) {
    var vm = this;

    //shit goes here to update the stuff

    ActionService.subscribe('action-updated', $scope, function () {
        vm.actionInfo = ActionService.getList();
    });

}
