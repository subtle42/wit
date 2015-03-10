'use strict';

angular.module('meanApp')
  .controller('MainCtrl', function ($scope, $http, $modal, $log) {
    $scope.awesomeThings = [];

    $http.get('/api/things').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
    });

    $scope.addThing = function() {
      if($scope.newThing === '') {
        return;
      }
      $http.post('/api/things', { name: $scope.newThing });
      $scope.newThing = '';
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };

    $scope.addPageModal = function () {
      var myModal = $modal.open({
        templateUrl: 'app/modals/addPage/addPage.html',
        size: 'sm',
        controller: 'AddPageCtrl'
      });

      myModal.result.then(function (newPageTitle) {
        // set all pages to not selected
        /*
        angular.forEach($rootScope.pages.list, function (page) {
          page.active = false;
        });

        $rootScope.pages.add(newPageTitle);
        */
      });
    };
  });
