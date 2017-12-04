var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('settings', {
    title: "Todd's Twitter App"
  });
});

router.post('/settings', function(req, res) {
  //res.send("Settings updated");
});

module.exports = router;
