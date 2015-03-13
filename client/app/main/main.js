'use strict';

angular.module('meanApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'app/main/mainPage.html',
        controller: 'MainCtrl',
        authenticate: true
      });
  });