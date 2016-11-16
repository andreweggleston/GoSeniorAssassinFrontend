import Kefir from 'kefir';

angular
    .module('seniorassassin.services')
    .factory('ActionService', ActionService);

/** @ngInject */
function ActionService($rootScope, $state, $mdDialog, $timeout, $interval,
                      $window, Websocket, Notifications, Settings) {
    var factory = {};

    factory.subscribe = function (request, scope, callback) {
        var handler = $rootScope.$on(request, callback);
        scope.$on('$destroy', handler);
    };

    return factory;
}
