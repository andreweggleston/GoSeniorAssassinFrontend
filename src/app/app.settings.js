/* @flow */
angular.module('seniorassassin')
  .provider('Settings', Settings);

function Settings() {
  var settingsProvider = {};

  settingsProvider.settings = {};

  settingsProvider.constants = {

    themesList: {
      light:    {name: 'Assassin', selector: 'default-theme'},
      dark:     {name: 'Assassin Dark', selector: 'dark-theme'},
    },

    videoBackground: {
      on:    {name: 'On',     value: 'on'},
      off:   {name: 'Off',    value: 'off'},
    },

    animationOptions: {
      slow:     {name: 'Slow',      selector: 'animation-slow'},
      normal:   {name: 'Normal',    selector: 'animation-normal'},
      fast:     {name: 'Fast',      selector: 'animation-fast'},
      none:     {name: 'None',      selector: 'animation-none'},
    },

    timestampOptions: {
      hours12:  {name: '12-hour'},
      hours24:  {name: '24-hour'},
      none:     {name: 'None'},
    },
  };

  function setDefaultValues() {
    settingsProvider.settings.currentTheme = 'default-theme';
    settingsProvider.settings.timestamps = 'hours12';
    settingsProvider.settings.animationLength = 'animation-normal';
    settingsProvider.settings.recentConfigurations = '[]';
    settingsProvider.settings.savedConfigurations = '[]';
    settingsProvider.settings.videoBackground = 'off';
  }

  setDefaultValues();

  /*
   Creates the service with all the functions accessible
   during and after the run phase.
   */
  /** @ngInject */
  var settingsService = function (Websocket, $rootScope, $log: AngularJSLog, $q) {

    // Private properties
    var settings = settingsProvider.settings;
    var alreadyLoadedFromBackend = false;

    for (const [key, val] of Object.entries(localStorage)) {
      if (key === 'filtersEnabled') {
        settings[key] = (val === 'true');
      } else {
        settings[key] = val;
      }
    }

    $rootScope.$emit('settings-updated');

    Websocket.onJSON('playerSettings', function (data) {
      for (var setting of Object.keys(data)) {
        var value = data[setting];
        // coerce true/false for conveniece
        if (value === 'true' || value === 'false') {
          value = (value === 'true');
        }

        localStorage.setItem(setting, value.toString());
        settings[setting] = value;
      }

      alreadyLoadedFromBackend = true;
      $rootScope.$emit('settings-loaded-from-backend');
      $rootScope.$emit('settings-updated');
    });

    // Saves a setting into the service and into the backend and fires
    // an optional callback with the response from the backend as an
    // argument.
    settingsService.set = function (key, newValue, callback, revertOnFail) {
      var oldValue = settings[key];

      if (oldValue === newValue) {
        return $q.when({});
      }

      var deferred = $q.defer();

      callback = callback || angular.noop;
      settings[key] = newValue;

      // TODO: we don't rollback settings changes on commit
      // failures, so it makes sense to always emit this, but that
      // behavior needs to be better thought through: perhaps
      // speculative updates
      $rootScope.$emit('settings-updated');

      localStorage.setItem(key, newValue);

      if ($rootScope.userProfile.studentid) {
        Websocket.emitJSON('playerSettingsSet',
                           // Backend only accepts strings!
                           {key: key.toString(), value: newValue.toString()},
                           function (response) {
                             if (response.success) {
                               $log.log('Setting "' + key + '" saved correctly on the backend!');
                               deferred.resolve(response);
                             } else {
                               if (revertOnFail) {
                                 settings[key] = oldValue;
                                 $rootScope.$emit('settings-updated');
                               }

                               $log.log('Error setting key ' + key + ' with value ' +
                                        newValue + '. Reason: ' + response.message);
                               deferred.reject(response);
                             }
                             callback(response);
                           });
      } else {
        deferred.resolve();
      }

      return deferred.promise;
    };

    settingsService.getConstants = (key) => settingsProvider.constants[key];

    /*
     Returns all settings and fires an optional callback
     when they are loaded from the backend.
     */
    settingsService.getSettings = (callback) => {
      callback = callback || angular.noop;

      if (!alreadyLoadedFromBackend) {
        var handler = $rootScope.$on('settings-loaded-from-backend', function () {
          callback(settings);
          handler();
        });
      } else {
        callback(settings);
      }

      return settings;
    };

    return settingsService;
  };


  /*
   Creates the service with all the objects and functions
   accessible ONLY DURING config phase.

   $get returns the service object.
   */
  settingsProvider.$get = settingsService;
  return settingsProvider;
}
