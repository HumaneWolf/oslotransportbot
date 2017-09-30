module.exports = async (app) => {
    app.telegram.command('/start', async msg => {
        let chat = await msg.getChat();
        let user = msg.from;

        //Is the user an admin, if admin rights are required?
        if (chat.type === 'supergroup' || (chat.type === 'group' && chat.all_members_are_administrators === false)) {
            let admins = await msg.getChatAdministrators();
            let isAdmin = false;
            admins.forEach(admin => {
                if (admin.user.id === user.id) {
                    isAdmin = true;
                }
            });
            if (isAdmin === false) {
                msg.reply('Kun en admin/mod kan registrere chatten.');
                return;
            }
        }

        //Is the chat registered already?
        app.db.execute(
            'SELECT count(*) as c FROM chats WHERE chat_id=?',
            [ chat.id ],
            function (error, results) {
                if (error) {
                    app.error.error('Failed to load from database.');
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
                    function (error) {
                        if (error) {
                            app.error.error('Failed to load from database.');
                            msg.reply('ERROR: Failed to load from database.');
                            return;
                        }

                        msg.reply(
                            'Chatten er nå registrert.\n' +
                            'Skriv /hjelp for mer informasjon. ' +
                            'Du kan også skrive /oppdater for å aktivere automatiske oppdateringer om tbanen.'
                        );
                    }
                );
            }
        );
    });
};