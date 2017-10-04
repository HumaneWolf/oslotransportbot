const probe = require('pmx').probe();

module.exports = app => {
    const chatCount = probe.metric({
        'name': 'Chat Count'
    });

    const msgSent = probe.metric({
        'name': 'Messages sent'
    });

    const msgWaiting = probe.metric({
        'name': 'Messages Waiting'
    });

    const metroStops = probe.metric({
        'name': 'Metro Stops Stored'
    });

    const updateAllMetrics = () => {
        //Chat Count
        app.db.execute(
            'SELECT count(*) AS c FROM chats',
            [],
            (error, results) => {
                if (error) {
                    chatCount.set(-1);
                    return app.error.error('Failed to load from database (metrics/chats): ' + error);
                }
                chatCount.set(results[0].c);
            }
        );

        //Msg sent
        app.db.execute(
            'SELECT count(*) AS c FROM tweets WHERE notified_datetime IS NOT NULL',
            [],
            (error, results) => {
                if (error) {
                    msgSent.set(-1);
                    return app.error.error('Failed to load from database (metrics/sent): ' + error);
                }
                msgSent.set(results[0].c);
            }
        );

        //Msg waiting
        app.db.execute(
            'SELECT count(*) AS c FROM tweets WHERE notified_datetime IS NULL',
            [],
            (error, results) => {
                if (error) {
                    msgWaiting.set(-1);
                    return app.error.error('Failed to load from database (metrics/waiting): ' + error);
                }
                msgWaiting.set(results[0].c);
            }
        );

        //Metro stops
        app.db.execute(
            'SELECT count(*) AS c FROM stops',
            [],
            (error, results) => {
                if (error) {
                    metroStops.set(-1);
                    return app.error.error('Failed to load from database (metrics/stops): ' + error);
                }
                metroStops.set(results[0].c);
            }
        );
    };

    //Run regularly and at bot startup.
    setInterval(updateAllMetrics, 5000);
    updateAllMetrics();
};