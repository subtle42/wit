'use strict';

var express = require('express');
var controller = require('./page.controller');

var router = express.Router();

router.get('/bycollection/:id', controller.getByCollection)
router.put('/tabselect', controller.tabSelect);
router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;