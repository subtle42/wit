angular.module('meanApp')
	.directive('group', function () {
		return {
			restrict: 'E',
			scope: {
				config: '=selector',
				source: '=source',
				index: '=index'
			},
			templateUrl: 'app/main/widget/selector/group.html',
			controller: function ($scope, $rootScope, $log, $timeout) {
				$scope.columnSelected = {};

				$scope.count = function () {
					return $scope.$parent.widget.groups.length;
				};

				$scope.remove = function (index) {
					$scope.$parent.widget.groups.splice(index, 1);
					$rootScope.widgets.update($scope.$parent.widget);
				};

				$scope.updateConfig = function () {
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
				};

				$scope.init();
			}
		}
	}
);