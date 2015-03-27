'use strict';

angular.module('mean.factories').factory('DataService', function ($http, $log) {
	var fac = {};
	fac.list = [];
	fac.filters = [];

	fac.get = function (sourceId) {
		$http.get('api/sources/data/' + sourceId)
		.success(function (res) {
			fac.list[sourceId] = res;
			fac.filtes[sourceId] = {
				main: crossfilter(res)
			};
		}).error(function (err) {
			$log.log(err);
		});
	};

	return fac;
});