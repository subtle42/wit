'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SourceSchema = new Schema({
	name: String,
	updated: { type: Date, default: Date.now },
	count: { type: Number, default: 0 },
	location: { type: String, default: '' },
	type: { type: Number: default: 0 },
	columns: [{
		ref: Number,
		name: String,
		type: String
	}]
});

module.exports = mongoose.model('Source', SourceSchema);