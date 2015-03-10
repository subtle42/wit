'use strict';

angular.module('meanApp')
.controller('SourceConfigCtrl', function ($scope, $rootScope, $modalInstance, $log) {
	$scope.sourceList = $rootScope.sources.dataSources;
	$scope.focus = {};
	$scope.colTypes = ['group', 'number', 'date', 'text'];
	
	$scope.colSortOptions = {
		axis: 'y',
		start: function (e, ui) {
			$log.log('start');
		},
		stop: function (e, ui) {
			$log.log('stop');
		}
	};

	$scope.selectSource = function (source) {
		$scope.focus = angular.copy(source);
	};

	$scope.save = function () {
		$modalInstance.close($scope.focus);
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});