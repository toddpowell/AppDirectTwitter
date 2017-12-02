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
    count: 30, 
    tweet_mode: "extended"      // Use this to avoid truncation
};

var tweetArray = [];
function gotData(error, data, response) {
  if (!error) {
    tweetArray = [];
      //console.log(data);
    console.log("# of tweets: " + data.length);
      
    for (tweet of data) {
        console.log('----------------------');
        console.log("- id_str = " + tweet.id_str);
        console.log("- created = " + tweet.created_at);
        console.log("- full_text = " + tweet.full_text);  // Need to parse for links
        //console.log("- entities.hashtags: " + tweet.entities.hashtags);
        // console.log("- location = " + tweet.user.location);
        console.log("- user.description = " + tweet.user.description);
        console.log("- retweeted_status = " + tweet.retweeted_status);
        if (tweet.retweeted_status) {
            console.log("RETWEETED id_str =  " + tweet.retweeted_status.id_str);
            console.log("RETWEETED full_text =  " + tweet.retweeted_status.full_text);
        }
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
    title: "AppDirect Twitter",
    tweets: tweetArray
  });
});

module.exports = router;