/* @flow */
angular.module('seniorassassin')
  .config(SettingsPageConfig)
  .provider('SettingsPage', SettingsPage);

require('./settings.html');
require('./settings-sidebar.html');
require('./section-theme.html');
require('./section-account.html');

/** @ngInject */
function SettingsPageConfig($stateProvider, SettingsPageProvider) {
  /*
   Makes children states for each section of the settings.
   */
  SettingsPageProvider.sections = [
    'theme',
    'account',
  ];



  SettingsPageProvider.sections.forEach((settingSection) => {
    $stateProvider.state(settingSection, {
      url: '/' + settingSection,
      parent: 'settings',
      views: {
        'setting-section': {
          templateUrl: 'app/pages/settings/section-' + settingSection + '.html',
        },
      },
    });
  });
}

/** @ngInject */
function SettingsPage() {

  var settingsPageProvider = {};

  settingsPageProvider.sections = {};

  /** @ngInject */
  var settingsPageService = function (Settings) {
    settingsPageProvider.sections = {
      theme: {
        theme: Settings.getConstants('themesList'),
        animationOptions: Settings.getConstants('animationOptions'),
        videoBackground: Settings.getConstants('videoBackground'),
      },
      account: null,
    };

    settingsPageService.getSections = () => settingsPageProvider.sections;

    return settingsPageService;
  };

  settingsPageProvider.$get = settingsPageService;

  return settingsPageProvider;
}
