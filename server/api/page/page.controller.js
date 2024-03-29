/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /pages              ->  index
 * POST    /pages              ->  create
 * GET     /pages/:id          ->  show
 * PUT     /pages/:id          ->  update
 * DELETE  /pages/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Page = require('./page.model');
var Collect = require('../collection/collection.model');

exports.getByCollection = function (req, res) {
  // Get collection
  Collect.findById(req.params.id, function (err, collect) {
    if (err || !collect) { return handleError(res, err); }
    if (collect.pageList.length === 0) { return res.json([]); }
    // get all pages in a collection
    Page.find({collectionId: req.params.id}, function (err, pages) {
      if(err) { return handleError(res, err); }
      // ordering pages
        var myResp = [];
        collect.pageList.forEach(function (orderId) {
          pages.forEach(function (searchPage, i) {
            if (searchPage._id == orderId) {
              myResp.push(searchPage);
              pages.splice(i, 1);
            }
          });
        });
        return res.json(myResp);
    });

  });
};

exports.getByPageList = function (req, res) {
  // Get list of all pages in a collection
  Collect.findById(req.params.id, function (err, myCollect) {
    if(err) { return handleError(res, err); }
    // Search for each page found in list
    Page.find({_id: {$in: myCollect.pageList}}, function (err, pages) {
      if(err) { return handleError(res, err); }
      return res.json(pages);
    });
  });
  Page.find({collectionId: req.params.id}, function (err, pages) {
    if(err) { return handleError(res, err); }
    if(pages.length === 0) {
      var newPage = new Page({
        collectionId: req.params.id
      });
      Page.create(newPage, function (err, page) {
        if(err) { return handleError(res, err); }
        return res.json([page]);
      });
    } else {
      return res.json(pages);
    }
  });
};

exports.tabSelect = function (req, res) {
  Page.update({collectionId: req.body.collectionId}, {active: false}, {multi: true}, function (err, pages) {
    if(err) { return handleError(res, err); }
    Page.findById(req.body._id, function (err, page) {
      if(err) { return handleError(res, err); }
      page.active = true;
      page.save(function (err, savedPage) {
        if(err) { return handleError(res, err); }
        res.json(savedPage);
      });
    })
  });
};

// Get list of pages
exports.index = function(req, res) {
  Page.find(function (err, pages) {
    if(err) { return handleError(res, err); }
    return res.json(200, pages);
  });
};

// Get a single page
exports.show = function(req, res) {
  Page.findById(req.params.id, function (err, page) {
    if(err) { return handleError(res, err); }
    if(!page) { return res.send(404); }
    return res.json(page);
  });
};

// Creates a new page in the DB.
// All new pages become the new ACTIVE page
exports.create = function(req, res) {
  var newPage = new Page({
    name: req.body.name,
    collectionId: req.body.collectionId
  });

  // Need to first get all other pages and set them to NOT active
  Page.find({collectionId: req.body.collectionId}, function (err, pages) {
    pages.forEach(function (_page) {
      _page.active = false;
      _page.save();
    });
    Page.create(newPage, function (err, page) {
      if(err) { return handleError(res, err); }
      return res.json(201, page);
    });
  });
};

// Updates an existing page in the DB.
exports.update = function(req, res) {
  var myId = req.body._id;
  delete req.body._id;
  Page.findByIdAndUpdate(myId, req.body, function (err, page) {
    if(err) { return handleError(res, err); }
    if(!page) { return res.send(404); }
    return res.json(page);
  });
};

// Deletes a page from the DB.
exports.destroy = function(req, res) {
  Page.findById(req.params.id, function (err, page) {
    if(err) { return handleError(res, err); }
    if(!page) { return res.send(404); }
    page.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}