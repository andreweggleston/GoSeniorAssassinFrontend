/* @flow */
angular
  .module('seniorassassin.services')
  .filter('LobbyCreateOptionFilter', LobbyCreateOptionFilter);

/** @ngInject */
function LobbyCreateOptionFilter(LobbyCreate, $filter) {
  return function (options, optionGroupKey, searchString) {
    searchString = searchString || ''; // maybe it's null for animations
    var searchFilter = $filter('filter');

    var lobbySettingsList = LobbyCreate.getSettingsList();
    var lobbySettings = LobbyCreate.getLobbySettings();

    var optionGroup = lobbySettingsList[optionGroupKey];

    /*
     Looks at the other fields this option depends on in lobbySettingsList,
     then checks for each one of them
     */
    var shouldShowOption = function (option) {
      var shouldShow = option; // checks for empty option
      if (!optionGroup.dependsOn) {
        return true;
      }
      optionGroup.dependsOn.forEach(function (dependencyName) { // e.g. 'formats'
        var dependencyKey = lobbySettingsList[dependencyName].key; // e.g. 'type'
        var dependency = lobbySettings[dependencyKey]; // e.g. 'highlander'

        shouldShow = shouldShow && option[dependency];
      });
      return shouldShow || lobbySettings[lobbySettingsList.formats.key] === 'debug';
    };

    options = options.filter(shouldShowOption);

    if (optionGroup.filterable) {
      options = searchFilter(options, searchString);
    }

    return options;
  };
}
