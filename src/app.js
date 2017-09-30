const { join } = require('path');
const { readdir } = require('fs');
const Telegraf = require('telegraf');
const MySql = require('mysql2');
require('log-timestamp');

const app = {};

//Static modules
app.error = require('./modules/error'); //Error handling
app.config = require('./modules/config'); //Config

//Connecting to Telegram.
app.telegram = new Telegraf(app.config.telegram_api_key);
//Set the username in the options, for the bot to recognize commands when they include it's username.
app.telegram.telegram.getMe().then((botInfo) => {
    app.telegram.options.username = botInfo.username;
});

//Connecting to database.
app.db = MySql.createConnection({
    host: app.config.db_host,
    database: app.config.db_name,
    user: app.config.db_user,
    password: app.config.db_pass
});

app.error.log('Static modules loaded. Ready to autoload.');

// Autoload always running modules.
readdir(join('src', 'autoload'), (error, files) => {
    if (error) return app.error.error('Autoload Directory Reading Failed: ' + error);

    files.forEach(file => {
        let moduleName = file.split('.')[0];
        require('./autoload/' + moduleName)(app);
        app.error.log('Loaded module: ' + moduleName);
    });
});

readdir(join('src', 'commands'), (error, files) => {
    if (error) return app.error.error('Autoload Directory Reading Failed: ' + error);

    files.forEach(file => {
        let cmdName = file.split('.')[0];
        require('./commands/' + cmdName)(app);
        app.error.log('Loaded command: ' + cmdName);
    });
});

app.telegram.startPolling();