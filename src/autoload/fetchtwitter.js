const log = require('fancy-log');

module.exports = app => {
    setInterval(() => {
        app.config.twitterIDs.forEach(async twUser => {
            let lastTweet = await app.redis.getAsync(`lasttweet${twUser}`) || '965801644846874625';

            app.twitter.get(
                'statuses/user_timeline',
                {
                    'since_id': lastTweet,
                    'user_id': twUser, //user id.
                    'trim_user': true, //Strip away extra user info.
                    'exclude_replies': true, //Don't include replies the user makes to others.
                    'include_rts': false //Don't include retweets.
                },
                (error, tweets) => {
                    if (error) return log.error(error);

                    tweets.sort((a, b) => {
                        if (a.id_str < b.id_str) {
                            return -1;
                        }
                        if (a.id_str > b.id_str) {
                            return 1;
                        }
                        return 0;
                    });

                    tweets.forEach(tweet => {
                        if (lastTweet < tweet.id_str) {
                            lastTweet = tweet.id_str;
                            app.redis.setAsync(`lasttweet${twUser}`, tweet.id_str);
                        }

                        app.telegram.telegram.sendMessage(
                            app.config.telegram.channel,
                            `*#TBANEN OPPDATERING:*\n${tweet.text}`,
                            { parse_mode: 'Markdown' }
                        );
                    });
                }
            );
        });
    }, 30000);
};
