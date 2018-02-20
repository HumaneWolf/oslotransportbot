const log = require('fancy-log');

module.exports = app => {
    app.redis.on('error', (error) => {
        log.error(error);
    });
};
