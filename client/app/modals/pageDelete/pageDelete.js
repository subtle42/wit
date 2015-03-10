'use strict';

angular.module('meanApp')
.controller('DeletePageModalCtrl', function ($scope, $modalInstance, page) {
	$scope.page = page;

	$scope.ok = function () {
		$modalInstance.close();
	};
	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});