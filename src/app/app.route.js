import {route as about} from './pages/about';
import {route as rules} from './pages/rules';

/** @ngInject */
export default function routeConfig($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider
        .state('action', {
            url: '/',
            views: {
               'content': {
                   templateUrl: 'app/pages/actions/action.html',
                   controller: 'ActionController',
                   controllerAs: 'action',
               }
            },
        })
        .state('map', {
            url: '/map',
            views: {
                'content': {
                    templateUrl: 'app/pages/map/map.html',
                    controller: 'MapController',
                    controllerAs: 'map',
                }
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
                'headerInfo': {
                    templateUrl: 'app/pages/user-profile/header.html',
                    controller: 'UserProfileHeaderController',
                    controllerAs: 'header',
                },
            },
        })
        .state('settings', {
            url: '/settings',
            redirectTo: 'theme',
            views: {
                'content': {
                    templateUrl: 'app/pages/settings/settings.html',
                    controller: 'SettingsPageController',
                    controllerAs: 'settings',
                },
                'leftSidebar': {
                    templateUrl: 'app/pages/settings/settings-sidebar.html',
                    controller: 'SettingsPageController',
                    controllerAs: 'settings',
                },
            },
        })
        .state('about', about)
        .state('rules', rules)

    $urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode(true);
}
