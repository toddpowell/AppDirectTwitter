let express = require('express');
let router = express.Router();
let request = require('request');
let async = require('async');
let cheerio = require('cheerio');
var LocalStorage = require('node-localstorage').LocalStorage,
localStorage = new LocalStorage('./scratch');

///////////////////
// Twitter stuff //
///////////////////
let Twitter = require('twitter');

let client = new Twitter({
    consumer_key: 'CXXTTkKuxKbrr8ncGnrTGhzVs',
    consumer_secret: '7T06Wc8Ttl2zufiYFF9icDX51De5QQzdHKPMijfjJxhgOegifr',
    access_token_key: '935315246016708608-h35nv8ckMjPy5ZYbLf2W4vCTUVQSaY1',
    access_token_secret: 'e92KsqJYtHR6BbgxfQ1CqDkVaXF5OGW953o7duQlLT2Oq'
  });

let params = {
    //since: 2017-11-30,
    screen_name: "",          // localStorage = userAccountAName, userAccountBName, userAccountCName     
    count: 0,                 // localStorage = maxTweets
    tweet_mode: "extended"    // Use "extended" to avoid truncation
};
let userAccountAName = "";      // localStorage = userAccountAName
let userAccountBName = "";      // localStorage = userAccountBName
let userAccountCName = "";      // localStorage = userAccountCName

let userAccountATweets = [];
let userAccountBTweets = [];
let userAccountCTweets = [];

let getUserAccountATweets = async function(callback){
  userAccountATweets = [];
  params.screen_name = userAccountAName;
  client.get('statuses/user_timeline', params, gotData );
  callback(null, userAccountATweets);
}
let getUserAccountBTweets = async function(callback){
  userAccountBTweets = [];
  params.screen_name = userAccountBName;
  client.get('statuses/user_timeline', params, gotData );
  callback(null, userAccountBTweets);
}
let getUserAccountCTweets = async function(callback){
  userAccountCTweets = [];
  params.screen_name = userAccountCName;
  client.get('statuses/user_timeline', params, gotData );
  callback(null, userAccountCTweets);
}

function gotData(error, data, response) {
  if (!error) {
    for (tweet of data) {

        let retweeted = false;
        // Retweets
        if (tweet.retweeted_status) {
          retweeted = true;
        } 
              
        var summaryUrl = null;
        if (tweet.entities.urls[0]) {
          summaryUrl = tweet.entities.urls[0].url;
        }

        // Format date
        let created = tweet.created_at;
        let longDate = new Date(created);
        let formattedDate = longDate.toDateString();

        // Replace text links with anchor tags
        // replace(/(\w+\.\w+)/g, "<a href='$1' target='_blank'>$1</a>");
        let tweetText = tweet.text || tweet.full_text;
        let linkedText = linkify(tweetText);

        let tweetObj = {
          id:                 tweet.id_str,
          retweeted:          retweeted,
          userName:           tweet.user.name,
          screenName:         tweet.user.screen_name,
          createdAt:          formattedDate,   
          tweetText:           linkedText,
          profileImageUrl: tweet.user.profile_image_url,
          summaryUrl:         summaryUrl,   // same as summary-site?
          summaryCard:        null,         // what's this for?
          summarySite:        null,
          summaryTitle:       null,
          summaryDescription: null          // same as full-text?
        }

        // Summary card
        var summaryData;
        if (summaryUrl) {
          // Scrape site for Twitter meta data - This is what Twitter does to build their summary cards
          addSummaryData(tweet.entities.urls[0].url, tweetObj);
        } else {
          // Account for mixed case matching
          let tScreenName = tweet.user.screen_name;
          let uScreenNameA = userAccountAName;
          let uScreenNameB = userAccountBName;
          let uScreenNameC = userAccountCName;
          if (tScreenName.toLowerCase() == uScreenNameA.toLowerCase()) {  
            userAccountATweets.push(tweetObj);
          } else if (tScreenName.toLowerCase() == uScreenNameB.toLowerCase()) {  
            userAccountBTweets.push(tweetObj);
          } else if (tScreenName.toLowerCase() == uScreenNameC.toLowerCase()) {  
            userAccountCTweets.push(tweetObj);
          }
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

    // Add summary card data to tweet objecte
    twitterObj.summaryCard = $card;
    twitterObj.summarySite = $site;
    twitterObj.summaryTitle = $title;
    twitterObj.summaryDescription = $description;

    // Account for mixed case matching
    let tObjScreenName = twitterObj.screenName;
    let uScreenNameA = userAccountAName;
    let uScreenNameB = userAccountBName;
    let uScreenNameC = userAccountCName;    
    if (tObjScreenName.toLowerCase() == uScreenNameA.toLowerCase()) {
      userAccountATweets.push(twitterObj);    
    } else if (tObjScreenName.toLowerCase() == uScreenNameB.toLowerCase()) {
      userAccountBTweets.push(twitterObj);    
    } else if (tObjScreenName.toLowerCase() == uScreenNameC.toLowerCase()) {
      userAccountCTweets.push(twitterObj);    
    }
  });
  return;
}

// Replace plain text links with anchor tags
function linkify(plainText) {
  // http://, https://, ftp://
  var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;

  // www. sans http:// or https://
  var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

  // Email addresses
  var emailAddressPattern = /[\w.]+@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,6})+/gim;

  return plainText
      .replace(urlPattern, '<a href="$&" target="_blank">$&</a>')
      .replace(pseudoUrlPattern, '$1<a href="http://$2" target="_blank">$2</a>')
      .replace(emailAddressPattern, '<a href="mailto:$&" target="_blank">$&</a>');
};

//////////////////
// Router stuff //
//////////////////
router.get('/', async function(req, res, next) {
  // Create customizable settings variables with defaults
  params.count      = localStorage.getItem('maxTweets') || 30;
  params.tweet_mode = localStorage.getItem('tweetMode') || "extended";
  userAccountAName  = localStorage.getItem('userAccountAName') || "appdirect";
  userAccountBName  = localStorage.getItem('userAccountBName') || "laughingsquid";
  userAccountCName  = localStorage.getItem('userAccountCName') || "techcrunch";
  
  let functionStack = [];
  functionStack.push(getUserAccountATweets);
  functionStack.push(getUserAccountBTweets);
  functionStack.push(getUserAccountCTweets);

  async.parallel(functionStack, function(err, result){
    setTimeout(function(){
      // Sort tweets by date
      userAccountATweets.sort(function(a,b){
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      userAccountBTweets.sort(function(a,b){
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      userAccountCTweets.sort(function(a,b){
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      res.render('tweets', {
        title: "Todd's Twitter App",
        userAccountATweets:   userAccountATweets,
        userAccountBTweets:   userAccountBTweets,
        userAccountCTweets:   userAccountCTweets
      });
    }, 5000);
  });
});



module.exports = router;