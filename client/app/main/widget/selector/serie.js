angular.module('meanApp')
	.directive('serie', function () {
		return {
			restrict: 'E',
			scope: {
				config: '=selector',
				source: '=source',
				index: '=index'
			},
			templateUrl: 'app/main/widget/selector/serie.html',
			controller: function ($scope, $rootScope, $log, $timeout) {
				$scope.columnSelected = {};
				$scope.formulaSelected = {};
				$scope.formulaOptions = [{
					label: 'Sum',
					value: 'sum'
				}, {
					label: 'Min',
					value: 'min'
				}, {
					label: 'Avg',
					value: 'avg'
				}];

				$scope.count = function () {
					return $scope.$parent.widget.series.length;
				};

				$scope.remove = function (index) {
					$scope.$parent.widget.series.splice(index, 1);
					$rootScope.widgets.update($scope.$parent.widget);
				};

				$scope.updateConfig = function () {
					$scope.config.formula = $scope.formulaSelected.value;
					$scope.config.ref = $scope.columnSelected.ref;
					$rootScope.widgets.update($scope.$parent.widget);
					$scope.$parent.buildChart();
				};

				$scope.init = function () {
					angular.forEach($scope.source.columns, function (col) {
						if ($scope.config.ref === col.ref) {
							$scope.columnSelected = col;
						}
					});

					angular.forEach($scope.formulaOptions, function (formula) {
						if (formula.value === $scope.config.formula) {
							$scope.formulaSelected = formula;
						}
					});
				};

				$scope.init();
			}
		}
	}
);