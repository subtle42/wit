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
  Widget.create(req.body, function(err, widget) {
    if(err) { return handleError(res, err); }
    return res.json(201, widget);
  });
};

// Updates an existing widget in the DB.
exports.update = function(req, res) {
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