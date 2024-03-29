'use strict';

var express = require('express');
var controller = require('./widget.controller');

var router = express.Router();

router.get('/bypage/:id', controller.byPage);
router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;