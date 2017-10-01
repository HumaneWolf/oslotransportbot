const axios = require('axios');
const req = axios.create({ baseURL: 'https://reisapi.ruter.no' });

module.exports = async app => {
    app.telegram.command('/admin', async msg => {
        //let chat = await msg.getChat();
        let user = msg.from;
        if (!app.config.ownerIDs.includes(user.id)) return;

        let args = (msg.update.message.text).split(' ');

        //Actions related to metro stops.
        if (args[1] === 'stops') {
            //Delete all stops.
            if (args[2] === 'clear') {
                app.db.execute(
                    'DELETE FROM stops',
                    [],
                    (error) => {
                        if (error) {
                            app.error.error('Failed to load from database (admin/stops/clear): ' + error);
                            msg.reply('ERROR: Failed to load from database.');
                            return;
                        }

                        app.error.log('Stop list emptied.');
                        msg.reply('Stopplisten er tømt.');
                    }
                );
                return;
            }

            //Load stops again from ruter api.
            if (args[2] === 'load') {
                let counterMessage = await msg.reply('0 stopp lagret.');
                console.log(counterMessage);
                app.config.metroLines.forEach(async line => {
                    let stops = await req.get('/Place/GetStopsByLineID/' + line);
                    await stops.data.forEach(stop => {
                        app.db.execute(
                            'INSERT IGNORE INTO stops (stop_id, stop_name, stop_shortname) ' +
                            'VALUES (?, ?, ?)',
                            [ stop.ID, stop.Name, stop.ShortName ],
                            (error) => {
                                if (error) {
                                    app.error.error('Failed to save to database (admin/stops/load): ' + error);
                                }
                            }
                        );
                    });
                    app.db.execute(
                        'SELECT count(*) as c FROM stops',
                        [],
                        async (error, results) => {
                            if (error) {
                                app.error.error('Failed to load from database (admin/stops/load/count): ' + error);
                            }
                            app.telegram.telegram.editMessageText(
                                counterMessage.chat.id,
                                counterMessage.message_id,
                                null,
                                results[0].c + ' stopp lagret.'
                            );
                        }
                    );
                });
                return;
            }

            msg.reply('Mulige argumenter: clear, load.');
            return;
        }

        //Actions related to chats.
        if (args[1] === 'chat') {

            return;
        }

        msg.reply('Mulige argumenter: stops, chat.');
    });
};