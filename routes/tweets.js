var express = require('express');
var router = express.Router();

///////////////////
// Twitter stuff //
///////////////////
var Twitter = require('twitter');

var client = new Twitter({
    consumer_key: 'CXXTTkKuxKbrr8ncGnrTGhzVs',
    consumer_secret: '7T06Wc8Ttl2zufiYFF9icDX51De5QQzdHKPMijfjJxhgOegifr',
    access_token_key: '935315246016708608-h35nv8ckMjPy5ZYbLf2W4vCTUVQSaY1',
    access_token_secret: 'e92KsqJYtHR6BbgxfQ1CqDkVaXF5OGW953o7duQlLT2Oq'
  });
  
var params = {
    screen_name: 'appdirect', 
    count: 10, 
    tweet_mode: "extended"      // Use this to avoid truncation
};

var tweetArray = [];
function gotData(error, data, response) {
  if (!error) {
      //console.log(data);
    console.log("# of tweets: " + data.length);
      
    for (tweet of data) {
        // console.log('----------------------');
        // console.log("TWEET: id_str = " + tweet.id_str);
        // console.log("TWEET: full_text = " + tweet.full_text);
        // console.log("TWEET: " + tweet.user.location);
        // console.log("TWEET: " + tweet.user.description);
        // console.log("TWEET: retweeted_status = " + tweet.retweeted_status);
        // if (tweet.retweeted_status) {
        //     console.log("RETWEETED: " + tweet.retweeted_status.id_str);
        //     console.log("RETWEETED: " + tweet.retweeted_status.full_text);
        // }
        tweetArray.push(tweet.full_text);
    }
  } 
}



//////////////////
// Router stuff //
//////////////////
router.get('/', function(req, res, next) {
  client.get('statuses/user_timeline', params, gotData );

  res.render('tweets', {
    title: "xAppDirect Twitter",
    tweets: tweetArray[0]
  });
});

module.exports = router;