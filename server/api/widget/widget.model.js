'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var WidgetSchema = new Schema({
  name: String,
  type: String,
  sourceId: String,
  pageId: String,
  series: [{
    forumla: { type: String, default: 'sum' },
    ref: Number
  }],
  groups: [{
    ref: Number
  }],
  margins: { type: Object, default: {top: 10, bottom: 20, left: 40, right: 10} },
  collapse: { type: Boolean, default: false },
  height: { type: Number, default: 350 }
});

module.exports = mongoose.model('Widget', WidgetSchema);