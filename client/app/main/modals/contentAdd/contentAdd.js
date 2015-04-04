'use strict';

angular.module('meanApp')
.controller('ContentAddModalCtrl', function ($scope, $rootScope, $log, $modalInstance) {
	$scope.sources = $rootScope.sources;
	$scope.disableAddWidget = $scope.sources.list.length == 0 ? true : false;
	
	$scope.addWidgetTab = {
		active: $scope.sources.list.length > 0 ? true : false,
		disabled: $scope.sources.list.length == 0 ? true : false
	};
	$scope.addDataSourceTab = {
		active: Object.keys($scope.sources.list).length == 0 ? true : false,
		disabled: false	
	};

	$scope.myCancel = function () {
		$modalInstance.dismiss('cancel');
	};

	$scope.$on('CancelAddContent', function () {
		console.log('heard call');
		$scope.myCancel();
	});
	$scope.$on('uploadFinished', function (myScope, source) {
		$scope.addWidgetTab.active = true;
		$scope.addDataSourceTab = false;
	});
	$scope.$on('WidgetAdded', function (myScope, params) {
		$log.log('widget added, closing modal');
		$modalInstance.close();
	});
});