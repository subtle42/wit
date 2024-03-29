'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PageSchema = new Schema({
  name: { type: String, default: 'Default'},
  collectionId: { type: String, requried: true },
  widgetList: { type: Array, default: [[],[]] },
  columnCount: { type: Number, default: 2 },
  active: { type: Boolean, default: true},
  sourceLinks: { type: Array, default: []}
});

module.exports = mongoose.model('Page', PageSchema);