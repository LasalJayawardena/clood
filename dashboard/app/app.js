'use strict';

// Declare app level module which depends on views, and core components
angular.module('cloodApp', [
  'cloodApp.env',
  'ui.router',
  'ngResource',
  'ngAnimate',
  'ngSanitize',
  'ngTouch',
  'ui.bootstrap',
  'toaster',
  'cloodApp.global_config',
  'cloodApp.projects',
  'cloodApp.config',
  'cloodApp.cbr',
  'cloodApp.tokens',
  'cloodApp.version'
]).
config(['$locationProvider', '$urlRouterProvider', '$stateProvider', function($locationProvider, $urlRouterProvider, $stateProvider) {
  $locationProvider.hashPrefix('');
  $urlRouterProvider.otherwise('/projects');
}]).
// inject $state into all views
run(['$rootScope', '$state', '$stateParams', function($rootScope, $state, $stateParams){
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
}]).
// UI notifications in view
run(['$rootScope', 'toaster', function($rootScope, toaster){
  $rootScope.pop = function(type, title, msg) {
    toaster.pop(type, title, msg);
  };
}]).
// Global variables?
run(['$rootScope', function($rootScope){
  var menu = {};
  menu.items = ['Projects', 'Configuration', 'CBR Tasks', 'Tokens'];
  menu.active = menu.items[0];
  $rootScope.menu = menu;
  var auth = {};
  auth.user = '';
  auth.password = '';
  auth.token = '';
  auth.state = false;
  $rootScope.auth = auth;
  $rootScope.headers = {'Authorization': auth.token}

}]).
// App-wide functions
run(['$rootScope', '$http', 'ENV_CONST', function($rootScope, $http, ENV_CONST){ // global functions
  $rootScope.getGlobalConfig = function() {
    $http.get(ENV_CONST.base_api_url + "/config", {headers: {"Authorization":$rootScope.checkauth()}}).then(function(res) {
      if (typeof res.data.attributeOptions != 'undefined'){
        $rootScope.globalConfig = res.data; // should allow update in settings
      }
    }, function(err) {
      console.log(err.data);
      if($rootScope.auth.state){
        $rootScope.logout();
      }
    });
  };
  $rootScope.createGlobalConfig = function() {  // re-creates global config
    $http.get(ENV_CONST.base_api_url + "/config/create", {headers: {"Authorization":$rootScope.checkauth()}}).then(function(res) {
      if (typeof res.data.attributeOptions != 'undefined'){
        $rootScope.globalConfig = res.data;
      }
    }, function(err) {
      console.log(err.data);
    });
  };
  $rootScope.getDataType = function(data) { // number, string, boolean, object, undefined
    return typeof data;
  };
  $rootScope.authUser = function() {
    $http.post(ENV_CONST.base_api_url + "/auth", {
      username: $rootScope.auth.user,
      password: $rootScope.auth.password
    }).then(function(res) {
      if (res.data.authenticated) {
        $rootScope.auth.token = res.data.token;
        localStorage.setItem('clood_token', res.data.token);
        localStorage.setItem('clood_user', $rootScope.auth.user);
        $rootScope.auth.state = true;
        location.reload();
      } else {
        $rootScope.auth.state = false;
        $rootScope.logout();
        $rootScope.pop('error',null, 'Please check your username and password');
      }
    });
  };
  $rootScope.logout = function() {
    $rootScope.auth.state = false;
    localStorage.removeItem('clood_token');
    localStorage.removeItem('clood_user');
    location.reload();
  };
  $rootScope.checkauth = function() {
    if (localStorage.getItem('clood_token') && localStorage.getItem('clood_user')) {
      $rootScope.auth.state = true;
      $rootScope.auth.user = localStorage.getItem('clood_user');
      $rootScope.auth.token = localStorage.getItem('clood_token');
      return $rootScope.auth.token
    } else {
      $rootScope.auth.state = false;
    }
  };
  $rootScope.objOrArrayHasContent = function(data) {
    if ((typeof data[0] != 'undefined') || (typeof Object.keys(data)[0] != 'undefined')) {
      return true;
    } else {
      return false;
    }
  };
  $rootScope.getGlobalConfig();
}]).

directive('disallowSpaces', [function(){
  return {
    restrict: 'A',
    link: function($scope, $element) {
      $element.bind('input', function(){
        $(this).val($(this).val().replace(/ /g, ''));
      });
    }
  }
}]);
