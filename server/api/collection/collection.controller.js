/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /collects              ->  index
 * POST    /collects              ->  create
 * GET     /collects/:id          ->  show
 * PUT     /collects/:id          ->  update
 * DELETE  /collects/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Collect = require('./collection.model');

// Get list of collects
exports.index = function(req, res) {
  Collect.find(function (err, collects) {
    if(err) { return handleError(res, err); }
    return res.json(200, collects);
  });
};

// Get a single collect
exports.show = function(req, res) {
  Collect.findById(req.params.id, function (err, collect) {
    if(err) { return handleError(res, err); }
    if(!collect) { return res.send(404); }
    return res.json(collect);
  });
};

// Creates a new collect in the DB.
exports.create = function(req, res) {
  Collect.create(req.body, function(err, collect) {
    if(err) { return handleError(res, err); }
    return res.json(201, collect);
  });
};

// Updates an existing collect in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Collect.findById(req.params.id, function (err, collect) {
    if (err) { return handleError(res, err); }
    if(!collect) { return res.send(404); }
    var updated = _.merge(collect, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, collect);
    });
  });
};

// Deletes a collect from the DB.
exports.destroy = function(req, res) {
  Collect.findById(req.params.id, function (err, collect) {
    if(err) { return handleError(res, err); }
    if(!collect) { return res.send(404); }
    collect.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}