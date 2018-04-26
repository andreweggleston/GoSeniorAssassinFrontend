/* @flow */
import Kefir from 'kefir';
import moment from 'moment';
import { update } from 'lodash';
import { slotNameToClassName } from '../../app.filter';
import type { UserLobbyData } from '../../shared/user.factory';

require('./user-profile.html');
require('./header.html');

angular
  .module('seniorassassin.controllers')
  .controller('UserProfileController', UserProfileController)
  .controller('UserProfileHeaderController', UserProfileHeaderController);

const {
  pub: updateProfileLoadingStatus,
  stream: profileLoadingStatus$,
} = (function () {
  var pubFn = ()=>{};

  function pub(x) {
    pubFn(x);
  }

  var stream = Kefir.stream(emitter => {
    pubFn = (x) => emitter.emit(x);
    return () => {};
  });

  return { pub, stream };
})();


/** @ngInject */
function UserProfileController($state, User) {
  var vm = this;

  vm.studentId = $state.params.userID;


  vm.profile = false;
  vm.loadingError = false;


  updateProfileLoadingStatus(true);
  User
    .getProfile(vm.studentId)
    .then(function (profile) {
      updateProfileLoadingStatus(false);
      vm.profile = profile;
      vm.loadingError = false;

      vm.profile.createdAt = moment(vm.profile.createdAt);

    }, function (err) {
      vm.error = err;
      vm.loadingError = true;
    });
}

/** @ngInject */
function UserProfileHeaderController($scope, safeApply) {
  var vm = this;

  vm.showLoadingBar = false;
  function updateStatus(x) {
    safeApply($scope, () => vm.showLoadingBar = x);
  }

  profileLoadingStatus$.onValue(updateStatus);
  $scope.$on('$destroy', () => profileLoadingStatus$.offValue(updateStatus));
}
