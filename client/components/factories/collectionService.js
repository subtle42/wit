'use strict';

angular.module('mean.factories').factory('CollectionService', function ($http, $log) {
	var fac = {};
	fac.list = [];
	fac.selected = {};

	fac.getByUser = function (callback) {
		$http.get('/api/collections/allbyuser')
		.success(function (res) {
			fac.list = res;
			angular.forEach(res, function (coll) {
				if (coll.active === true) {
					fac.selected = coll;
				}
			});
			if(callback) { callback(); }
		}).error(function (err) {
			$log.log(err);
		});
	};

	fac.update = function (collect, callback) {
		$http.put('/api/collections', collect)
		.success(function (res) {
			if (callback) { callback(); }
		}).error(function (err) {
			$log.log(err);
		});
	};

	fac.remove = function (index) {
	};

	fac.add = function (newPageTitle) {
	};

	return fac;
});