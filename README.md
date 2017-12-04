# AppDirectTwitter
A simple web application using Twitter's REST API

When I was designing this app, I realized there were three different approaches I could've taken.
1) Use embedded Twitter timelines
2) Use the twttr.widget library
    - Use npm twitter to get a list of tweet IDs
    - use twttr.widget.create() to create the tweet cards
3) Build my own tweet cards

Option 1 would've been the easiest and quickest. However, this would not have demonstrated very much of my abilities with HTML, CSS, and JavaScript.

Option 2 would normally be a decent choice in a "real" project. The twttr.widget library creates very nice cards. However, this approach does not create the Twitter summary cards. It also would have been too easy for this assignment, and would not have demonstrated very much of my development abilities.

Option 3 was by far the most difficult and challenging approach. However, it allowed me to work more with JavaScript (parsing the TWitter data, handling objects, etc) and HTML/CSS (building cards).

Another advantage of Option 3 is that, since it is custom-built, it is easier to customize  than the out-of-the-box Twitter cards.

Future enhancements:
There are a few things I would change/update if I had more time:
- Refactor the tweets HTML into a partial so I don't repeat as much code, and it's easier to modify.
- Move the menu to layout.hbs to centralize that functionality.
- Add retweet and like counts
- Add pagination for the tweets
- Add a "Load Tweets" button or check for empty div so tweets don't load on every page load, such as when using navbar
- Add tweet mode to settings ("extended" prevents text truncation, but can create some long tweet cards.)

Known issues/bugs
- I used async/wait on my REST calls. This helped my app to wait for all tweets before sorting them. However, I'm still experiencing a synch issue, so I added delay to res.response in tweets.js. Otherwise, some of the tweets do not get returned. One workaround might be to add a "loading" page/message/modal.
- I am unable to get the images for the tweet summaries. I could not find their links in either the tweet data or the target page's meta data. My best guess is that Twitter is doing some magic behind the scenes that I cannot replicate.
- I can show the retweets. I indicate them with a "retweeted" label. However, when I try to change the tweet author to the *original* author, instead of the retweeter, the entire card gets dropped. Here's the code I was using, which looks like it should work:
        // Adjust for retweets
        var retweeted;
        let userName = null;
        let screenName = null; 
        let profileImageUrl = null;       
        if (tweet.retweeted_status) {
          retweeted        =  true;
          userName         =  tweet.retweeted_status.user.name;
          screenName       =  tweet.retweeted_status.user.screen_name;
          profileImageUrl  =  tweet.retweeted_status.user.profile_image_url;
        } else {
          retweeted        =  false;
          userName         =  tweet.user.name;
          screenName       =  tweet.user.screen_name;
          profileImageUrl  =  tweet.user.profile_image_url;
        }

        let tweetObj = {
          id:                 tweet.id_str,
          retweeted:          retweeted,
          userName:           userName,
          screenName:         screenName,
          createdAt:          formattedDate,   
          fullText:           linkedText,
          profileImageUrl:    profileImageUrl,
          summaryUrl:         summaryUrl,   // same as summary-site?
          summaryCard:        null,         // what's this for?
          summarySite:        null,
          summaryTitle:       null,
          summaryDescription: null          // same as full-text?
        }

