'use strict';

angular.module('mean.factories').factory('WidgetService', function ($log, $http, $rootScope) {
	var fac = {};
	fac.list = [];

	fac.getByPage = function (pageId, callback) {
		$http.get('api/widgets/bypage/' + pageId)
		.success(function (widgetArr) {
			fac.list = widgetArr;
			if (callback) { callback(); }
		}).error(function (err) {
			$log.log(err);
		});
	};

	fac.remove = function (widgetId, pageId) {
		var index = -1,
			count = 0;
		angular.forEach(fac.list, function (w) {
			if (w._id === widgetId) {
				index = count;
			}
			count++;
		});

		$http.post('api/widgetRemove', {
			widgetid: widgetId,
			pageid: pageId	
		}).success(function (res) {
			fac.list.splice(index, 1);
		}).error(function (err) {
			$log.log(err);
		});
	};

	fac.add = function (type, sourceId, pageId) {
		var myConfig = fac._getChartDefaults(type, sourceId);

		$http.post('api/widget', {
			type: type,
			sourceId: sourceId,
			pageId: pageId,
			series: myConfig.series,
			groups: myConfig.groups
		}).success(function (newWidget) {
			fac.list.push(newWidget);
		}).error(function (err) {
			$log.log(err);
		});
	};

	fac.update = function (widget) {
		$http.post('api/widgetUpdate', {
			widget: widget
		}).success(function (res) {
			$log.log(res);
		}).error(function (err) {
			$log.log(err);
		});
	};

	fac._getChartDefaults = function (type, sourceId) {
		var series = [];
		var groups = [];
		var source = $rootScope.sources.get(sourceId);

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