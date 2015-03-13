'use strict';

angular.module('meanApp.directives')
  .directive('ngFocus', function ($timeout) {
    return {
        restrict: 'AC',
        link: function(_scope, _element) {
            $timeout(function(){
                _element[0].focus();
            }, 10);
        }
    };
});

