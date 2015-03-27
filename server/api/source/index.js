'use strict';

var express = require('express');
var controller = require('./source.controller');
var auth = require('../../auth/auth.service');
var multer = require('multer');

var router = express.Router();

router.get('/byuser', auth.isAuthenticated(), controller.byUser);
router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', [multer({dest: './uploads/'})], controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;