module.exports = async app => {
    app.telegram.command('/admin', async msg => {
        let chat = await msg.getChat();
        let user = msg.from;
        if (!app.config.ownerIDs.includes(user.id)) return;

        //Else, do my admin shit.
    });
};