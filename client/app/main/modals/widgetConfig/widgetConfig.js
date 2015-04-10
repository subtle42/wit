'use strict';

angular.module('meanApp')
.controller('WidgetConfigCtrl', function ($scope, $rootScope, $modalInstance, $log, widget, source) {
	$scope.widget = angular.copy(widget);
	$scope.source = source;
	$scope.tmpHeight = $scope.widget.height;
	$scope.widget.height = 200;
	$scope.measureCount = 0;
	$scope.groupCount = 0;
	$scope.selectedType = null;

	$scope.chartImages = [{
		src: 'images/lineChart.png',
		type: 'line',
		dimension: 1,
		group: 1
	}, {
		src: 'images/pieChart.png',
		type: 'pie',
		dimension: 1,
		group: 1
	}, {
		src: 'images/histogram.png',
		type: 'histogram',
		dimension: 1,
		group: 0
	}];

	$scope.save = function () {
		$scope.widget.height = $scope.tmpHeight;
		$modalInstance.close($scope.widget);
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};

	$scope.updateDisplay = function () {
		$scope.$$childTail.buildChart();
	};

	$scope.validChart = function (chart) {
		if (chart.dimension > $scope.measureCount) {
			return false;
		} else if (chart.group > $scope.groupCount) {
			return false;
		}
		return true;
	};

	$scope.selectChartType = function (chart) {
		$scope.selectedType.active = false;
		$scope.selectedType = chart;
		$scope.selectedType.active = true;
		$scope.widget.type = chart.type;
/*
		if ($scope.widget.series.length < chart.dimension
			|| $scope.widget.groups.length < chart.groups) {
			$scope.setDefaultChartOptions();
		};
		*/
	};

	$scope.init = function () {
		angular.forEach($scope.chartImages, function (img) {
			if ($scope.widget.type === img.type) {
				$scope.selectedType = img;
				$scope.selectedType.active = true;
			}
		});

		angular.forEach($scope.source.columns, function (col) {
			if (col.type === 'number') {
				$scope.measureCount++;
			} else if (col.type === 'group') {
				$scope.groupCount++;
			}
		});
	};
/*
	$scope.setDefaultChartOptions = function () {
		// geting all group columns
		var groups = $rootScope.sources.getGroupColumns($scope.source);
		var series = $rootScope.sources.getSerieColumns($scope.source);
		var i = 0;

		angular.forEach($scope.source.columns, function (col) {
			if ($scope.selectedType.groups <= $scope.widget.groups.length
				&& $scope.selectedType.dimension <= $scope.widget.series.length) {
				return;
			}
			if (col.type === 'group') {
				var exist = false;
				angular.forEach($sources.widget.groups, function (g) {
					if (g.ref === col.ref) {
						exist = true;
					}
				});
				if (!exist) {
					$scope.groups.push({
						ref: col.ref
					});
				}
			}
		});
	};
*/
	$scope.init();
});