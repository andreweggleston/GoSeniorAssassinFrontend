/* @flow */
import './info.html';

angular
  .module('seniorassassin.controllers')
  .controller('MainPageController', MainPageController);

/** @ngInject */
function MainPageController($rootScope, $scope, Settings, User) {
  var vm = this;

  vm.targetHidden = true;

  vm.marked = false;

  vm.targetMarked = false;

  vm.target = {};

  vm.lastTargetUpdate = {};

  vm.lastMarkResponse = {};

  vm.showMarkSelection = true;

  vm.update = function () {
    User.getProfile($rootScope.userProfile.studentid).then(function (profile) {
      vm.profile = profile;
      vm.profile.target = profile.target.replace('_', ' ');
      vm.marked = vm.profile.markedfordeath;
      if ((Date.now() - vm.lastMarkResponse) / 1000 > 10) {
        vm.showMarkSelection = true;
      }
    });
    User.getProfile($rootScope.userProfile.target).then(function (targetProfile) {
      vm.target = targetProfile;
      if ((Date.now() - vm.lastTargetUpdate) / 1000 > 10) {
        vm.targetMarked = vm.target.markedfordeath;
      }
    });
  };
  vm.update();

  vm.markTarget = () => {
    User.markTarget();
    vm.targetMarked = true;
    vm.lastTargetUpdate = Date.now();
  };

  vm.denyMark = () => {
    User.denyMark();
    vm.showMarkSelection = false;
    vm.lastMarkResponse = Date.now();
  };

  vm.confirmMark = () => {
    User.confirmMark();
    vm.showMarkSelection = false;
    vm.lastMarkResponse = Date.now();

    setTimeout(vm.update(), 150);
  };
}

