'use strict';

angular.module('mean.factories').factory('SourceService', function ($http, $log, $rootScope, $upload) {
	var fac = {};
	fac.list = [];

	fac.getByUser = function (callback) {
		$http.get('/api/sources/byuser')
		.success(function (res) {
			fac.list = res;
			if (callback) { callback(); }
		}).error(function (err) {
			$log.log(err);
		});
	};

	fac.add = function (files, callback) {
		$upload.upload({
			url: 'api/sources',
			method: 'POST',
			data: $rootScope.user.profile.userId,
			file: files[0]
		}).progress(function (evt) {
			console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
		}).success(function (source) {
			fac.list[source._id] = source
			if (callback) { callback(source); }
		}).error(function (err) {
			$log.log(err);
		});
	};

	fac.update = function (source, callback) {
		$http.put('/api/sources', source)
		.success(function (res) {
			if (callback) { callback(); }
		}).error(function (err) {
			$log.log();
		});
	};

	return fac;
});