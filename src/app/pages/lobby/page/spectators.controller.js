/* @flow */
angular.module('seniorassassin.controllers')
  .controller('LobbyPageSpectatorsController', LobbyPageSpectatorsController);

/** @ngInject */
function LobbyPageSpectatorsController($scope, $state, $window,
                                       safeApply, LobbyService) {
  var vm = this;
  var lobbyPageId = parseInt($state.params.lobbyID);

  LobbyService
    .observeLobby(lobbyPageId)
    .onValue(function (lobbyData) {
      safeApply($scope, function () {
        vm.lobbyInformation = lobbyData;
      });
    });

  vm.kick = function (playerSummary) {
    LobbyService.kick(vm.lobbyInformation.id, playerSummary.studentid, false);
  };

  vm.ban = function (playerSummary) {
    LobbyService.kick(vm.lobbyInformation.id, playerSummary.studentid, true);
  };

  vm.shouldShowSpectators = function () {
    return vm.lobbyInformation &&
      vm.lobbyInformation.id &&
      vm.lobbyInformation.id === parseInt($state.params.lobbyID);
  };
}
