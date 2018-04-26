/* @flow */
import {route as about} from './pages/about';

/** @ngInject */
export default function routeConfig(
  $stateProvider: Object,
  $urlRouterProvider: Object,
  $locationProvider: Object
) {

  $stateProvider
    .state('main', {
      url: '/',
      views: {
        'content': {
          templateUrl: 'app/pages/index/info.html',
          controller: 'MainPageController',
          controllerAs: 'mainPage',
        },
      },
    })
    .state('lobby-list', {
      url: '/lobby',
      views: {
        'content': {
          templateUrl: 'app/pages/lobby/list/lobby-list.html',
          controller: 'LobbyListController',
          controllerAs: 'lobbyList',
        },
      },
    })
    .state('lobby-create', {
      url: '/create',
      views: {
        'content': {
          templateUrl: 'app/pages/lobby/create/lobby-create.html',
          controller: 'LobbyCreateController',
          controllerAs: 'lobbyCreate',
        },
        'leftSidebar': {
          templateUrl: 'app/pages/lobby/create/lobby-create-steps.html',
          controller: 'WizardStepsController',
          controllerAs: 'wizardSteps',
        },
      },
    })
    .state('lobby-page', {
      url: '/lobby/{lobbyID}',
      views: {
        'content': {
          templateUrl: 'app/pages/lobby/page/lobby-page.html',
          controller: 'LobbyPageController',
          controllerAs: 'lobbyPage',
        },
        'leftSidebar': {
          templateUrl: 'app/pages/lobby/page/spectators.html',
          controller: 'LobbyPageSpectatorsController',
          controllerAs: 'spectators',
        },
      },
    })
    .state('user-profile', {
      url: '/user/{userID}',
      views: {
        'content': {
          templateUrl: 'app/pages/user-profile/user-profile.html',
          controller: 'UserProfileController',
          controllerAs: 'userProfile',
        },
      },
    })
    .state('settings', {
      url: '/settings',
      redirectTo: 'account',
      views: {
        'content': {
          templateUrl: 'app/pages/settings/settings.html',
          controller: 'SettingsPageController',
          controllerAs: 'settings',
        },
      },
    })
    .state('about', about);
  $urlRouterProvider.otherwise('/');

  $locationProvider.html5Mode(true);
}
