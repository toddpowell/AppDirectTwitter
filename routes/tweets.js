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
    screen_name: "",          // localStorage = userAccountNameA, userAccountNameB, userAccountNameC     
    count: 0,                 // localStorage = maxTweets
    tweet_mode: "extended"    // Use "extended" to avoid truncation. Can add to settings later
};
let userAccountNameA = "";      // localStorage = userAccountNameA
let userAccountNameB = "";      // localStorage = userAccountNameB
let userAccountNameC = "";      // localStorage = userAccountNameC

let userAccountTweetsA = [];
let userAccountTweetsB = [];
let userAccountTweetsC = [];

let getUserAccountTweetsA = async function(callback){
  userAccountTweetsA = [];
  params.screen_name = userAccountNameA;
  client.get('statuses/user_timeline', params, gotData );
  callback(null, userAccountTweetsA);
}
let getUserAccountTweetsB = async function(callback){
  userAccountTweetsB = [];
  params.screen_name = userAccountNameB;
  client.get('statuses/user_timeline', params, gotData );
  callback(null, userAccountTweetsB);
}
let getUserAccountTweetsC = async function(callback){
  userAccountTweetsC = [];
  params.screen_name = userAccountNameC;
  client.get('statuses/user_timeline', params, gotData );
  callback(null, userAccountTweetsC);
}

function gotData(error, data, response) {
  if (!error) {
    for (tweet of data) {              
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

        // Retweets
        let retweeted = false;
        let userName = null;
        let screenName = null; 
        let profileImageUrl = null;        
        if (tweet.retweeted_status) {
          retweeted         = true;
          userName          = tweet.retweeted_status.user.name;
          screenName        = tweet.retweeted_status.user.screen_name;
          profileImageUrl   = tweet.retweeted_status.user.profile_image_url;
        } else {
          retweeted       = false;
          userName        = tweet.user.name;
          screenName      = tweet.user.screen_name;
          profileImageUrl = tweet.user.profile_image_url; 
        }

        let tweetObj = {
          id:                 tweet.id_str,
          retweeted:          retweeted,
          userName:           userName, //tweet.user.name,
          screenName:         screenName, //tweet.user.screen_name,
          authorName:         tweet.user.name,
          createdAt:          formattedDate,   
          tweetText:          linkedText,
          profileImageUrl:    profileImageUrl,  //tweet.user.profile_image_url,
          summaryUrl:         summaryUrl,   // same as summary-site?
          summaryCard:        null,         // what's this for?
          summarySite:        null,
          summaryTitle:       null,
          summaryDescription: null          // same as full-text?
        }

        // Summary card
        var summaryData;
        if ((summaryUrl)&&(!retweeted)) {   // Craps out when summarizing retweets - unable to verify the first certificate
          // Scrape site for Twitter meta data - This is what Twitter does to build their summary cards
          addSummaryData(tweet.entities.urls[0].url, tweetObj);
        } else {
          // Account for mixed case matching
          let tScreenName = tweet.user.screen_name;
          let uScreenNameA = userAccountNameA;
          let uScreenNameB = userAccountNameB;
          let uScreenNameC = userAccountNameC;
          if (tScreenName.toLowerCase() == uScreenNameA.toLowerCase()) {  
            userAccountTweetsA.push(tweetObj);
          } else if (tScreenName.toLowerCase() == uScreenNameB.toLowerCase()) {  
            userAccountTweetsB.push(tweetObj);
          } else if (tScreenName.toLowerCase() == uScreenNameC.toLowerCase()) {  
            userAccountTweetsC.push(tweetObj);
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

    // Parse data
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
    let uScreenNameA = userAccountNameA;
    let uScreenNameB = userAccountNameB;
    let uScreenNameC = userAccountNameC;    
    if (tObjScreenName.toLowerCase() == uScreenNameA.toLowerCase()) {
      userAccountTweetsA.push(twitterObj);    
    } else if (tObjScreenName.toLowerCase() == uScreenNameB.toLowerCase()) {
      userAccountTweetsB.push(twitterObj);    
    } else if (tObjScreenName.toLowerCase() == uScreenNameC.toLowerCase()) {
      userAccountTweetsC.push(twitterObj);    
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
  userAccountNameA  = localStorage.getItem('userAccountNameA') || "appdirect";
  userAccountNameB  = localStorage.getItem('userAccountNameB') || "laughingsquid";
  userAccountNameC  = localStorage.getItem('userAccountNameC') || "techcrunch";
  
  let functionStack = [];
  functionStack.push(getUserAccountTweetsA);
  functionStack.push(getUserAccountTweetsB);
  functionStack.push(getUserAccountTweetsC);

  async.parallel(functionStack, function(err, result){
    setTimeout(function(){
      // Sort tweets by date
      userAccountTweetsA.sort(function(a,b){
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      userAccountTweetsB.sort(function(a,b){
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      userAccountTweetsC.sort(function(a,b){
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      res.render('tweets', {
        title: "Todd Powell's Twitter App",
        userAccountTweetsA:   userAccountTweetsA,
        userAccountTweetsB:   userAccountTweetsB,
        userAccountTweetsC:   userAccountTweetsC
      });
    }, 5000); // Timer to make sure everything loads, even after using async/await. Sorry for the hack. I'm sure there's a better solution.
  });
});

module.exports = router;