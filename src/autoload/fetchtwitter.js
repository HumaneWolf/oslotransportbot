module.exports = app => {
    setInterval(() => {
        app.config.twitterIDs.forEach(tw => {
            let lastTweet = '913781193992282112'; //One of the latest tweets as of writing this.
            app.db.execute(
                'SELECT tweet_id FROM tweets WHERE tweet_author=? ORDER BY tweet_id DESC LIMIT 1',
                [ tw ],
                (error, results) => {
                    if (error) return app.error.error('Failed to load from database (fetchtwitter/select): ' + error);

                    if (results.length === 1) {
                        lastTweet = results[0].tweet_id;
                    }

                    app.twitter.get(
                        'statuses/user_timeline',
                        {
                            'since_id': lastTweet,
                            'user_id': tw, //user id.
                            'trim_user': true, //Strip away extra user info.
                            'exclude_replies': true, //Don't include replies the user makes to others.
                            'include_rts': false //Don't include retweets.
                        },
                        (error, tweets) => {
                            if (error) return app.error.warn('Failed to reach or read twitter: ' + error);

                            tweets.forEach(tweet => {
                                app.db.execute(
                                    'INSERT INTO tweets (tweet_id, tweet_author, tweet_text) VALUES (?, ?, ?)',
                                    [ tweet.id_str, tweet.user.id, tweet.text ],
                                    (error) => {
                                        if (error)
                                            return app.error.error('Failed to save to database (fetchtwitter/insert): ' + error);
                                    }
                                );
                            });
                        }
                    );
                }
            );
        });
    }, 60000);
};