'use strict';

angular.module('mean.factories').factory('WidgetService', function ($log, $http, $rootScope) {
	var fac = {};
	fac.list = [];
	fac.filterList = [];

	fac.getByPage = function (pageId, callback) {
		$http.get('api/widgets/bypage/' + pageId)
		.success(function (widgetArr) {
			fac.list = widgetArr;
			if (callback) { callback(); }
		}).error(function (err) {
			$log.log(err);
		});
	};

	fac.remove = function (widget, callback) {
		$http.delete('api/widgets/' + widget._id)
		.success(function (res) {
			angular.forEach(fac.list, function (widgetColumn) {
				var index = widgetColumn.indexOf(widget);
				if (index !== -1) {
					widgetColumn.splice(index, 1);
				}
			});
			if (callback) { callback(); }
		}).error(function (err) {
			$log.log(err);
		});
	};

	fac.add = function (type, source, page, callback) {
		var myConfig = fac._getChartDefaults(type, source);

		$http.post('api/widgets', {
			type: type,
			sourceId: source._id,
			pageId: page._id,
			series: myConfig.series,
			groups: myConfig.groups
		}).success(function (newWidget) {
			var columnToAppend = fac._findSmallestColumn();
			columnToAppend.push(newWidget);
			if (callback) { callback(newWidget); }
		}).error(function (err) {
			$log.log(err);
		});
	};

	fac.update = function (widget) {
		$http.put('api/widgets', widget)
		.success(function (res) {
			$log.log(res);
		}).error(function (err) {
			$log.log(err);
		});
	};

	fac.getSourceList = function () {
		var sourceList = [];

		angular.forEach(fac.list, function (widgetColumn) {
			angular.forEach(widgetColumn, function (widget) {
				if (sourceList.indexOf(widget.sourceId) === -1) {
					sourceList.push(widget.sourceId);
				}
			});
		});

		return sourceList;
	};

	fac._findSmallestColumn = function () {
	// find column with the least number of widgets
		var min = 10000;
		var smallestColumn = null;
		angular.forEach(fac.list, function (widgetColumn) {
			if (widgetColumn.length < min) {
				smallestColumn = widgetColumn;
				min = widgetColumn.length;
			}
		});
		return smallestColumn;
	};

	fac.getWidgetIds = function () {
		var response = [];
		angular.forEach(fac.list, function (widgetColumn) {
			var columnIds = [];
			angular.forEach(widgetColumn, function (myWidget) {
				columnIds.push(myWidget._id);
			});
			response.push(columnIds);
		});
		return response;
	};

	fac._getChartDefaults = function (type, source) {
		var series = [];
		var groups = [];

		source.columns.forEach(function (col) {
			if (col.type === 'number' && series.length === 0) {
				series.push({
					ref: col.ref,
					formula: 'sum'
				});
			}
			if (col.type === 'group' && groups.length === 0) {
				groups.push({
					ref: col.ref
				});
			}
		});
		return {series: series, groups: groups};
	};

	return fac;
});