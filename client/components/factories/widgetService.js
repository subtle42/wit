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

	fac.remove = function (widget) {
		$http.delete('api/widgets/' + widget._id)
		.success(function (res) {
			var index = fac.list.indexOf(widget);
			if (index !== -1) {
				fac.list.splice(index, 1);	
			}
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
			fac.list.push(newWidget);
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