module.exports = async (app) => {
    app.telegram.command('/glemmeg', async msg => {
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
                msg.reply('Kun en admin/mod kan slette gruppens registrering.');
                return;
            }
        }

        //Is the chat registered already?
        app.db.execute(
            'SELECT count(*) as c FROM chats WHERE chat_id=?',
            [ chat.id ],
            (error, results) => {
                if (error) {
                    app.error.error('Failed to load from database (glemmeg/select): ' + error);
                    msg.reply('ERROR: Failed to load from database.');
                    return;
                }

                if (results[0].c === 0) {
                    msg.reply('Chatten er ikke registrert. Skriv /start for å begynne: ' + error);
                    return;
                }

                //Delete
                app.db.execute(
                    'DELETE FROM chats WHERE chat_id=?',
                    [ chat.id ],
                    (error) => {
                        if (error) {
                            app.error.error('Failed to load from database (glemmeg/delete): ' + error);
                            msg.reply('ERROR: Failed to load from database.');
                            return;
                        }

                        msg.reply('Gruppens registrering er slettet.');
                    }
                );
            }
        );
    });
};