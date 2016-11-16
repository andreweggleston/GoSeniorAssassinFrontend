import angular from 'angular';
import config from 'app-config';
import {isEmpty} from 'lodash';
import Raven from 'raven-js';
import RavenAngularPlugin from 'raven-js/plugins/angular';
import moment from 'moment';

import safeApply from './util'

import '../css/style.css';

var modules = [], release = 'development';

if (typeof __BUILD_STATS__ !== 'undefined') {
    let {host, time, gitCommit: {hash, branch}} = __BUILD_STATS__;
    time = moment(__BUILD_STATS__.time).format('LLLL ZZ');

    console.log(
        `Built on ${host} at ${time} from hash ${hash} on branch ${branch}`
    );

    release = hash;
}

if (!isEmpty(config.sentryDSN)) {
    Raven
        .config(config.sentryDSN, {release})
        .addPlugin(RavenAngularPlugin)
        .install();
    modules.push('ngRaven');

    // TODO: Remove once prod setup is verified
    console.log('Logging to ' + config.sentryDSN);
}

angular.module('seniorassassin', [
    'seniorassassin.directives',
    'seniorassassin.controllers',
    'seniorassassin.services',
    'seniorassassin.filters',
    'ngAnimate',
    'ngMaterial',
    'md.data.table',
    require('ngreact').name,
    require('./scrollglue').name,
    'pasvaz.bindonce',
].concat(modules))
    .factory('safeApply', safeApply)
    .config(routeConfig);

angular.module('seniorassassin.controllers', []);
angular.module('seniorassassin.filters', []);
angular.module('seniorassassin.services', []);

require('./app.run');