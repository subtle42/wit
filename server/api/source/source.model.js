'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SourceSchema = new Schema({
	name: String,
	updated: { type: Date, default: Date.now },
	count: { type: Number, default: 0 },
	size: { type: Number, require: true },
	location: { type: String, default: '' },
	type: { type: Number, default: 0 },
	createdBy: { type: String, require: true },
	columns: { type: Array, default: [] }
});

module.exports = mongoose.model('Source', SourceSchema);