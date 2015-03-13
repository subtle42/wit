'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PageSchema = new Schema({
  name: { type: String, default: 'Default'},
  collectionId: { type: String, requried: true },
  widgetList: { type: Array, default: [] },
  active: { type: Boolean, default: true}
});

module.exports = mongoose.model('Page', PageSchema);