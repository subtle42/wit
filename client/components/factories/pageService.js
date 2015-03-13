'use strict';

angular.module('mean.factories').factory('PageService', function ($http, $log, $rootScope) {
	var fac = {};
	fac.list = [];
	fac.selected = {};

	fac.getByCollection = function (id, callback) {
		$http.get('/api/pages/bycollection/' + id)
		.success(function (res) {
			fac.list = res;
			angular.forEach(res, function (page) {
				if (page.active === true) {
					fac.selected = page;
				}
			});
			if (callback) { callback(); }
		}).error(function (err) {
			$log.log(err);
		});
	};

	fac.updateSelected = function (page, callback) {
		angular.forEach($rootScope.pages.list, function (_page) {
			_page.active = false;
		});
		$rootScope.pages.selected = page;
		$rootScope.pages.selected.active = true;

		$http.put('/api/pages/tabselect', page)
		.success(function () {
			if (callback) { callback(); }
		}).error(function () {
			$log.log(err);
		});
	};

	fac.tabSelect = function (index) {
		$http({url: 'api/pageselect',
			method: 'PUT',
			data: {id: fac.list[index]._id}
		}).then(function (data) {
			fac.setActive(index);
		});
	};

	fac.update = function (page) {
		$http.put('api/page', page)
			.success(function (data) {});
	};

	fac.setOrder = function () {
		$http.post('api/pageorder', {
			pages: fac.list
		}).success(function (res) {
			$log.log('order success');
		})
		.error(function (err) {
			$log.log(err);
		});
	};

	fac.remove = function (page, callback) {
		$http.delete('/api/pages/' + page._id)
		.success(function (res) {
			var index = fac.list.indexOf(page);
			fac.list.splice(index, 1);
			if (callback) { callback(); }
		}).error(function (err) {
			$log.log(err);
		});
	};

	fac.add = function (newPageTitle, callback) {
		$http.post('/api/pages', {
			name: newPageTitle,
			collectionId: $rootScope.collections.selected._id
		}).success(function (res) {
			fac.list.push(res);
			if (callback) { callback(); }
		}).error(function (err) {
			$log.log(err);
		});
	};

	return fac;
});