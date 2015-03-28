'use strict';

angular.module('meanApp.charts')
.directive('d3chart', function ($timeout, $window, $rootScope) {
    return {
        restrict: 'A',
        link: function postLink($scope, element, attrs) {
            if ($rootScope.data.list[$scope.widget.sourceId]) {
                $timeout(function () {
                    $scope.draw();
                }, 50);
            } else {
                console.log('looking for: ' + $scope.widget.sourceId + '_loaded');
                $scope.$on($scope.widget.sourceId + '_loaded', function () {
                    console.log('fired!');
                    if ($scope.chart) {
                        return;
                    }
                    $scope.widget.width = element.width();
                    var data = crossfilter($rootScope.data.list[$scope.widget.sourceId]);
                    var myDim = data.dimension(function (d) {
                        //return d['1'];
                        return d[parseInt($scope.widget.groups[0].ref)];
                    });
                    var total = myDim.group().reduceSum(function (d) {
                        return d[parseInt($scope.widget.series[0].ref)];
                    });
                    $scope.chart = new D3BarChart(element[0], $scope.widget, total.all());
                });
            }
            

            // Fires on window resize
            $(window).resize(function () {
                $scope.widget.width = element.width();
                $scope.chart.resize();
            });

            $scope.redraw = function () {
                if ($scope.chart) {
                    $scope.chart.svg.remove();
                    delete $scope.chart;
                }
                $scope.widget.width = element.width();
                var data = crossfilter($rootScope.data.list[$scope.widget.sourceId]);
                var myDim = data.dimension(function (d) {
                    //return d['1'];
                    return d[parseInt($scope.widget.groups[0].ref)];
                });
                var total = myDim.group().reduceSum(function (d) {
                    return d[parseInt($scope.widget.series[0].ref)];
                });
                $scope.chart = new D3BarChart(element[0], $scope.widget, total.all());
            };

            $scope.draw = function (element) {
                $scope.widget.width = element.width();
                    $scope.data = $rootScope.data.list[$scope.source._id];

                    angular.forEach($scope.widget.series, function (serie) {
                        if (!$scope.data[serie.ref]) {
                            var colName = parseInt(serie.ref);
                            $scope.data[colName] = $scope.data.main.dimension(function (d) {
                                return d[colName];
                            });
                        }
                    });
                    /*
                    var total = myDim.group().reduceSum(function (d) {
                        return d[parseInt($scope.widget.series[0].ref)];
                    });
                    */
                    //$scope.chart = new D3BarChart(element[0], $scope.widget, total.all());

                    $scope.chart = new D3Histogram()
                        .dimension($scope.data[$scope.widget.series[0]])
                        .margins($scope.widget.margins);
                    $log.log(chart);
            };
        }
    };
});

var _D3Chart = function () {
    var chart = {};
    chart.svg;
    chart.focus;

    var x,
        y,
        dimension,
        group,
        width,
        height,
        margins = {top:0, bottom:0, left:0, right:0};

    chart.margin = function (myVar) {
        if (!myVar) { return chart.margin; }
        margins = myVar;
        width = margins.left - margins.right;
        height = margins.top - margins.bottom;
        if (!chart.focus) { chart.buildFocus(); }
        return chart;
    };

    chart.dimension = function (myVar) {
        if (!myVar) { return dimension; }
        dimension = myVar;
        return chart;
    };

    chart.group = function (myVar) {
        if (!myVar) { return myVar; }
        group = myVar;
        return chart;
    };

    chart.filter = function(myVar) {
        if (myVar) {
            brush.extent(myVar);
            dimension.filterRange(myVar);
        } else {
            brush.clear();
            dimension.filterAll();
        }
        brushDirty = true;
        return chart;
    };

    chart.buildFocus = function () {
        chart.svg = div.append('svg')
            .attr('width', width + margins.left + margins.right)
            .attr('height', height + margins.top + margins.bottom);

        chart.focus = chart.svg.append('g')
            .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');        

        return chart.focus;
    };

    chart.buildAxisX = function () {
        var xAxis = d3.svg.axis()
            .scale(chart.x)
            .orient("bottom")

        chart.focus.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
    };
};

var D3Histogram = function (widget) {
    chart = _D3Chart();
    var min = d3.min(chart.group.all(), function (d) { return d.key; }),
        max = d3.max(chart.group.all(), function (d) { return d.key; }),
        step = (max - min) / 20;

    chart.x = d3.scale.linear()
        .domain([min, max + step])
        .range([0, chart.width]);

    chart.y = d3.scale.linear()
        .domain([0, d3.max(chart.group.all(), function (d) { return d.value; })])
        .range([chart.height, 0]);

    chart.group = chart.dimension.group(function (d) {
        return Math.floor(d/step)*step;
    });

    chart.buildDisplay = function () {
        chart.bar = chart.focus.selectAll(".bar")
            .data(chart.group.all())
            .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function(d) { return "translate(" + chart.x(d.key) + "," + chart.y(d.value) + ")"; });

        chart.bar.append("rect")
            .attr("x", 1)
            .attr("width", chart.x(min + step)-1)
            .attr("height", function(d) { return chart.height - chart.y(d.value); });
    };

    chart.buildBarNumbers = function () {
        var formatCount = d3.format(",.0f");
        chart.bars.append("text")
            .attr("dy", ".75em")
            .attr("y", 6)
            .attr("x", chart.x(min + step) / 2)
            .attr("text-anchor", "middle")
            .text(function(d) { return formatCount(d.value); });
    };

    /*
    chart.svg = div.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

    chart.focus = chart.svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    */

    /*
    chart.focus.append('clipPath')
        .attr('clip_' + widget._id)
        .append('rect')
        .attr('width', width)
        .attr('height', height);
    
    chart.focus.selectAll('.bar')
        .data(['background', 'foreground'])
        .enter().append('path')
        .attr('class', function (d) { return d + ' bar'; })
        .datum(group.all());
        

    // creating x axis
    chart.focus.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(axisx);

    // creating brush
    var gBrush = chart.focus.append('g')
        .attr('class', 'brush')
        .call(brush)
    */
    return chart;
};