'use strict';

angular.module('mean.charts')
.directive('d3chart', function ($timeout, $window, $rootScope, $log) {
    return {
        restrict: 'A',
        link: function postLink($scope, element, attrs) {
            if ($rootScope.data.list[$scope.widget.sourceId]) {
                $timeout(function () {
                    $scope.draw(element);
                }, 50);
            } else {
                console.log('looking for: ' + $scope.widget.sourceId + '_loaded');
                $scope.$on($scope.widget.sourceId + '_loaded', function () {
                    console.log('fired!');
                    if ($scope.chart) {
                        return;
                    }
                    $scope.draw(element);
                });
            }
            

            // Fires on window resize
            $(window).resize(function () {
                $scope.widget.width = element.width();
                $scope.chart.resize(element.width() - 50);
            });

            $scope.redraw = function () {
                if ($scope.chart) {
                    $scope.chart.svg.remove();
                    delete $scope.chart;
                }
                $scope.draw(element);
                return;

                $scope.widget.width = element.width();
                
                angular.forEach($scope.widget.series, function (serie) {
                    if (!$scope.data[serie.ref]) {
                        var colName = parseInt(serie.ref);
                        $scope.data[colName] = $scope.data.main.dimension(function (d) {
                            return d[colName];
                        });
                    }
                });
                $scope.chart = new D3Histogram($scope.widget, $scope.data, element[0], $rootScope.widgets.filterList[$scope.source._id]);
                $log.log($scope.chart);

                $scope.chart.buildFocus();
                $scope.chart.buildAxisX();
                $scope.chart.buildDisplay();
                $scope.chart.buildBarNumbers();
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
                $scope.subset = $rootScope.data.list[$scope.source._id].all.value();
                $scope.chart = new D3Histogram($scope.widget, $scope.data, element[0], $rootScope.widgets.filterList[$scope.source._id]);
                $scope.chart.buildFocus();
                $scope.chart.buildAxisX();
                $scope.chart.buildDisplay();
                $scope.chart.buildBarNumbers();
            };
        }
    };
});

var _D3Chart = function (config, data, myDirEle, filterList) {
    var chart = {};
    chart.filterList = filterList;
    chart.config = config;
    chart._myDirEle = myDirEle;
    chart.data = data;
    chart.svg;
    chart.focus;
    chart.x;
    chart.y;
    chart.dimension;
    chart.group;
    chart.margins = config.margins ? config.margins : {top:0, bottom:0, left:0, right:0};
    chart.width = chart.config.width - chart.margins.left - chart.margins.right;
    chart.height = chart.config.height - chart.margins.top - chart.margins.bottom;
    

    chart.setMargins = function (myVar) {
        if (!myVar) { return chart.margin; }
        margins = myVar;
        width = margins.left - margins.right;
        height = margins.top - margins.bottom;
        if (!chart.focus) { chart.buildFocus(); }
        return chart;
    };

    chart.resize = function (width, height) {
        console.error('chart resize is not defined'); 
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

    chart.brushHandles = function (d) {
        var e = +(d == "e"),
            x = e ? 1 : -1,
            y = chart.height / 3;
        return "M" + (.5 * x) + "," + y
            + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
            + "V" + (2 * y - 6)
            + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
            + "Z"
            + "M" + (2.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8)
            + "M" + (4.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8);
    };

    chart.buildFocus = function () {
        chart.svg = d3.select(chart._myDirEle)
            .append('svg')
            .attr('width', chart.width + chart.margins.left + chart.margins.right)
            .attr('height', chart.height + chart.margins.top + chart.margins.bottom);

        chart.focus = chart.svg.append('g')
            .attr('transform', 'translate(' + chart.margins.left + ',' + chart.margins.top + ')');

        return chart.focus;
    };

    chart.buildAxisX = function () {
        chart.xAxis = d3.svg.axis()
            .scale(chart.x)
            .orient("bottom");

        chart.focus.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + chart.height + ")")
            .call(chart.xAxis);
    };
    return chart;
};

