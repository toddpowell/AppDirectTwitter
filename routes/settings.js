var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('settings', {
    title: "AppDirect Settings"
  });
});

module.exports = router;
