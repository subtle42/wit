'use strict';

angular.module('mean.filters')
.filter('columnType', function () {
	return function (columns, lookupType) {
		var response = [];

		angular.forEach(columns, function (col) {
			if (col.type === lookupType) {
				response.push(col);
			}
		});

		return response;
	};
})
.filter('columnRepeats', function () {
	return function (columns, existing) {
		var response = [];
		angular.forEach(columns, function (col) {
			var found = false;
			angular.forEach(existing, function (exist) {
				if (col.ref === exist.ref) {
					found = true;
				}
			});
			if (!found) {
				response.push(col);
			}
		});
		return respose;
	};
})
.filter('sourceDuplicates', function () {
	return function (sources, alreadySelected) {
		var response = [];
		angular.forEach(sources, function (source) {
			if (source !== alreadySelected) {
				response.push(source);
			}
		});
		return response;
	};
});