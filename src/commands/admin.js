module.exports = async app => {
    app.telegram.command('/admin', async msg => {
        let chat = await msg.getChat();
        let user = msg.from;
        if (!app.config.ownerIDs.includes(user.id)) return;

        let args = (msg.update.message.text).split(' ');

        //Actions related to metro stops.
        if (args[1] === 'stop') {
            if (args[2] === 'clear') {
                app.db.execute(
                    'DELETE FROM stops',
                    [],
                    function (error) {
                        if (error) {
                            app.error.error('Failed to load from database (admin/stops/clear).');
                            msg.reply('ERROR: Failed to load from database.');
                            return;
                        }

                        msg.reply('Stopplisten er tømt.');
                    }
                );
            }

            if (args[2] === 'load') {

            }
        }

        //Actions related to chats.
        if (args[1] === 'chat') {

        }
    });
};