/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /widgets              ->  index
 * POST    /widgets              ->  create
 * GET     /widgets/:id          ->  show
 * PUT     /widgets/:id          ->  update
 * DELETE  /widgets/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Widget = require('./widget.model');
var Page = require('../page/page.model');

// Get list of widgets by pageId
exports.byPage = function (req, res) {
  Page.findById(req.params.id, function (err, page) {
    if(err || !page) { return handleError(res, err); }
    //if (page.widgetList.length === 0) {return res.json([]); }
    // Get all widgets on a page
    Widget.find({
      pageId: req.params.id
    }, function (err, widgets) {
      if(err) { return handleError(res, err); }
      if(widgets.length == 0) {
        res.json(page.widgetList);
      }

      var widgetResponse = [];
      page.widgetList.forEach(function (widgetColumn, i) {
        widgetResponse.push([]);
        widgetColumn.forEach(function (widgetId) {
          widgets.forEach(function (myWidget) {
            if (myWidget._id == widgetId) {
              widgetResponse[i].push(myWidget);
            }
          });
        });
      });
      return res.json(widgetResponse)
    });
  });
};

// Get list of widgets
exports.index = function(req, res) {
  Widget.find(function (err, widgets) {
    if(err) { return handleError(res, err); }
    return res.json(200, widgets);
  });
};

// Get a single widget
exports.show = function(req, res) {
  Widget.findById(req.params.id, function (err, widget) {
    if(err) { return handleError(res, err); }
    if(!widget) { return res.send(404); }
    return res.json(widget);
  });
};

// Creates a new widget in the DB.
exports.create = function(req, res) {
  var newWidget = new Widget({
    name: 'asdf',
    type: req.body.type,
    sourceId: req.body.sourceId,
    pageId: req.body.pageId,
    series: req.body.series,
    groups: req.body.groups,
  });
  console.log(newWidget);
  Widget.create(newWidget, function(err, widget) {
    if(err) { return handleError(res, err); }
    return res.json(201, widget);
  });
};

// Updates an existing widget in the DB.
exports.update = function(req, res) {
  var myId = req.body._id;
  delete req.body._id;
  Widget.findByIdAndUpdate(myId, req.body, function (err, widget) {
    if (err) { return handleError(res, err); }
    if(!widget) { return res.send(404); }
    return res.json(200, widget);
  });
  /*
  if(req.body._id) { delete req.body._id; }
  Widget.findById(req.params.id, function (err, widget) {
    if (err) { return handleError(res, err); }
    if(!widget) { return res.send(404); }
    var updated = _.merge(widget, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, widget);
    });
  });
*/
};

// Deletes a widget from the DB.
exports.destroy = function(req, res) {
  Widget.findById(req.params.id, function (err, widget) {
    if(err) { return handleError(res, err); }
    if(!widget) { return res.send(404); }
    widget.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}