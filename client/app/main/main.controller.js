'use strict';

angular.module('meanApp')
  .controller('MainCtrl', function ($scope, $rootScope, $timeout, $http, $modal, $log, CollectionService, PageService, WidgetService, SourceService, UserService, DataService) {
    $rootScope.collections = CollectionService;
    $rootScope.pages = PageService;
    $rootScope.widgets = WidgetService;
    $rootScope.sources = SourceService;
    $rootScope.data = DataService;
    $rootScope.user = UserService;

    // Sorting options for page tabs
    $scope.sortingPages = false;
    $scope.tabSortOptions = {
      axis: 'x',
      start: function (e, ui) {
        ui.helper.width($(this).width());
        $timeout(function () {
          $scope.sortingPages = true;
        }, 0);
      },
      stop: function (e, ui) {
        $timeout(function () {
          $scope.sortingPages = false;
        }, 0);
        /*
        var list = [];
        angular.forEach($rootScope.pages.list, function (page) {
          list.push(page._id);
        });
        $rootScope.collections.selected.pageList = list;
        $rootScope.collections.update($rootScope.collections.selected);
        */
      }
    };

    $scope.widgetSortOptions = {
      connectWith: 'widget-container',
      handle: '.widgetheader',
      items: 'widget',
      start: function (e, ui) {
        ui.helper.width('100%');
      }
    };

    $scope.pageLoad = function () {
      // Getting all collections
      $rootScope.collections.getByUser(function () {
        // Get all pages in a collection
        $rootScope.pages.getByCollection($rootScope.collections.selected._id, function () {
          // Get all widgets on a page
          $rootScope.widgets.getByPage($rootScope.pages.selected._id, function () {
            // Get list of all sources currently on page
            var sourceList = $rootScope.widgets.getSourceList();
            // Get source data for each source on page
            angular.forEach(sourceList, function (sourceId) {
              $rootScope.data.get(sourceId);
            });
          });
        });
      });

      // TODO: remove need for creating new source to not require user profile
      $rootScope.user.get();
      $rootScope.sources.getByUser();
    };

    $scope.pageSwitch = function (page) {
      $rootScope.pages.updateSelected(page, function () {
        $rootScope.widgets.getByPage(page._id, function () {
          var sourceList = $rootScope.widgets.getSourceList();
          var currentSources = Object.keys($rootScope.data.list);
          // if source is already loaded remove it from get list
          angular.forEach(sourceList, function (sourceId, i) {
            if (currentSources.indexOf(sourceId) !== -1) {
              sourceList.splice(i, 1);
            }
          });
          // getting all sources that are not currently loaded
          angular.forEach(sourceList, function (sourceId) {
            $rootScope.data.get(sourceId);
          });
        });
      });
    };

    /////////////////////////////////////////////////////////////////////////////////////
    // MODALS
    /////////////////////////////////////////////////////////////////////////////////////

    $scope.contentAddModal = function () {
      var myModal = $modal.open({
        templateUrl: 'app/main/modals/contentAdd/contentAdd.html',
        size: 'lg',
        controller: 'ContentAddModalCtrl'
      });

      myModal.result.then(function (config) {
        angular.forEach($rootScope.sources.list, function (source) {
          if (source.active) { delete source.active; }
        });
      }, function () {
        angular.forEach($rootScope.sources.list, function (source) {
          if (source.active) { delete source.active; }
        });
        $log.log('content modal was canceled');
      });
    };

    $scope.sourceConfigModal = function () {
      var myModal = $modal.open({
        templateUrl: 'app/main/modals/sourceConfig/sourceConfig.html',
        size: 'lg',
        controller: 'SourceConfigCtrl'
      });

      myModal.result.then(function (source) {
        angular.forEach($rootScope.sources.list, function (mySource) {
          if (source._id === mySource._id) {
            mySource.columns = source.columns;
            $rootScope.sources.update(mySource);
          }
        });
      }, function () {
        $log.log('souce config modal was canceled');
      })
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
        $rootScope.pages.add(newPageTitle, function () {
          $rootScope.widgets.list = [];
        });
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
