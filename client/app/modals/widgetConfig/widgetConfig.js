'use strict';

angular.module('mainApp')
.controller('WidgetConfigCtrl', function ($scope, $modalInstance, $log, widget) {
	$scope.widget = angular.copy(widget);
	$scope.tmpHeight = $scope.widget.height;
	$scope.widget.height = 200;

	$scope.save = function () {
		$scope.widget.height = $scope.tmpHeight;
		$modalInstance.close($scope.widget);
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};

	$scope.updateDisplay = function () {
		$scope.$$childTail.redraw();
	};
});