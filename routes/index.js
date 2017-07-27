var express = require('express');

var router = express.Router();
var path = require('path');

var data = require('../public/json/routes.json');

router.get('/', (req, res, next) => {
    res.render('index', req.localization);
});

router.get('/get-json', function (req, res) {
   res.send(data);
});
module.exports = router;
