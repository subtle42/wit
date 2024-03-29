'use strict';

angular.module('meanApp.directives')
  .directive('ngEnter', function () {
    return function(scope, element, attrs) {
            element.bind('keydown keypress', function(event) {
                console.log('here');
                if(event.which === 13) {
                    scope.$apply(function(){
                        scope.$eval(attrs.ngEnter, {'event': event});
                    });
                    event.preventDefault();
                }
            });
        };
  	});