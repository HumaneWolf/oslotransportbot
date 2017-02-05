//
// Twitter handling module
//

require('log-timestamp');

module.exports =
{
	init: function(key, secret, token)
	{
		const Twitter = require('twitter');

		this.t = new Twitter(
		{
			consumer_key: key,
			consumer_secret: secret,
			bearer_token: token
		}
		);
	},

	updateDB: function(db)
	{
		var twitterUsers = [ 44597892 ]; //Users tweeting relevant updates.
		// [0] Tbanen

		//Get last loaded tweet.
		var loadLast = function(callback, id, t)
		{
			var lastTweet;
			db.execute('SELECT tweet_id FROM tweets WHERE tweet_author=? ORDER BY tweet_id DESC LIMIT 1',
				[ id ],
				function (err, results, fields)
				{
					if (results.length === 1)
					{
						lastTweet = results[0].tweet_id;
						console.log("INFO: Last tweet for " + id + ": " + results[0].tweet_id);
					}
					else
					{
						lastTweet = 827106541224489000; //One of the latest tweets at the time I program this.
					}
					callback(id, lastTweet, t);
				}
				);
		}

		var loadNew = function(id, lt, t)
		{
			//Get new tweets
			t.get(
				'statuses/user_timeline',
				{
					since_id: lt,
					user_id: id, // Load the info for that user.
					trim_user: true, //Load less user info.
					exclude_replies: true, //Don't load any replies.
					include_rts: false //Don't load retweets
				},
				function(error, tweets, response)
				{
					if (error)
					{
						console.log("WARN: Failed to load tweets.");
					}
					else
					{
						for (var j = 0; j < tweets.length; j++)
						{
							db.execute('INSERT INTO tweets (tweet_id, tweet_author, tweet_text) VALUES (?, ?, ?)',
								[ tweets[j].id_str, tweets[j].user.id, tweets[j].text ],
								function (err, results, fields)
								{
									if (err)
									{
										console.log("WARN: Failed to save a tweet.");
										console.log(tweets[j]);
									}
									else
									{
										console.log("INFO: Tweet saved.");
									}
								}
								);
						}
						console.log("INFO: Done loading tweets from " + id );
					}
				}
				);
		}

		for (var i = 0; i < twitterUsers.length; i++)
		{
			loadLast(loadNew, twitterUsers[i], this.t);
		}
	}
}