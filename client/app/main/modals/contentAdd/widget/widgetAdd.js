'use strict';

angular.module('meanApp')
.controller('AddWidgetCtrl', function ($scope, $rootScope, $log) {
	$scope.sources = $rootScope.sources.list;
	$scope.dsSelected = undefined;
	$scope.typeSelected = undefined;
	
	$scope.chartImages = [{
		src: 'images/lineChart.png',
		type: 'line'
	}, {
		src: 'images/pieChart.png',
		type: 'pie'
	}, {
		src: 'images/histogram.png',
		type: 'histogram'
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
		$scope.pages.page2 = false;
		$scope.pages.page1 = true;
	};

	$scope.selectChartType = function (imageObject) {
		if ($scope.typeSelected) { $scope.typeSelected.active = false; }
		$scope.typeSelected = imageObject;
		$scope.typeSelected.active = true;
	};

	$scope.selectSource = function (myDataSource) {
		if ($scope.dsSelected) {
			$scope.dsSelected.active = false;
		}
		$scope.dsSelected = myDataSource;
		$scope.dsSelected.active = true;
	};

	$scope.addWidgetFinish = function () {
		if (!$scope.typeSelected) {
			return;
		}
		var page = $rootScope.pages.selected;
		$rootScope.widgets.add($scope.typeSelected.type, $scope.dsSelected, page);
		$rootScope.$broadcast('WidgetAdded');
	};

	$scope.$on('uploadFinished', function (myScope, source) {
		$scope.dsSelected = source;
		$scope.next();
	});
});