/* @flow */
angular.module('seniorassassin.controllers')
  .controller('LobbyListHeaderController', LobbyListHeaderController);

/** @ngInject */
export default function LobbyListHeaderController($scope, Settings) {
  Settings.getSettings((settings) => {
    this.filtersEnabled = !!settings.filtersEnabled;
  });

  this.updateFilters = () => Settings.set('filtersEnabled', this.filtersEnabled);
}
