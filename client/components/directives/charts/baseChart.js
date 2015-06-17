'use strict';

angular.module('mean.charts')
.directive('d3chart', function ($timeout, $window, $rootScope, $log) {
    return {
        restrict: 'A',
        link: function postLink($scope, element, attrs) {
            if ($rootScope.data.list[$scope.widget.sourceId]) {
                $timeout(function () {
                    $scope.buildChart();
                }, 50);
            } else {
                $scope.$on($scope.widget.sourceId + '_loaded', function () {
                    if ($scope.chart) {
                        return;
                    }
                    $scope.buildChart();
                });
            }

            // Fires on window resize
            $(window).resize(function () {
                $scope.chart.resize(element.width());
            });

            $scope.addMissingLinkDimensions = function () {
                var sourcesOnPage = $rootScope.widgets.getSourceList();
                angular.forEach($rootScope.pages.selected.sourceLinks, function (linkArray) {
                    angular.forEach(linkArray, function (link) {
                        // if source is not on page skip
                        if (sourcesOnPage.indexOf(link.source) === -1) {
                            return;
                        }
                        var tmpData = $rootScope.data.list[link.source];
                        // create dimension if source exists but dimension does not
                        if (!tmpData[link.field]) {
                            tmpData[link.field] = tmpData.main.dimension(function (d) {
                                return d[link.field];
                            });
                        }
                    });
                });
            };

            $scope.checkAllSourcesAreLoaded = function (callback) {
                var sourceList = $rootScope.widgets.getSourceList();
                var allLoaded = true;
                angular.forEach(sourceList, function (source) {
                    if (!$rootScope.data.list[source]) {
                        allLoaded = false;
                    }
                });
                if (!allLoaded) {
                    setTimeout($scope.checkAllSourcesAreLoaded, 1000);
                } else {
                    if (callback) { callback();}
                }
            };

            $scope.createDimesionList = function (dimensionObj, dimensionField) {
                var dimList = [];
                angular.forEach($rootScope.pages.selected.sourceLinks, function (linkArray) {
                    var inLink = false;
                    angular.forEach(linkArray, function (link) {
                        if ($scope.source._id === link.source && dimensionField === link.field) {
                            inLink = true;
                        }
                    });

                    if (inLink) {
                        angular.forEach(linkArray, function (link) {
                            var tmpData = $rootScope.data.list[link.source];
                            dimList.push(tmpData[link.field]);
                        });
                    }
                });

                var currentDimIndex = dimList.indexOf(dimensionObj);
                if (currentDimIndex !== -1) {
                    dimList = dimList.splice(currentDimIndex, 1);
                }
                return dimList;
            };

            $scope.buildChart = function () {
                if ($scope.chart) {
                    $scope.chart.svg.remove();
                    delete $scope.chart;
                }

                $scope.widget.width = element.width();
                $scope.data = $rootScope.data.list[$scope.source._id];

                
                $scope.subset = $rootScope.data.list[$scope.source._id].all.value();
                if ($scope.widget.type === 'pie') {
                    angular.forEach($scope.widget.groups, function (group) {
                        if (!$scope.data[group.ref]) {
                            var colName = parseInt(group.ref);
                            $scope.data[colName] = $scope.data.main.dimension(function (d) {
                                return d[colName];
                            });
                        }
                    });
                    //var tmp = $scope.createDimesionList($scope.data[$scope.widget.groups[0].ref], $scope.widget.groups[0].ref);
                    //$log.log(tmp);
                    $scope.chart = new D3Pie($scope.widget, $scope.data, element[0], $rootScope.widgets.filterList[$scope.source._id]);
                } else if ($scope.widget.type === 'histogram') {
                    angular.forEach($scope.widget.series, function (serie) {
                        if (!$scope.data[serie.ref]) {
                            var colName = parseInt(serie.ref);
                            $scope.data[colName] = $scope.data.main.dimension(function (d) {
                                return d[colName];
                            });
                        }
                    });
                    //var tmp = $scope.createDimesionList($scope.data[$scope.widget.series[0]], $scope.widget.series[0]);
                    //$log.log(tmp);
                    $scope.chart = new D3Histogram($scope.widget, $scope.data, element[0], $rootScope.widgets.filterList[$scope.source._id]);
                }
                $scope.checkAllSourcesAreLoaded(function () {
                    $scope.addMissingLinkDimensions();
                });
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
    

    chart.resize = function (width, height) {
        console.error('chart resize is not defined'); 
    };

    chart.draw = function () {
        console.error('chart draw is not defined');
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

    chart.buildBrush = function () {
        chart.brush = d3.svg.brush()
            .x(chart.x)
            .on('brush', chart._brushChange)
            .on('brushend', chart._brushEnd);
    };

    chart._brushChange = function () {
        // getting exact value from brush
        chart.dimension.filterRange(chart.brush.extent());
        chart._runFilter();
    };

    chart._brushEnd = function () {
        if (chart.brush.empty()) {
            // clearing filter
            chart.dimension.filterAll();
            chart._runFilter();
        }
    };

    chart._runFilter = function () {
        // running update on all charts with the same source
        angular.forEach(chart.filterList, function (item) {
            item.chart.draw();
        });
    };

    return chart;
};

//TODO: should probably make this a service
var D3Histogram = function (config, data, myDirEle, filterList) {
    var chart = new _D3Chart(config, data, myDirEle, filterList);
    var formatCount = d3.format(",.0f");
    // TODO: this line should be abstacted
    chart.dimension = chart.data[chart.config.series[0].ref];


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

    chart._brushChange = function () {
        var e = chart.brush.extent();
        chart.bars.classed('background', function (d) {
            return e[0] > d.key || d.key > e[1];
        });
        // getting exact value from brush
        chart.dimension.filterRange(e);
        chart._runFilter();
    };

    chart._brushEnd = function () {
        if (chart.brush.empty()) {
            chart.bars.classed('background', false);
            // clearing filter
            chart.dimension.filterAll();
            chart._runFilter();
        }
    };

    chart.buildBrush();

    chart.init = function () {
        chart.buildFocus();
        chart.buildDisplay();
        chart.buildBarNumbers();
        chart.buildAxisX();
    };

    chart.buildDisplay = function () {
        chart.barColumns = chart.focus.selectAll(".bar")
            .data(chart.group.all())
            .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function(d) { return "translate(" + chart.x(d.key) + "," + chart.y(d.value) + ")"; })
        
        chart.bars = chart.barColumns.append("rect")
            .attr("x", 1)
            .attr("width", chart.x(min + step)-1)
            .attr("height", function(d) { return chart.height - chart.y(d.value); });
        
        chart.gBrush = chart.focus.append("g").attr("class", "brush").call(chart.brush);
        chart.gBrush.selectAll("rect").attr("height", chart.height);
        chart.gBrush.selectAll(".resize").append("path").attr("d", chart.brushHandles);
    };

    chart.buildBarNumbers = function () {
        chart.text = chart.barColumns.append("text")
            .attr("dy", ".75em")
            .attr("y", 6)
            .attr("x", chart.x(min + step) / 2)
            .attr("text-anchor", "middle")
            .text(function(d) { return formatCount(d.value); });
    };

    // no change in scaling on update data display
    chart.draw = function () {
        chart.y.domain([0, d3.max(chart.group.top(1), function (d) { return d.value; })]);
        // moves column text
        chart.text
            .text(function (d) { return formatCount(d.value); });
        // moves the column up and down
        chart.barColumns
            .attr("transform", function(d) { return "translate(" + chart.x(d.key) + "," + chart.y(d.value) + ")"; });
        // controls the length of the column
        chart.bars
            .attr("height", function(d) { return chart.height - chart.y(d.value); });
    };

    // change scaling of chart no data change
    chart.resize = function (_width, _height) {
        var width = chart.width;
        var height = chart.height;
        if (_width) {
            width = _width - chart.margins.left - chart.margins.right;
        }
        if (_height) {
            height = _height - chart.margins.top - chart.margins.bottom;
        }

        // resize widget content area
        chart.svg 
            .attr('width', width + chart.margins.left + chart.margins.right)
            .attr('height', height + chart.margins.top + chart.margins.bottom);

        // updating d3 scaling
        chart.x.range([0, width]);
        chart.y.range([height, 0]);
        
        // resize the x axis
        chart.focus.select('.x')
            .attr("transform", "translate(0," + height + ")")
            .call(chart.xAxis);

        // adjusts count text
        chart.text.attr("x", chart.x(min + step) / 2);

        // moves columns left and right
        chart.barColumns
            .attr("transform", function (d) { return "translate(" + chart.x(d.key) + "," + chart.y(d.value) + ")"; });

        // updates bar width and height
        chart.bars
            .attr("width", chart.x(min + step) - 1)
            .attr("height", function (d) { return height - chart.y(d.value); });

        // updates brush area to be inline with focus
        chart.gBrush.call(chart.brush);
        // removes brush from view due to brush not scaling during move
        chart.brush.clear();
    };

    chart.init();

    return chart;
};

var D3Pie = function (config, data, myDirEle, filterList) {
    var chart = new _D3Chart(config, data, myDirEle, filterList);

    chart.dimension = chart.data[chart.config.groups[0].ref];
    chart.group = chart.dimension.group().reduceSum(function (d) {
        return d[chart.config.series[0].ref];
    });

    chart.radius = Math.min(chart.width, chart.height) / 2;
    chart.color = d3.scale.category20().domain(chart.group.all().map(function (d) {
        return d.key;
    }));
    chart.links = [];
    

    chart.init = function () {
        chart.buildFocus();
        chart.buildDisplay();
        chart.buildLegend();
    };

    chart.buildFocus = function () {
        chart.svg = d3.select(chart._myDirEle)
            .append('svg')
            .attr('width', chart.width + chart.margins.left + chart.margins.right)
            .attr('height', chart.height + chart.margins.top + chart.margins.bottom)
            .on('click', function () {
                chart.dimension.filterAll();
                chart._runFilter();
            });

        chart.focus = chart.svg.append('g')
            .attr('transform', 'translate(' + chart.width/2 + ',' + chart.height/2 + ')');
    };

    chart.buildDisplay = function () {
        chart.arc = d3.svg.arc()
            .outerRadius(chart.radius)
            .innerRadius(0);

        chart.pie = d3.layout.pie()
            .sort(null)
            .value(function (d) {
                return d.value;
            });

        chart.path = chart.focus.datum(chart.group.all())
            .selectAll('path')
            .data(chart.pie).enter()
            .append('path')
            .attr('fill', function (d) {
                return chart.color(d.data.key);
            })
            .attr('d', chart.arc)
            .on('click', function (d) {
                d3.event.stopPropagation();
                chart.dimension.filter(d.data.key);
                chart._runFilter();
            });
    };

    chart.draw = function () {
        // errors are thrown in d3 if there is no data set, settting chart to hidden
        if (chart.data.all.reduceCount().value() === 0) {
            chart.path.style('visibility', 'hidden');
            return;
        }
        chart.path.style('visibility', 'visible');
        chart.path.data(chart.pie);
        chart.path.attr('d', chart.arc);
    };

    chart.resize = function (_width, _height) {
        var width = chart.width;
        var height = chart.height;
        if (_width) {
            width = _width - chart.margins.left - chart.margins.right;
        }
        if (_height) {
            height = _height - chart.margins.top - chart.margins.bottom;
        }

        // resize widget content area
        chart.svg 
            .attr('width', width + chart.margins.left + chart.margins.right)
            .attr('height', height + chart.margins.top + chart.margins.bottom);

        chart.radius = Math.min(width, height) / 2;

        chart.focus
            .attr('transform', 'translate(' + width/2 + ',' + height/2 + ')');
        chart.arc.outerRadius(chart.radius);
        chart.path.attr('d', chart.arc);
    };

    chart.buildLegend = function () {
        return;
        var legend = chart.svg.append('g')
            .attr('class', 'legend')
            .attr('height', 100)
            .attr('width', 100)
            .attr('transform', 'translate(-20,10)');

        var legendRect = legend.selectAll('rect').data(chart.group.all());
        
        legendRect.enter()
            .append('rect')
            .attr('x', chart.width-65)
            .attr('width', 10)
            .attr('height', 10);

        legendRect
            .attr('y', function (d, i) {
                return i * 20;
            })
            .style('fill', function (d) {
                return chart.color(d.key);
            });

        var legengText = legend.selectAll('text').data(chart.group.all());
        
        legengText.enter()
            .append('text')
            .attr('x', chart.width - 52);

        legengText
            .attr('y', function (d, i) {
                return i * 20 + 9;
            })
            .text(function (d) {
                return d.key;
            });
    };

    chart.init();
    return chart;
};