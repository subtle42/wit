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
	$scope.linkList = angular.copy($rootScope.pages.selected.sourceLinks);

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
		} else if ($scope.isDuplicateLink()) {
			return false;
		}
		return true;
	};

	$scope.isDuplicateLink = function () {
		var isDuplicate = false;

		angular.forEach($scope.linkList, function (linkArray) {
			var duplicateCount = 0;
			angular.forEach(linkArray, function (link) {
				if ($scope.source1._id === link.source && $scope.field1.ref === link.field) {
					duplicateCount++;
				}
				if ($scope.source2._id === link.source && $scope.field2.ref === link.field) {
					duplicateCount++;
				}
			});
			if (duplicateCount === 2) {
				isDuplicate = true;
			}
		});
		return isDuplicate;
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

	$scope.init = function () {
		angular.forEach($scope.linkList, function (linkArray) {
			angular.forEach(linkArray, function (link) {
				angular.forEach($rootScope.sources.list, function (source) {
					if (link.source === source._id) {
						link.sourceName = source.name;
						angular.forEach(source.columns, function (column) {
							if (link.field === column.ref) {
								link.fieldName = column.name;
							}
						});
					}
				});				
			});
		});
	};

	$scope.init();
});