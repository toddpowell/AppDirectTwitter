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
    screen_name: '',          
    count: 0,                 // localStorage = maxTweets
    tweet_mode: "extended"    // Use this to avoid truncation
};

let appDirectTweets = [];
let laughingSquidTweets = [];
let techCrunchTweets = [];

let getAppDirect = async function(callback){
  appDirectTweets = [];
  params.screen_name = "appdirect";
  client.get('statuses/user_timeline', params, gotData );
  callback(null, appDirectTweets);
}
let getLaughingSquid = async function(callback){
  laughingSquidTweets = [];
  params.screen_name = "laughingsquid";
  client.get('statuses/user_timeline', params, gotData );
  callback(null, laughingSquidTweets);
}
let getTechCrunch = async function(callback){
  techCrunchTweets = [];
  params.screen_name = "techcrunch";
  client.get('statuses/user_timeline', params, gotData );
  callback(null, techCrunchTweets);
}

function gotData(error, data, response) {
  if (!error) {
    //console.log(data);
    console.log("# of tweets: " + data.length);

    for (tweet of data) {
        //console.log('----------------------');

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
        let fullText = tweet.full_text;
        let linkedText = linkify(fullText);

        let tweetObj = {
          id:                 tweet.id_str,
          retweeted:          retweeted,
          userName:           tweet.user.name,
          screenName:         tweet.user.screen_name,
          createdAt:          formattedDate,   
          fullText:           linkedText,
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
          if (tweet.user.screen_name == "AppDirect") {  
            appDirectTweets.push(tweetObj);
          } else if (tweet.user.screen_name == "LaughingSquid") {  
            laughingSquidTweets.push(tweetObj);
          } else if (tweet.user.screen_name == "TechCrunch") {  
            techCrunchTweets.push(tweetObj);
          }
        }
    }
    console.log("appDirectTweets: " + appDirectTweets.length);
    console.log("laughingSquidTweets: " + laughingSquidTweets.length);
    console.log("techCrunchTweets: " + techCrunchTweets.length);
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

    if (twitterObj.screenName == "AppDirect") {
      appDirectTweets.push(twitterObj);    
    } else if (twitterObj.screenName == "LaughingSquid") {
      laughingSquidTweets.push(twitterObj);    
    } else if (twitterObj.screenName == "TechCrunch") {
      techCrunchTweets.push(twitterObj);    
    }
  });
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
  params.count = localStorage.getItem('maxTweets') || 30;
  console.log("maxTweets: " + params.count);
   
  // localStorage.setItem('myFirstKey', 'myFirstValue');
  //console.log(localStorage.getItem('myFirstKey'));

  let functionStack = [];
  functionStack.push(getAppDirect);
  functionStack.push(getLaughingSquid);
  functionStack.push(getTechCrunch);

  async.parallel(functionStack, function(err, result){
    console.log(result);
    setTimeout(function(){
      // Sort tweets by date
      appDirectTweets.sort(function(a,b){
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      laughingSquidTweets.sort(function(a,b){
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      techCrunchTweets.sort(function(a,b){
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      res.render('tweets', {
        title: "AppDirect Twitter",
        appDirectTweets:      appDirectTweets,
        laughingSquidTweets:  laughingSquidTweets,
        techCrunchTweets:     techCrunchTweets
      });
      console.log("rendered page");
    }, 5000);
  });
});



module.exports = router;