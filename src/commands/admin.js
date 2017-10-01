const axios = require('axios');
const req = axios.create({ baseURL: 'https://reisapi.ruter.no' });

module.exports = async app => {
    app.telegram.command('/admin', async msg => {
        let chat = await msg.getChat();
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

        //Actions related to chats (primarily to help manage it in public chat).
        if (args[1] === 'chat') {
            //Register this chat
            if (args[2] === 'start') {
                app.db.execute(
                    'SELECT count(*) as c FROM chats WHERE chat_id=?',
                    [ chat.id ],
                    (error, results) => {
                        if (error) {
                            app.error.error('Failed to load from database (admin/chat/start/select): ' + error);
                            msg.reply('ERROR: Failed to load from database.');
                            return;
                        }

                        if (results[0].c >= 1) {
                            msg.reply('Denne chatten er allerede registrert.');
                            return;
                        }

                        //Insert
                        app.db.execute(
                            'INSERT INTO chats (chat_id, admin_id) VALUES (?, ?)',
                            [ chat.id, user.id ],
                            (error) => {
                                if (error) {
                                    app.error.error('Failed to load from database (admin/chat/start/insert): ' + error);
                                    msg.reply('ERROR: Failed to load from database.');
                                    return;
                                }

                                msg.reply(
                                    'Chatten er nå registrert.\n'
                                );
                            }
                        );
                    }
                );
                return;
            }

            //Toggle metro updates
            if (args[2] === 'oppdater') {
                app.db.execute(
                    'SELECT count(*) as c, tbane_updates FROM chats WHERE chat_id=?',
                    [ chat.id ],
                    (error, results) => {
                        if (error) {
                            app.error.error('Failed to load from database (admin/chat/oppdater/select): ' + error);
                            msg.reply('ERROR: Failed to load from database.');
                            return;
                        }

                        if (results[0].c === 0) {
                            msg.reply('Chatten er ikke registrert. Skriv /start for å begynne.');
                            return;
                        }

                        let newStatus = 1;
                        if (results[0].tbane_updates === 1) {
                            newStatus = 0;
                        }

                        //Update
                        app.db.execute(
                            'UPDATE chats SET tbane_updates=? WHERE chat_id=?',
                            [ newStatus, chat.id ],
                            (error) => {
                                if (error) {
                                    app.error.error('Failed to load from database (admin/chat/oppdater/update): ' + error);
                                    msg.reply('ERROR: Failed to load from database.');
                                    return;
                                }

                                if (newStatus === 0) {
                                    msg.reply('Oppdateringer om T-banen deaktivert.');
                                } else {
                                    msg.reply('Oppdateringer om T-banen aktivert.');
                                }
                            }
                        );
                    }
                );
                return;
            }

            //Delete this chat
            if (args[2] === 'glem') {
                app.db.execute(
                    'SELECT count(*) as c FROM chats WHERE chat_id=?',
                    [ chat.id ],
                    (error, results) => {
                        if (error) {
                            app.error.error('Failed to load from database (admin/chat/glem/select): ' + error);
                            msg.reply('ERROR: Failed to load from database.');
                            return;
                        }

                        if (results[0].c === 0) {
                            msg.reply('Chatten er ikke registrert.');
                            return;
                        }

                        //Delete
                        app.db.execute(
                            'DELETE FROM chats WHERE chat_id=?',
                            [ chat.id ],
                            (error) => {
                                if (error) {
                                    app.error.error('Failed to load from database (admin/chat/glem/delete): ' + error);
                                    msg.reply('ERROR: Failed to load from database.');
                                    return;
                                }

                                msg.reply('Gruppens registrering er slettet.');
                            }
                        );
                    }
                );
                return;
            }

            msg.reply('Mulige argumenter: start, oppdater, glem.');
            return;
        }

        msg.reply('Mulige argumenter: stops, chat.');
    });
};