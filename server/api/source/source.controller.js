/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /Sources              ->  index
 * POST    /Sources              ->  create
 * GET     /Sources/:id          ->  show
 * PUT     /Sources/:id          ->  update
 * DELETE  /Sources/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');
var csvParse = require('csv-parse');
var auth = require('../../auth/auth.service');

var Source = require('./source.model');

// Get list of Sources by user
exports.byUser = function (req, res) {
  Source.find({createdBy: req.user._id}, function (err, sources) {
    if(err) { return handleError(res, err);}
    return res.json(sources);
  });
};

// Get all data for specific source
exports.getDataAll = function (req, res) {
  Source.findById(req.params.id, function (err, source) {
    if(err) { return handleError(res, err); }
    MongoClient.connect('mongodb://127.0.0.1:27017/mean-data', function (err, db) {
      if (err) {
        db.close();
        return handleError(res, err);
      }
      var myCollect = db.collection(source.location);
      myCollect.find({}).toArray(function (err, records) {
        db.close();
        if (err) { return handleError(res, err); }
        return res.json(records);
      });
    });
  });

  
};

// Get list of Sources
exports.index = function(req, res) {
  Source.find(function (err, sources) {
    if(err) { return handleError(res, err); }
    return res.json(200, sources);
  });
};

// Get a single Source
exports.show = function(req, res) {
  Source.findById(req.params.id, function (err, source) {
    if(err) { return handleError(res, err); }
    if(!Source) { return res.send(404); }
    return res.json(source);
  });
};

// Creates a new Source in the DB.
exports.create = function(req, res) {
  var myFile = req.files.file;
  MongoClient.connect('mongodb://127.0.0.1:27017/mean-data', function (err, db) {
    if (err) { handleError(res, err); }

    var location = 'data_' + Date.now();
    var myCollection = db.collection(location);
    //var batch = myCollection.initializeUnorderedBulkOp();
    var headers = [];
    var count = 0;
    var record;

    var parser = csvParse({delimiter: ',',
      skip_empty_lines: true,
      trim: true,
      auto_parse: true
    });
    // Writable stream api
    parser.on('readable', function () {
      while (record = parser.read()) {
        var newRecord = {};
        record.forEach(function (e, i) {
          newRecord[i] = e;
        });
        if (count !== 0) {
          myCollection.insert(newRecord, function (err, doc) {
            if (err) { console.log(err); }
          });
        } else {
          headers = newRecord;
        }
        count++;
      }
    }).on('error', function (err) {
      console.log(err);
    }).on('finish', function () {
      fs.unlink(myFile.path, function (err) {
        if (err) { console.log(err); }
        console.log('tmp file deleted');
      });
      db.close();
      createNewSource(myFile, location, headers, count-2, req.body.data, function (source) {
        return res.json(source);
      });
    });

    fs.createReadStream(myFile.path).pipe(parser);
  });
};

// Updates an existing Source in the DB.
exports.update = function(req, res) {
  var myId = req.body._id;
  delete req.body._id;
  Source.findByIdAndUpdate(myId, req.body, function (err, source) {
    if (err) { return handleError(res, err); }
    if(!source) { return res.send(404); }
    return res.json(source);
  });
};

// Deletes a Source from the DB.
exports.destroy = function(req, res) {
  Source.findById(req.params.id, function (err, source) {
    if(err) { return handleError(res, err); }
    if(!source) { return res.send(404); }
    Source.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err, db) {
  if (db) { db.close(); }
  return res.send(500, err);
};

function createNewSource(myFile, location, headers, count, userId, callback) {
  var columnList = [];
  investigateColumns(location, headers, function (myColumns) {
    var mySource = new Source({
      name: myFile.originalname,
      updated: Date.now(),
      count: count,
      size: 0,
      location: location,
      type: 1,
      createdBy: userId,
      columns: myColumns
    });

    MongoClient.connect('mongodb://127.0.0.1:27017/mean-data', function (err, db) {
      mySource.columns.forEach(function (col) {
        getColumnEnumValues(col, db, location, mySource.columns.length-1, function () {
          Source.create(mySource, function (err, source) {
            if (err) { return handleError(res, err); }
            if (callback) { callback(source); }
          });
        })
      });
    });    

    
  });
};

function investigateColumns (location, headers, callback) {
  MongoClient.connect('mongodb://127.0.0.1:27017/mean-data', function (err, db) {
    if (err) { handleError(res, err); }
    db.collection(location).find({}).limit(100).toArray(function (err, docs) {
      sortByColumn(docs, headers, function (columns) {
        callback(columns);
      });
    });
  });
};

function sortByColumn (docs, headers, callback) {
  var columns = [];
  var response = [];

  for (var key in docs[0]) {
    columns.push([]);
  }

  docs.forEach(function (col, i) {
    var j = 0;
    for (var key in col) {
      columns[j].push(col[key]);
      j++;
    }
  });

  columns.forEach(function (col, i) {
    findColumnBaseType(col, i, function (baseType) {
      response.push({
        ref: i,
        name: headers[i],
        type: baseType
      });
      if (response.length === columns.length) {
        callback(response);
      }
    });
  });
};

function findColumnBaseType (column, columnName, callback) {
  var type = {
    group: 0,
    number: 0,
    date: 0,
    text: 0
  };
  var groupList = [];
  var response = null;

  column.forEach(function (entry) {
    if (typeof entry === 'number') {
      type.number++;
    //} else if (new Date(entry) !== 'Invalid Date') {
    //  type.date++;
    } else if (entry.length > 100) {
      type.text++;
    } else if (groupList.indexOf(entry) !== -1) {
      type.group++;
    }
    groupList.push(entry);
  });

  if (type.number > column.length*.9) {
    response = 'number';
  } else if (type.date > column.length*.8) {
    response = 'date';
  } else if (type.group > column.length*.5) {
    response = 'group';
  } else {
    response = 'text';
  }
  callback(response);

};

//TODO: the column values found are not returned
function getColumnEnumValues (column, db, location, columnCount, callback) {
  if (column.type === 'group') {  
    db.collection(location).distinct(String(column.ref), function (err, docs) {
      column.enum = docs;
      if (column.ref === columnCount) {
        callback();
      }
    });
  } else {
    if (column.ref === columnCount) {
      callback();
    }
  }
};