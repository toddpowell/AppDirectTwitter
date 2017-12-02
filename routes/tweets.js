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
        
        var summaryUrl = tweet.entities.urls[0].url || null;

        var tweetObj = {
          id:                 tweet.id_str,
          userName:           tweet.user.name,
          createdAt:          tweet.created_at,   
          fullText:           tweet.full_text,
          summaryUrl:         summaryUrl,   // same as summary-site?
          summaryCard:        null,         // what's this for?
          summarySite:        null,
          summaryTitle:       null,
          summaryDescription: null          // same as full-text?
        }

        // Summary card
        var summaryData;
        if (summaryUrl) {
          console.log("- summary card url = " + tweet.entities.urls[0].url);
          // Scrape site for Twitter meta data - This is what Twitter does to build their summary cards
          addSummaryData(tweet.entities.urls[0].url, tweetObj);
        } else {      
          tweetArray.push(tweetObj);
        }
    }
  } 
}

function addSummaryData(url, twitterObj){
  request(url, function (err, resp, body) {
    if (err) {
      return console.log("Error!: " + err + " using " + url);
    }
    var $ = cheerio.load(body);

    // do stuff with the `$` content here
    $card = $('meta[name="twitter:card"]').attr('content'),
    $site = $('meta[name="twitter:site"]').attr('content'),
    $title = $('meta[name="twitter:title"]').attr('content'),
    $description = $('meta[name="twitter:description"]').attr('content'),
    console.log("!!! Got Summary !!!");
    console.log(">>> title : " + $title);

    // Add summary card data to tweet objecte
    twitterObj.summaryCard = $card;
    twitterObj.summarySite = $site;
    twitterObj.summaryTitle = $title;
    twitterObj.summaryDescription = $description;

    tweetArray.push(twitterObj);    
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