'use strict';

angular.module('meanApp')
	.directive('widget', function ($modal) {
    	return {
			restrict: 'E',
			scope: {
				widget: '=widget'
			},
			templateUrl: 'main/widget/widget.html',
			controller: widgetCtrl
		}
	}
);

var widgetCtrl = function($scope, $rootScope, $modal, $log, $window, $timeout) {
	$scope.source = {};
	$scope.seriesMoving = false;

	$scope.sortOptions = {
		axis: 'x',
		start: function (e, ui) {
			$timeout(function () {
				$scope.seriesMoving = true;
			}, 0);
		},
		stop: function (e, ui) {
			$timeout(function () {
				$scope.seriesMoving = false;
			}, 0);
			$rootScope.widgets.update($scope.widget);
		}
	};

	$scope.init = function () {
		angular.forEach($rootScope.sources.dataSources, function (source) {
			if (source._id === $scope.widget.sourceId) {
				$scope.source = source;
			}
		});
	};

	$scope.addSerie = function () {
		var existingSeries = [];
		var newSerie;
		var newRef = '';

		angular.forEach($scope.widget.series, function (serie) {
			existingSeries.push(serie.ref);
		});

		angular.forEach($scope.source.columns, function (col) {
			if (col.type === 'number' && existingSeries.indexOf(col.ref) === -1) {				
				newSerie = {
					formula: 'sum',
					ref: col.ref
				};
			}
		});	

		if (newSerie) {
			$scope.widget.series.push(newSerie);
			$rootScope.widgets.update($scope.widget);
		}
	};

	$scope.addGroup = function () {
		var exitingGroups = [];
		var newGroup;

		angular.forEach($scope.widget.groups, function (entry) {
			exitingGroups.push(entry.ref);
		});

		angular.forEach($scope.source.columns, function (col) {
			if (col.type === 'group' && exitingGroups.indexOf(col.ref) === -1) {
				newGroup = {
					ref: col.ref
				};
			}
		});

		if (newGroup) {
			$scope.widget.groups.push(newGroup);
			$rootScope.widgets.update($scope.widget);
		}
	};

	$scope.maximize = function() {
		if ($scope.widget.maximize === true) {
			$scope.widget.maximize = false;
			$timeout(function () { $scope.chart.refit(); }, 20);
			return;
		}
		// If maximizing a collapsed widget is opened 
		if ($scope.widget.collapse === true) {
			$scope.widget.collapse = false;
		}
		$scope.widget.maximize = true;
		$timeout(function () { $scope.chart.refit(); }, 20);
	};

	$scope.lock = function () {
		if ($scope.widget.locked === true) {
			$scope.widget.locked = false;
			return;
		}
		$scope.widget.locked = true;
	};
	
	$scope.editTitle = function() {
		if ($scope.showTitleEdit === true) {
			$scope.showTitleEdit = false;
			return;
		}
		$scope.showTitleEdit = true;
	};

	$scope.collapse = function() {
		if ($scope.widget.collapse === true) {
			$scope.widget.collapse = false;
			$rootScope.widgets.update($scope.widget);
			return;
		}
		// If collapsing a maximized widget bring widget back to normal size
		if ($scope.widget.maximize === true) {
			$scope.widget.maximize = false;
		}
		$scope.widget.collapse = true;
		$rootScope.widgets.update($scope.widget);
	};

	$scope.remove = function () {
		var myModal = $modal.open({
			templateUrl: 'main/modals/deleteWidget/deleteWidget.html',
			size: 'sm',
			controller: 'DeleteWidgetModalCtrl'
		});
		
		myModal.result.then(function () {
			$rootScope.widgets.remove($scope.widget._id, $scope.widget.pageId);
		});
	};

	$scope.openConfigMenu = function () {
		var myModal = $modal.open({
			templateUrl: 'main/modals/widgetConfig/widgetConfig.html',
			controller: 'WidgetConfigCtrl',
			size: 'lg',
			resolve: {
				widget: function () {
					return $scope.widget;
				}
			}
		});

		myModal.result.then(function (newWidget) {
			$scope.widget = newWidget;
			$rootScope.widgets.update(newWidget);
			$scope.redraw();
		}, function () {
			$log.log('canceled');
		});
	};

	$scope.init();
};