const { join } = require('path');
const env = require('node-env-file');

env(join('src', '.env'));

exports.telegram_api_key = process.env.TELEGRAM_API_KEY;

exports.twitter_comsumer_key = process.env.TWITTER_CONSUMER_KEY;
exports.twitter_consumer_secret = process.env.TWITTER_CONSUMER_SECRET;
exports.twitter_bearer_token = process.env.TWITTER_BEARER_TOKEN;

exports.db_host = process.env.DB_HOST;
exports.db_name = process.env.DB_NAME;
exports.db_user = process.env.DB_USER;
exports.db_pass = process.env.DB_PASS;

exports.ownerIDs = [ 126190936 ];
//0 = @humanewolf

exports.twitterIDs = [ 44597892  ];
//0 = tbanen