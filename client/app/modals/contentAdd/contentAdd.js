'use strict';

angular.module('meanApp')
.controller('AddContentModal', function ($scope, $rootScope, $log, $modalInstance, sources) {
	$scope.sources = sources;
	$scope.disableAddWidget = $scope.sources.length == 0 ? true : false;
	
	$scope.addWidgetTab = {
		active: Object.keys($scope.sources).length > 0 ? true : false
		,disabled: Object.keys($scope.sources).length == 0 ? true : false
	};
	$scope.addDataSourceTab = {
		active: Object.keys($scope.sources).length == 0 ? true : false
		,disabled: false	
	};

	$scope.myCancel = function () {
		$modalInstance.dismiss('cancel');
	};

	$scope.$on('CancelAddContent', function () {
		console.log('heard call');
		$scope.myCancel();
	});
	$scope.$on('uploadFinished', function (source) {
		console.log(source);
		$scope.addWidgetTab.active = true;
		$scope.addDataSourceTab = false;
	});
	$scope.$on('WidgetAdded', function (myScope, params) {
		$log.log('widget added, closing modal');
		$modalInstance.close();
	});
});