var D3Histogram = function (config, data, myDirEle, filterList) {
    var chart = new _D3Chart(config, data, myDirEle, filterList);
    chart.dimension = chart.data[chart.config.series[0].ref];//[chart.config.series[0].ref];

    var min = d3.min(chart.dimension.top(Infinity), function (d) { return d[chart.config.series[0].ref]; }),
        max = d3.max(chart.dimension.top(Infinity), function (d) { return d[chart.config.series[0].ref]; }),
        stepCount = 20,
        step = (max - min) / stepCount;

    max = max + step;

    chart.group = chart.dimension.group(function(d){
        return Math.floor(d/step)*step;
    });

    chart.x = d3.scale.linear()
        .domain([min, max])
        .range([0, chart.width]);

    chart.y = d3.scale.linear()
        .domain([0, d3.max(chart.group.all(), function (d) { return d.value; })])
        .range([chart.height, 0]);

    chart.group = chart.dimension.group(function (d) {
        return Math.floor(d/step)*step;
    });

    chart.brushChange = function () {
        var tmp = chart.brush.extent()
        console.log(tmp);
        chart.dimension.filterRange(tmp);
        angular.forEach(chart.filterList, function (item) {
            item.chart.resize();
        });
    };

    chart.brushEnd = function () {
        if (chart.brush.empty()) {
            console.log('brush empty');
            chart.dimension.filterAll();
            angular.forEach(chart.filterList, function (item) {
                item.chart.resize();
            });
        }
    };

    chart.brush = d3.svg.brush()
        .x(chart.x)
        .on('brush', chart.brushChange)
        .on('brushend', chart.brushEnd);

    chart.buildDisplay = function () {
        chart.bars = chart.focus.selectAll(".bar")
            .data(chart.group.all())
            .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function(d) { return "translate(" + chart.x(d.key) + "," + chart.y(d.value) + ")"; })
        
        chart.disp = chart.bars.append("rect")
            .attr("x", 1)
            .attr("width", chart.x(min + step)-1)
            .attr("height", function(d) { return chart.height - chart.y(d.value); });
        
        chart.gBrush = chart.focus.append("g").attr("class", "brush").call(chart.brush);
          chart.gBrush.selectAll("rect").attr("height", chart.height);
          chart.gBrush.selectAll(".resize").append("path").attr("d", chart.brushHandles);
/*
        chart.bars = chart.focus.selectAll(".bar")
              .data(["background", "foreground"])
            .enter().append("path")
              .attr("class", function (d) { return d + " bar"; })
              .datum(chart.group.all());

        chart.focus.selectAll(".bar")
            .attr("d", chart.barPath)
            .attr('width', chart.x(min + step)-1);
  */      
    };

    chart.barPath = function (groups) {
        var path = [],
            i = -1,
            n = groups.length,
            d;
        while (++i < n) {
          d = groups[i];
          path.push("M", chart.x(d.key), ",", chart.height, "V", chart.y(d.value), "h" + (chart.x(min + step)-1) + "V", chart.height);
        }
        return path.join("");
      };

    chart.buildBarNumbers = function () {
        var formatCount = d3.format(",.0f");
        chart.text = chart.bars.append("text")
            .attr("dy", ".75em")
            .attr("y", 6)
            .attr("x", chart.x(min + step) / 2)
            .attr("text-anchor", "middle")
            .text(function(d) { return formatCount(d.value); });
    };

    chart.resize = function (_width, _height) {
        var width = _width ? _width : chart.width;
        var height = _height ? _height : chart.height;

        // resize widget content area
        chart.svg 
            .attr('width', width + chart.margins.left + chart.margins.right)
            .attr('height', height + chart.margins.top + chart.margins.bottom);

        // updating d3 scaling
        chart.x.range([0, width]);
        chart.y.range([height, 0])
            .domain([0,d3.max(chart.group.all(), function (d) { return d.value; })]);
        
        // resize chart area, includes padding
        chart.focus.select('.x')
            .attr("transform", "translate(0," + height + ")")
            .call(chart.xAxis);

        var formatCount = d3.format(",.0f");
        // moves column text
        chart.text.attr("x", chart.x(min + step) / 2)
            .text(function (d) { return formatCount(d.value); });

        // moves columns left and right
        chart.bars
            .attr("transform", function(d) { return "translate(" + chart.x(d.key) + "," + chart.y(d.value) + ")"; });

        // updates bar width and height
        chart.disp
            .attr("x", 1)
            .attr("width", chart.x(min + step)-1)
            .attr("height", function(d) { return height - chart.y(d.value); });

        // updates brush area to be inline with focus
        chart.gBrush.call(chart.brush);
        // removes brush from view due to brush not scaling during move
        chart.brush.clear();
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