'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CollectionSchema = new Schema({
  name: { type: String, default: 'Default' },
  pageList: { type: Array, default: [] },
  userId: { type: String, required: true },
  active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Collection', CollectionSchema);