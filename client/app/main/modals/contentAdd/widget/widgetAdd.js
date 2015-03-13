'use strict';

angular.module('meanApp')
.controller('AddWidgetCtrl', function ($scope, $rootScope, $log) {
	$scope.dataSources = $rootScope.sources.dataSources;
	$scope.dsSelected = undefined;
	$scope.typeSelected = undefined;
	
	$scope.chartImages = [{
		src: 'images/lineChart.png',
		active: false,
		type: 'line'
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
		$scope.typeSelected = imageObject.type;
	};

	$scope.selectSource = function (myDataSource) {
		if ($scope.dsSelected) {
			$scope.dsSelected.active = false;
		}
		//myDataSource.active = true;
		$scope.dsSelected = myDataSource;
		$scope.dsSelected.active = true;
	};

	$scope.addWidgetFinish = function () {
		if (!$scope.typeSelected) {
			return;
		}
		var pageId = $rootScope.pages.list[$rootScope.pages.activeIndex]._id;
		$rootScope.widgets.add($scope.typeSelected, $scope.dsSelected._id, pageId);
		$rootScope.$broadcast('WidgetAdded');
	};

	$scope.$on('uploadFinished', function (source) {
		$scope.dsSelected = source;
		$scope.next();
	});
});