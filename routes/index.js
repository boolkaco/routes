var express = require('express');

var router = express.Router();
var path = require('path');

var data = require('../json/routes.json');
var dataCities = require('../json/cities.json');

router.get('/', (req, res, next) => {
    res.render('index', req.localization);
});

router.get('/get-json', function (req, res) {
   res.send(data);
});

router.get('/get-cities-json', function (req, res) {
    res.send(dataCities);
})
module.exports = router;
