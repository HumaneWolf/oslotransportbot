module.exports = app => {
    setInterval(() => {
        app.db.execute(
            'SELECT * FROM chats WHERE tbane_updates=1',
            [],
            (error, results) => {
                if (error) return app.error.error('Failed to load from database (sendtelegram/select/chats): ' + error);

                let chats = results;

                app.db.execute(
                    'SELECT * FROM tweets WHERE notified_datetime IS NULL',
                    [],
                    (error, results) => {
                        if (error)
                            return app.error.error('Failed to load from database (sendtelegram/select/tweets): ' + error);

                        results.forEach(async tweet => {
                            let referral = 'twitter/tbanen';
                            await chats.forEach(chat => {
                                app.telegram.telegram.sendMessage(
                                    chat.chat_id,
                                    '*#TBANEN OPPDATERING:*\n' +
                                    '\t ' + tweet.tweet_text + '\n' +
                                    '_Fra: ' + referral + '_',
                                    {
                                        'parse_mode': 'Markdown'
                                    }
                                ).catch((e) => {
                                    app.error.warn('Error notifying chat ' + chat.chat_id + ' because: ' + e);
                                });
                            });
                            app.db.execute(
                                'UPDATE tweets SET notified_datetime=CURRENT_TIMESTAMP WHERE tweet_id=?',
                                [ tweet.tweet_id ],
                                (error) => {
                                    if (error)
                                        return app.error.error('Failed to save to database (sendetelegram/update):' . error);
                                }
                            );
                        });
                    }
                );
            }
        );
    }, 60000);
};