var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('usermessage', {
    title: "Todd's Twitter App",
    message: "Settings updated"
  });
});

module.exports = router;