'use strict';

angular.module('meanApp')
.controller('AddWidgetCtrl', function ($scope, $rootScope, $log) {
	$scope.sources = $rootScope.sources.list;
	$scope.dsSelected = undefined;
	$scope.typeSelected = undefined;
	$scope.measureCount = 0;
	$scope.groupCount = 0;
	
	$scope.chartImages = [{
		src: 'images/lineChart.png',
		type: 'line',
		dimension: 1,
		group: 1
	}, {
		src: 'images/pieChart.png',
		type: 'pie',
		dimension: 1,
		group: 1
	}, {
		src: 'images/histogram.png',
		type: 'histogram',
		dimension: 1,
		group: 0
	}];

	$scope.pages = {
		page1: true,
		page2: false
	};

	$scope.cancel = function () {
		$rootScope.$broadcast('CancelAddContent');
	};

	$scope.next = function () {
		$scope.pages.page1 = false;
		$scope.pages.page2 = true;
	};

	$scope.back = function () {
		if ($scope.typeSelected) { $scope.typeSelected.active = false; }
		$scope.typeSelected = undefined;
		$scope.pages.page2 = false;
		$scope.pages.page1 = true;
	};

	$scope.selectChartType = function (imageObject) {
		if ($scope.typeSelected) { $scope.typeSelected.active = false; }
		$scope.typeSelected = imageObject;
		$scope.typeSelected.active = true;
	};

	$scope.selectSource = function (myDataSource) {
		$scope.measureCount = 0;
		$scope.groupCount = 0;

		if ($scope.dsSelected) {
			$scope.dsSelected.active = false;
		}
		$scope.dsSelected = myDataSource;
		$scope.dsSelected.active = true;

		angular.forEach($scope.dsSelected.columns, function (col) {
			if (col.type === 'number') {
				$scope.measureCount++;
			} else if (col.type === 'group') {
				$scope.groupCount++;
			}
		});
	};

	$scope.validChart = function (chart) {
		if (chart.dimension > $scope.measureCount) {
			return false;
		} else if (chart.group > $scope.groupCount) {
			return false;
		}
		return true;
	};

	$scope.addWidgetFinish = function () {
		if (!$scope.typeSelected) {
			return;
		}
		var page = $rootScope.pages.selected;
		$rootScope.widgets.add($scope.typeSelected.type, $scope.dsSelected, page, function (newWidget) {
			// Adding widget to page's list of widgets
			$rootScope.pages.selected.widgetList = $rootScope.widgets.getWidgetIds();
			//$rootScope.pages.selected.widgetList.push(newWidget._id);
			$rootScope.pages.update($rootScope.pages.selected);
			// Getting data if data is not currently loaded on the page
			if (!$rootScope.data.list[$scope.dsSelected._id]) {
				$rootScope.data.get($scope.dsSelected._id);
			}	
		});
		$rootScope.$broadcast('WidgetAdded');
	};

	$scope.$on('uploadFinished', function (myScope, source) {
		$scope.selectSource(source);
		$scope.next();
	});
});