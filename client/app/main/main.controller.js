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

        var list = [];
        angular.forEach($rootScope.pages.list, function (page, i) {
          list.push(page._id);
        });
        $rootScope.collections.selected.pageList = list;
        $rootScope.collections.update($rootScope.collections.selected);
      }
    };

    $scope.widgetSortOptions = {
      handle: '.widgetheader',
      connectWith: '.widget-container',
      start: function (e, ui) {
        var percent = 100 / $rootScope.widgets.list.length;
        ui.helper.width( percent + '%');
      },
      stop: function (e, ui) {
        $scope._fixColumnDropArea();
        // updating widget list inside page object
        $rootScope.pages.selected.widgetList = $rootScope.widgets.getWidgetIds();
        $rootScope.pages.update($rootScope.pages.selected);
      }
    };

    $scope._fixColumnDropArea = function () {
      // resetting widget column height
      jQuery('.widget-container').css('min-height', '0px');
      var maxSize = 0;
      // finding longest column
      jQuery('.widget-container').each(function () {
        var newSize = jQuery(this).height();
        if (newSize > maxSize) {
          maxSize = newSize;
        }
      });
      // setting all columns to be as long as the longest
      $scope.minWidgetColumnHeight = maxSize;
    };

    $scope.pageLoad = function () {
      // Getting all collections
      $rootScope.collections.getByUser(function () {
        // Get all pages in a collection
        $rootScope.pages.getByCollection($rootScope.collections.selected._id, function () {
          // Get all widgets on a page
          $rootScope.widgets.getByPage($rootScope.pages.selected._id, function () {
            $scope._fixColumnDropArea();
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

    $scope.changeColumnCount = function (newCount) {
      if ($rootScope.pages.selected.columnCount > newCount) {
        while ($rootScope.widgets.list.length > newCount) {
          var lastColumn = $rootScope.widgets.list.pop();
          angular.forEach(lastColumn, function (widget) {
            var smallestColumn = $scope._findSmallestColumn();
            smallestColumn.push(widget);
          });
        }
      } else if ($rootScope.widgets.list.length < newCount) {
        while ($rootScope.widgets.list.length < newCount) {
          $rootScope.widgets.list.push([]);
          $rootScope.pages.selected.widgetList.push([]);
        }
      }
      $rootScope.pages.selected.columnCount = newCount;
      $rootScope.pages.selected.widgetList = $rootScope.widgets.getWidgetIds();
      $rootScope.pages.update($rootScope.pages.selected);
      $scope._fixColumnDropArea();

      var myKeys = Object.keys($rootScope.widgets.filterList);
      angular.forEach(myKeys, function (key) {
        angular.forEach($rootScope.widgets.filterList[key], function (item) {
          item.chart.resize();
        });
      });
    };

    $scope._findSmallestColumn = function () {
      // find column with the least number of widgets
      var min = 1000;
      var smallestColumn = null;
      angular.forEach($rootScope.widgets.list, function (widgetColumn) {
        if (widgetColumn.length < min) {
          smallestColumn = widgetColumn;
          min = widgetColumn.length;
        }
      });
      return smallestColumn;
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
          // after adding new page should be empty
          $rootScope.widgets.list = [];
          // adding new page to collection
          $rootScope.collections.selected.pageList.push($rootScope.pages.selected._id);
          $rootScope.collections.update($rootScope.collections.selected);
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
