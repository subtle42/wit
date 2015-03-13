'use strict';

angular.module('meanApp')
  .controller('MainCtrl', function ($scope, $rootScope, $http, $modal, $log, CollectionService, PageService, WidgetService) {
    $scope.awesomeThings = [];
    $rootScope.collections = CollectionService;
    $rootScope.pages = PageService;
    $rootScope.widgets = WidgetService;

    // Sorting options for page tabs
    $scope.sortingPages = false;
    $scope.tabSortOptions = {
      axis: 'x',
      start: function (e, ui) {
        $timeout(function () {
          $scope.sortingPages = true;
        }, 0);
      },
      stop: function (e, ui) {
        $timeout(function () {
          $scope.sortingPages = false;
        }, 0);
        $log.log('setting order');
        $rootScope.pages.setOrder();
      }
    };

    $scope.pageLoad = function () {
      $rootScope.collections.getByUser(function () {
        $rootScope.pages.getByCollection($rootScope.collections.selected._id, function () {
          $rootScope.widgets.getByPage($rootScope.pages.selected._id);
        });
      });
    };

    $scope.pageSwitch = function (page) {
      $rootScope.pages.updateSelected(page, function () {
        $rootScope.widgets.getByPage(page._id);
      });
    };

    $scope.addPageModal = function () {
      var myModal = $modal.open({
        templateUrl: 'app/main/modals/pageAdd/pageAdd.html',
        size: 'sm',
        controller: 'AddPageCtrl'
      });

      myModal.result.then(function (newPageTitle) {
        // set all pages to not selected
        angular.forEach($rootScope.pages.list, function (page) {
          page.active = false;
        });
        $rootScope.pages.add(newPageTitle);
      }, function () {
        $log.log('add page modal was canceled');
      });
    };

    $scope.pageRemove = function (page) {
      var myModal = $modal.open({
        templateUrl: 'app/main/modals/pageDelete/pageDelete.html',
        size: 'sm',
        controller: 'DeletePageModalCtrl',
        resolve: {
          page: function () {
            return page;
          }
        }
      });

      myModal.result.then(function () {
        $rootScope.pages.remove(page, function () {
          if (page === $rootScope.pages.selected) {
            if ($rootScope.pages.list.length === 0) {
              $rootScope.widgets.list = [];
            } else {
              $scope.pageSwitch($rootScope.pages.list[0]);
            }
          }
        });
      }, function () {
        $log.log('delete page modal was canceled');
      });
    };

    $scope.pageLoad();
  });
