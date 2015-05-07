'use strict';

angular.module('meanApp')
.controller('PageConfigCtrl',function ($scope, $rootScope, $modalInstance, $log) {
	$scope.sourceList = $rootScope.sources.list;
	$scope.link = [{}, {}];
	$scope.source1 = null;
	$scope.source2 = null;
	$scope.field1 = null;
	$scope.field2 = null;
	$scope.showSource1 = true;
	$scope.showFields1 = false;
	$scope.showSource2 = true;
	$scope.showFields2 = false;

	/////////////////////////////////////////////////////////////////////////////////
	// Left side functions
	/////////////////////////////////////////////////////////////////////////////////

	$scope.selectSource1 = function (source) {
		if (source !== $scope.source1) {
			$scope.field1 = null;
		}
		$scope.source1 = source;
		$scope.showSource1 = false;
		$scope.showFields1 = true;
	};

	$scope.editSource1 = function () {
		$scope.showSource1 = true;
		$scope.showFields1 = false;
	};

	$scope.selectField1 = function (field) {
		$scope.field1 = field;
		$scope.showFields1 = false;
	};

	$scope.editFields1 = function () {
		$scope.showFields1 = true;
		$scope.showSource1 = false;
	};


	/////////////////////////////////////////////////////////////////////////////////
	// Right Side functions
	/////////////////////////////////////////////////////////////////////////////////

	$scope.selectSource2 = function (source) {
		if (source !== $scope.source2) {
			$scope.field2 = null;
		}
		$scope.source2 = source;
		$scope.showSource2 = false;
		$scope.showFields2 = true;
		$scope.field2 = null;
	};

	$scope.editSource2 = function () {
		$scope.showSource2 = true;
		$scope.showFields2 = false;
	};

	$scope.selectField2 = function (field) {
		$scope.field2 = field;
		$scope.showFields2 = false;
	};

	$scope.editFields2 = function () {
		$scope.showFields2 = true;
		$scope.showSource2 = false;
	};

	$scope.validForm = function () {
		if (!$scope.source1 || !$scope.source2) {
			return false;
		} else if (!$scope.field1 || !$scope.field2) {
			return false;
		}
		return true;
	};

	$scope.save = function () {
		var response = [{
			source: $scope.source1._id,
			field: $scope.field1.ref
		}, {
			source: $scope.source2._id,
			field: $scope.field2.ref
		}];
		$modalInstance.close(response);
	};
	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});