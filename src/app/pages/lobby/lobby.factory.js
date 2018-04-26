/* @flow */
import Kefir from 'kefir';

angular
  .module('seniorassassin.services')
  .factory('LobbyService', LobbyService);

/** @ngInject */
function LobbyService($rootScope, $state, $mdDialog, $timeout: AngularJSTimeout, $interval,
                      $window, Websocket, Notifications, Settings) {
  var factory = {};

  factory.subscribe = function (request, scope, callback) {
    var handler = $rootScope.$on(request, callback);
    scope.$on('$destroy', handler);
  };


  ////////////////////////////////////////////////
  // Lobby pre-ready-up
  var playerPreReady = false;
  var preReadyUpTimer = 0;
  var preReadyUpInterval;

  factory.getPlayerPreReady = () => playerPreReady;

  factory.setPlayerPreReady = function (isReady) {
    playerPreReady = isReady;

    if (!playerPreReady) {
      $interval.cancel(preReadyUpInterval);
      return;
    }

    preReadyUpTimer = 180;
    $interval.cancel(preReadyUpInterval);

    preReadyUpInterval = $interval(function () {
      preReadyUpTimer--;

      if (preReadyUpTimer <= 0) {
        playerPreReady = false;
        $interval.cancel(preReadyUpInterval);
      }
    }, 1000);
  };

  factory.getPreReadyUpTimer = () => preReadyUpTimer;

  factory.clearTwitchRestriction = function (id) {
    return Websocket.emitJSON('lobbyRemoveTwitchRestriction', {id});
  };

  factory.clearSteamRestriction = function (id) {
    return Websocket.emitJSON('lobbyRemoveSteamRestriction', {id});
  };

  ////////////////////////////////////////////////
  // Lobby summaries list
  factory.lobbyList = [];

  factory.getList = () => factory.lobbyList;

  ////////////////////////////////////////////////
  // Substitutes list
  factory.subList = [];

  factory.getSubList = function () {
    return factory.subList;
  };

  Websocket.onJSON('subListData', function (data) {
    factory.subList = data;
    $rootScope.$emit('sub-list-updated');
  });


  ////////////////////////////////////////////////
  // Server/Mumble join information
  factory.lobbyJoinInformation = {};

  factory.getLobbyJoinInformation = function () {
    return factory.lobbyJoinInformation;
  };

  Websocket.onJSON('lobbyStart', function (data) {
    factory.lobbyJoinInformation = data;

    if (data.game) {
      factory.lobbyJoinInformation.connectUrl =
        'steam://connect/' + data.game.host + '/' + data.password;

      factory.lobbyJoinInformation.connectString =
        'connect ' + data.game.host + '; password ' + data.password;
    }

    if (data.mumble) {
      // safely encode weird characters (like # in 'lobby #123'),
      // but leave the path separators for delimiting sub-channels
      var channel =
            encodeURIComponent(data.mumble.channel).replace('%2F', '/');

      factory.lobbyJoinInformation.mumbleUrl = 'mumble://' +
        'unnamed' + ':' + data.mumble.password + '@' +
        data.mumble.address + '/' + channel +
        '/?version=1.2.0&title=seniorassassin&url=seniorassassin.com';
    }

    if (data.discordChannel) {
      factory.lobbyJoinInformation.discordChannel = data.discordChannel;
    }

    $rootScope.$emit('lobby-start');

    Notifications.toast({
      message: 'Your lobby has started!',
      actionMessage: 'Go back',
      action: function () {
        factory.goToLobby(factory.lobbyJoinedId);
      },
    });

    Settings.getSettings(function (settings) {
      Notifications.notifyBrowser({
        title: 'Lobby is starting!',
        body: 'Come back to the site to join the server',
        soundFile: Notifications.getSound('gameStart', settings),
        soundVolume: settings.soundVolume * 0.01,
        timeout: 5,
        callbacks: {
          onclick: () => $window.focus(),
        },
      });
    });
  });


  ////////////////////////////////////////////////
  // Full data for joined/specced lobbies
  var lobbyDataCache = Object.create(null);
  function getCachedLobby(id) {
    if (!lobbyDataCache[id]) {
      lobbyDataCache[id] = {
        data: false,
        listeners: [],
      };
    }

    return lobbyDataCache[id];
  }

  factory.lobbySpectated = Object.create(null);
  factory.lobbyJoined = Object.create(null);

  factory.lobbySpectatedId = -1;
  factory.lobbyJoinedId = -1;

  // Will return undefined when a lobby is not currently being
  // spectated
  factory.getLobbySpectated = () => factory.lobbySpectated;

  // Will return -1 when a lobby is not currently being
  // spectated
  factory.getLobbySpectatedId = () => factory.lobbySpectatedId;

  factory.leaveSpectatedLobby = () => {
    if (factory.lobbySpectatedId === -1) {
      return;
    }

    var id = factory.lobbySpectatedId;
    Websocket.emitJSON('lobbySpectatorLeave', { id }, () => {
      factory.lobbySpectatedId = -1;
      factory.lobbySpectated = {};
      $rootScope.$emit('lobby-spectated-changed');
      $rootScope.$emit('lobby-spectated-updated');
    });
  };

  // Will return undefined when not currently joined in any
  // lobby
  factory.getLobbyJoined = () => factory.lobbyJoined;

  // Will return -1 when not currently joined in any
  // lobby
  factory.getLobbyJoinedId = () => factory.lobbyJoinedId;

  factory.observeLobby = function (lobbyId) {
    var cacheObj = getCachedLobby(lobbyId);

    var ongoingStream = Kefir.stream(function (emitter) {
      var emit = (data) => emitter.emit(data);

      cacheObj.listeners.push(emit);

      return function () {
        var idx = cacheObj.listeners.indexOf(emit);
        cacheObj.listeners.splice(idx, 1);
      };
    });

    var streams = [ongoingStream];

    if (cacheObj.data) {
      streams.push(Kefir.constant(cacheObj.data));
    }

    return Kefir.merge(streams);
  };

  ////////////////////////////////////////////////
  // Auto-open logs
  //
  // We prevent spamming auto-log opens from multiple tabs by only
  // opening logs from the window that the user clicked to join tf2
  // from. This leaves open some edges cases if a user tries joining
  // tf2 from multiple different tabs. That would require some extra

  // Map from lobby id -> didOpenLogs bool. This enables testing
  // "Should we auto-open logs" both for the
  // only-open-from-tf2-launching-window restriction and the
  // only-open-once restriction.
  var joinedIds = {};

  factory.setJoinedId = (lobbyId) => {
    if (angular.isUndefined(joinedIds[lobbyId])) {
      joinedIds[lobbyId] = false;
    }
  };

  Websocket.onJSON('lobbyLogs', ({lobbyID, logs}) => {
    if (angular.isUndefined(joinedIds[lobbyID])) {
      return;
    }

    Settings.getSettings(function (settings) {
      if (settings.autoOpenLogs === 'on') {
        if (!joinedIds[lobbyID]) {
          $timeout(() => $window.open(logs, '_self'), 500);
        }
      }
    });
  });

  Websocket.onJSON('lobbyShuffled', ({id}) => {
    $rootScope.$emit('lobby-shuffled', {id});
  });

  Websocket.onJSON('lobbyData', (newLobby) => {
    var id = newLobby.id;

    var cacheObj = getCachedLobby(id);
    cacheObj.data = newLobby;
    cacheObj.listeners.forEach((f) => f(newLobby));

    factory.lobbySpectated = newLobby;

    if (id === factory.lobbySpectatedId) {
      $rootScope.$emit('lobby-spectated-updated');
    }

    if (id === factory.lobbyJoinedId) {
      $rootScope.$emit('lobby-joined-updated');
    }
  });

  Websocket.onJSON('lobbyJoined', (data) => {
    factory.lobbyJoinedId = data.id;
    factory.lobbyJoined = data;
    factory.setPlayerPreReady(true);
    $rootScope.$emit('lobby-joined');
    $rootScope.$emit('lobby-joined-updated');
  });

  Websocket.onJSON('lobbyLeft', () => {
    factory.lobbyJoinedId = -1;
    factory.lobbyJoined = {};
    factory.lobbyJoinInformation = {};
    factory.setPlayerPreReady(false);
    $rootScope.$emit('lobby-joined-updated');
    $rootScope.$emit('lobby-left');
  });


  factory.kick = function (lobbyID, studentid) {
    var payload = {
      'id': lobbyID,
      'studentid': studentid,
    };

    Websocket.emitJSON('lobbyKick', payload, function (response) {
      if (response.success) {
        Notifications.toast({message: 'Player kicked'});
      }
    });
  };

  factory.ban = function (lobbyID, studentid) {
    var payload = {
      'id': lobbyID,
      'studentid': studentid,
    };

    Websocket.emitJSON('lobbyBan', payload, function (response) {
      if (response.success) {
        Notifications.toast({message: 'Player banned'});
      }
    });
  };

  factory.join = function (lobbyID, team, position, password) {
    var payload = {
      'id': lobbyID,
      'team': team,
      'class': position,
      'password': password,
    };

    Websocket.emitJSON('lobbyJoin', payload);
  };

  factory.leaveSlot = function (id) {
    Websocket.emitJSON('lobbyLeave', {id});
  };

  factory.setTeamName = (id, team, name) => Websocket.emitJSON('lobbySetTeamName', {id, team, name});
  factory.shuffleTeams = (id) => Websocket.emitJSON('lobbyShuffle', {id});

  factory.goToLobby = function (lobby) {
    $state.go('lobby-page', {lobbyID: lobby});
  };

  factory.spectate = function (lobby) {
    Websocket.emitJSON('lobbySpectatorJoin', {id: lobby}, function (response) {
      if (response.success) {
        /*
         This code assumes that the only way we'll ever spectate
         a lobby is when we asked the backend to let us do it.

         However, the backend might have some ideas of its own and
         force us to spectate a lobby (for example, on websocket connection).

         This code needs to be moved to the lobbyData handler, but the backend
         is sending us bogus lobbyData on lobbyJoin that makes the page stutter,
         so it stays here for the moment.
         */
        var oldLobbyId = factory.lobbySpectatedId;
        factory.lobbySpectatedId = lobby;

        if (lobby !== oldLobbyId) {
          $rootScope.$emit('lobby-spectated-changed');
        }
        $rootScope.$emit('lobby-spectated-updated');
      }
    });
  };

  factory.closeLobby = function (lobbyID) {
    Websocket.emitJSON('lobbyClose', {id: lobbyID});
  };

  factory.resetServer = function (lobbyID) {
    Websocket.emitJSON('lobbyServerReset', {id: lobbyID});
  };

  factory.setLobbyLeader = function (lobbyId, studentid) {
    Websocket.emitJSON('lobbyChangeOwner',
                       {id: lobbyId,
                        studentid: studentid});
  };

  factory.setSlotRequirement = function (lobbyId, slotId, reqName, val) {
    if (!val) {
      if (reqName === 'password') {
        val = '';
      } else {
        val = 0;
      }
    }

    const data = {
      id: lobbyId,
      slot: slotId,
      type: reqName,
      value: val, // may be overriden, but we always have to send a
                  // 'value' param
      [reqName === 'password' ? 'password' : 'value']: val,
    };

    Websocket.emitJSON('lobbySetRequirement', data);
  };

  Websocket.onJSON('lobbyReadyUp', function (data) {
    var eventData = {
      startTime: Date.now(),
      timeout: data.timeout,
    };

    $rootScope.$emit('lobby-ready-up', eventData);

    if (playerPreReady) {
      Websocket.emitJSON('playerReady', {});
      return;
    }

    $mdDialog.show({
      templateUrl: 'app/shared/notifications/ready-up.html',
      controller: 'ReadyUpDialogController',
      controllerAs: 'dialog',
      locals: eventData,
      bindToController: true,
    }).then((response) => {
      if (response && response.readyUp) {
        Websocket.emitJSON('playerReady', {});
        localStorage.setItem('tabCommunication', '');
        localStorage.setItem('tabCommunication', 'closeDialog');
      }
    }, () => {
      Websocket.emitJSON('playerNotReady', {});
      localStorage.setItem('tabCommunication', '');
      localStorage.setItem('tabCommunication', 'closeDialog');
    });

    Settings.getSettings((settings) => {
      Notifications.notifyBrowser({
        title: 'Click here to ready up!',
        body: 'All the slots are filled, ready up to start',
        soundFile: Notifications.getSound('readyUp', settings),
        soundVolume: settings.soundVolume * 0.01,
        timeout: data.timeout,
        callbacks: {
          onclick: () => $window.focus(),
        },
      });
    });
  });

  Websocket.onJSON('lobbyClosed', () => {
    Notifications.toast({message: 'The lobby was closed'});
    $rootScope.$emit('lobby-closed');
  });

  Websocket.onJSON('lobbyListData', function (data) {
    if (angular.isArray(data)) {
      factory.lobbyList = data;
    } else {
      factory.lobbyList = data.lobbies;
    }

    $rootScope.$emit('lobby-list-updated');

    if (factory.lobbyJoinedId === -1) {
      return;
    }

    factory.lobbyList.forEach(function (lobby) {
      if (lobby.id === factory.lobbyJoinedId) {
        const joinedLobby: ?Object =
          factory.getLobbyJoined();
        if (joinedLobby !== undefined && joinedLobby !== null) {
          joinedLobby.players = lobby.players;
          joinedLobby.maxPlayers = lobby.maxPlayers;
        }
      }
    });
    $rootScope.$emit('lobby-joined-updated');
  });

  return factory;
}
