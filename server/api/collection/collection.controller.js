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

// Get all collections for current user
exports.allByUser = function (req, res) {
  var userId = req.user._id;

  Collect.find({ userId: userId}, function (err, collects) {
    if(err) { return handleError(res, err); }
    if(!collects) { return res.send(404); }

    // If user has no collections create a record
    if(collects.length === 0) {
      var newCollect = new Collect({
        userId: userId
      });
      Collect.create(newCollect, function (err, collect) {
        if(err) { return handleError(res, err); }
        if(!collect) { return res.send(404); }
        console.log('created new collection');
        return res.json([collect]);
      });
    } else {
      return res.json(collects);
    }
  });
};

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
  Collect.findByIdAndUpdate(req.body._id, req.body, function (err, collect) {
    if (err) { return handleError(res, err); }
    if (!collect) { return res.send(404); }
    return res.json(collect);
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