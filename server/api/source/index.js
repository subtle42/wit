'use strict';

var express = require('express');
var controller = require('./source.controller');
var auth = require('../../auth/auth.service');
var multer = require('multer');

var router = express.Router();

router.get('/data/:id', auth.isAuthenticated(), controller.getDataAll);
router.get('/byuser', auth.isAuthenticated(), controller.byUser);
router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', [multer({dest: './uploads/'})], controller.create);
router.put('/', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;