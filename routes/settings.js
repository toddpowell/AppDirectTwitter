var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('settings', {
    title: "Todd's Twitter App"
  });
});

module.exports = router;
