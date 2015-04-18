'use strict';

var express = require('express');
var controller = require('./collection.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/allbyuser', auth.isAuthenticated(), controller.allByUser);
router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;