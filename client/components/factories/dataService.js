'use strict';

angular.module('mean.factories').factory('DataService', function ($http, $rootScope, $log) {
	var fac = {};
	fac.list = [];

	fac.get = function (sourceId) {
		$http.get('api/sources/data/' + sourceId)
		.success(function (res) {
			fac.list[sourceId] = {
				main: crossfilter(res),
			};
			fac.list[sourceId].all = fac.list[sourceId].main.groupAll();
			$rootScope.$broadcast(sourceId + '_loaded');
		}).error(function (err) {
			$log.log(err);
		});
	};

	return fac;
});