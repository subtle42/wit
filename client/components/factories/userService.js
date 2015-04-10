'use strict';

angular.module('mean.factories').factory('UserService', function ($http, $log) {
	var fac = {};
	fac.profile = [];

	fac.get = function (callback) {
		$http.get('/api/collections/allbyuser')
		.success(function (res) {
			fac.profile = res[0];
			if(callback) { callback(); }
		}).error(function (err) {
			$log.log(err);
		});
	};

	fac.update = function (callback) {
		$http.put('/api/users')
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