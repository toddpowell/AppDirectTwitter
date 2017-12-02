var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');

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
    count: 3, 
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

        // Retweets
        console.log("- retweeted_status = " + tweet.retweeted_status);
        if (tweet.retweeted_status) {
          // true
          //console.log("RETWEETED id_str =  " + tweet.retweeted_status.id_str);
          //console.log("RETWEETED full_text =  " + tweet.retweeted_status.full_text);
        } else {
          //false
        }

        console.log("- id_str = " + tweet.id_str);
        console.log("- name = " + tweet.user.name);
        //console.log("- user.description = " + tweet.user.description);        
        console.log("- created = " + tweet.created_at);
        console.log("- full_text = " + tweet.full_text);  // Need to parse for links
        
        // Summary card
        var summaryData;
        if (tweet.entities.urls[0]) {
          console.log("- summary card url = " + tweet.entities.urls[0].url);
          // @@@ Insert screen sraping here
          addSummaryData(tweet.entities.urls[0].url, tweet.full_text);
        } else {      
          tweetArray.push(tweet.full_text);
        }
    }
  } 
}

function addSummaryData(url, fullText){
  request(url, function (err, resp, body) {
    if (err) {
      return console.log("Error!: " + err + " using " + url);
    }
    var $ = cheerio.load(body);
    tweetArray.push(fullText);
    // do stuff with the `$` content here
    $title = $('meta[name="twitter:title"]').attr('content');
    console.log("!!! Got Summary !!!");
    console.log(">>> title : " + $title);
    tweetArray.push("::: Summary Title: " + $title);
    console.log("--- pushed");
  });
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