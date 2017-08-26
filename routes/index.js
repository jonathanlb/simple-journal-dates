// Copyright (c) 2017 Jonathan Bredin
// MIT license http://opensource.org/licenses/MIT
// 
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
