var express = require('express');
var router = express.Router();
var LocalStorage = require('node-localstorage').LocalStorage,
localStorage = new LocalStorage('./scratch');

router.get('/', function(req, res, next) {
  res.render('settings', {
    title: "Todd's Twitter App",
    maxTweets: localStorage.getItem('maxTweets'),
    userName1: localStorage.getItem('userAccountNameA'),
    userName2: localStorage.getItem('userAccountNameB'),
    userName3: localStorage.getItem('userAccountNameC')
  });
});

module.exports = router;
