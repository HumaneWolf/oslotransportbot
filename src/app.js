const log = require('fancy-log');
const { readdir } = require('fs');
const { join } = require('path');
const redis = require('redis');
const Telegraf = require('telegraf');
const Twitter = require('twitter');
const { promisify } = require('util');

const app = {};

// Static modules
app.config = require('./../config/config.json'); // Config

// Start redis
app.redis = redis.createClient({
    host: app.config.redis.host,
    port: app.config.redis.port
});
app.redis.getAsync = promisify(app.redis.get).bind(app.redis);
app.redis.setAsync = promisify(app.redis.set).bind(app.redis);

// Connecting to Telegram.
app.telegram = new Telegraf(app.config.telegram.apiKey);

// Set the username in the options, for the bot to recognize commands when they include it's username.
app.telegram.telegram.getMe().then((botInfo) => {
    app.telegram.options.username = botInfo.username;
});

// Prepare twitter api.
app.twitter = new Twitter({
    consumer_key: app.config.twitter.consumerKey,
    consumer_secret: app.config.twitter.consumerSecret,
    bearer_token: app.config.twitter.bearerToken
});

log('Static modules loaded. Ready to autoload.');

// Autoload always running modules.
readdir(join('src', 'autoload'), (error, files) => {
    if (error) return log.error('Autoload Directory Reading Failed: ' + error);

    files.forEach(file => {
        let moduleName = file.split('.')[0];
        require('./autoload/' + moduleName)(app);
        log('Loaded module: ' + moduleName);
    });
});

app.telegram.startPolling();
