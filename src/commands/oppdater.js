module.exports = async (app) => {
    app.telegram.command('/oppdater', async msg => {
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
                msg.reply('Kun en admin/mod kan endre denne innstillingen.');
                return;
            }
        }

        //Is the chat registered and updates enabled already?
        app.db.execute(
            'SELECT count(*) as c, tbane_updates FROM chats WHERE chat_id=?',
            [ chat.id ],
            (error, results) => {
                if (error) {
                    app.error.error('Failed to load from database (oppdater/select): ' + error);
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
                            app.error.error('Failed to load from database (oppdater/update): ' + error);
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
    });
};