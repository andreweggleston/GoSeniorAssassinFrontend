/* @flow */
import Kefir from 'kefir';
import Raven from 'raven-js';
import {pick} from 'lodash';

angular
  .module('seniorassassin.services')
  .factory('User', User);


/** @ngInject */
function User(Websocket, $rootScope, $window, $q, Config, Notifications) {
  var userService = {};

  const {
    pub: updateUserProfile,
    stream: userProfile$,
  } = (function () {
    var pubFn = () => {
    };

    function pub(x) {
      pubFn(x);
    }

    var stream = Kefir.stream(emitter => {
      pubFn = (x) => emitter.emit(x);
      return () => {
      };
    });

    return {pub, stream};
  })();

  userService.userProfile$ = userProfile$;
  updateUserProfile({});

  userService.getProfile = (studentid, callback) => {
    callback = callback || angular.noop;

    var deferred = $q.defer();

    console.log('sent playerProfile request');

    Websocket.emitJSON(
      'playerProfile',
      {studentid: studentid},
      function (response) {
        if (response.success) {
          callback(response.data);
          deferred.resolve(response.data);
        } else {
          deferred.reject(response.message);
        }
      });

    return deferred.promise;
  };

  userService.markTarget =
    () => Websocket.emitJSON('markTarget', {});

  userService.confirmMark =
    () => Websocket.emitJSON('confirmOwnMark', {});

  userService.denyMark =
    () => Websocket.emitJSON('denyOwnMark', {});

  userService.enableTextBot =
    () => Websocket.emitJSON('playerEnableTextBot', {});

  userService.disableTextBot =
    () => Websocket.emitJSON('playerDisableTextBot', {});

  userService.init = () =>
    Websocket.onJSON('playerProfile', function (data) {
      Raven.setUserContext(pick(data, ['id', 'studentid']));
      $rootScope.userProfile = data;
      updateUserProfile(data);
    });

  return userService;
}
