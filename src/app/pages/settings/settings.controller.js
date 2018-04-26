/* @flow */
import * as audio from '../../audio';
import {pick, get} from 'lodash';

angular
  .module('seniorassassin.controllers')
  .controller('SettingsPageController', SettingsPageController);

/** @ngInject */
function SettingsPageController($rootScope, $scope, $mdEditDialog,
                                $timeout: AngularJSTimeout,
                                SettingsPage, Settings,
                                User, Notifications, safeApply) {
  var vm = this;

  vm.sections = SettingsPage.getSections();

  vm.saveSetting = function (key, value, showNotification) {
    function updateSettings() {
      var msg = 'Setting updated.';
      var promise = Settings.set(key, value);


      if (showNotification) {
        promise.then(function () {
          Notifications.toast({message: msg});
        }, function () {
          Notifications.toast({message: msg, error: true});
        });
      }
    }

    if (key === 'animationLength') {
      $rootScope.animationLength = 'none';
      setTimeout(() => {
        safeApply($rootScope, updateSettings);
      }, 1);
    } else {
      updateSettings();
    }

    if (key === 'phoneNumber')
      $rootScope.userProfile.phonenumber = value;
  };

  vm.setCurrent = function (key) {
    vm.current = key;
  };



  vm.fetchMumblePassword = function () {
    User
      .getMumblePassword()
      .then(function (data) {
        vm.mumblePassword = data.password;
      });
  };

  vm.resetMumblePassword = function () {
    User.resetMumblePassword();
  };

  vm.enableTextBot = function () {
    User.enableTextBot();
  };

  vm.disableTextBot = function () {
    User.disableTextBot();
  };

  /*
   Iterates through all the settings in the list and compares
   them to the stored settings.

   If a user setting exists for that element, it gets updated.
   If it doesn't, it defaults to true.
   */

  function syncSettings() {
    Settings.getSettings(function (settings) {
      vm.originalSettings = settings;

      vm.animationLength = settings.animationLength;
      vm.videoBackground = settings.videoBackground;
      vm.siteAlias = settings.siteAlias;
      vm.phoneNumber = settings.phoneNumber;
      vm.timestamps = settings.timestamps;

    });
  }
  syncSettings();
  var handler = $rootScope.$on('settings-updated', syncSettings);
  $scope.$on('$destroy', handler);
}
