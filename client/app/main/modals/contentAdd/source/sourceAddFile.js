'use strict';

angular.module('meanApp')
.controller('AddSourceFileCtrl', function ($scope, $rootScope, $upload) {
	$scope.filepath = '';
	$scope.fileProgress = 0;
	$scope.pages = {
		page1: true,
		page2: false
	};

	$scope.myData = [{name: "Moroni", age: 50},
                     {name: "Tiancum", age: 43},
                     {name: "Jacob", age: 27},
                     {name: "Nephi", age: 29},
                     {name: "Enos", age: 34}];
                     
    $scope.gridOptions = { data : 'myData' };

	$scope.fileDone = function () {
		$scope.pages.page1 = false;
		$scope.pages.page2 = true;
	};

	$scope.onFileSelect = function ($files) {
		if ($files.length > 1) {
			alert('Cannot upload more than one file at a time.');
			return;
		}

		$rootScope.sources.add($files, function (source) {
			$rootScope.$broadcast('uploadFinished', source);
		});
	};

	$scope.uploadClick = function () {
		$scope.fileDone();
	};

	$scope.cancel = function () {
		$rootScope.$broadcast('CancelAddContent');
	};

	$scope.back = function () {
		$scope.pages.page1 = true;
		$scope.pages.page2 = false;
	};
});