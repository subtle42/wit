'use strict';

angular.module('meanApp')
.controller('AddPageCtrl',function ($scope, $modalInstance, $log) {
	$scope.newPageTitle = '';

	$scope.save = function () {
		if ($scope.newPageTitle === '') { return; }
		$modalInstance.close($scope.newPageTitle);
	};
	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});