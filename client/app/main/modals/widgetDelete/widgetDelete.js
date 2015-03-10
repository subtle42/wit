'use strict';

angular.module('meanApp')
.controller('DeleteWidgetModalCtrl', function ($scope, $modalInstance, widget) {
	$scope.widget = widget;

	$scope.ok = function () {
		$modalInstance.close();
	};
	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});