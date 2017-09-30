module.exports = async (app) => {
    app.telegram.command('/start', async msg => {
        msg.reply('Hello');
    });
};