//Node modules
const env = require('node-env-file');
const TeleBot = require('telebot');
const MySql = require('mysql2');
require('log-timestamp');

//My modules
var tw = require('./twitter');


//Load settings
env(__dirname + '/.env');


//Load DB connection.
var db = MySql.createConnection(
{
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	user: process.env.DB_USER,
	password: process.env.DB_PASS
}
);
console.log("INFO: Database connected");

//Load Twitter connection.
tw.init(
	process.env.TWITTER_CONSUMER_KEY,
	process.env.TWITTER_CONSUMER_SECRET,
	process.env.TWITTER_BEARER_TOKEN
	);

//Load telegram connection
var bot = new TeleBot(
{
	token: process.env.TELEGRAM_API_KEY,
	polling: { 
		interval: process.env.TELEGRAM_POLLING_INTERVAL, 
		timeout: process.env.TELEGRAM_POLLING_TIMEOUT, 
		limit: process.env.TELEGRAM_POLLING_RETRY_LIMIT, 
		retryTimeout: process.env.TELEGRAM_POLLING_RETRY_TIMEOUT 
	}
}
);


//Timer event handlers
var sendUpdatesTbanen = function()
{
	db.query('SELECT chat_id FROM chats WHERE tbane_updates=1',
		function(err, results, fields)
		{
			if (err)
			{
				console.log("WARN: Failed to get chat data from DB (tbanenTimer)");
			}
			else
			{
				var recipients = results;
				db.query('SELECT * FROM tweets WHERE notified_datetime IS NULL',
					function(err, results, fields)
					{
						if (err)
						{
							console.log("WARN: Failed to get data from DB (tbanenTimer)");
						}
						else
						{
							for (var j = 0; j < results.length; j++)
							{
								//Make a string to tell where it's from.
								var referral = "";
								if (results[j].tweet_author)
								{
									referral = "twitter/tbanen";
								}
								else
								{
									referral = "twitter/unknown";
								}

								for (var i = 0; i < recipients.length; i++)
								{
									bot.sendMessage(recipients[i].chat_id, "#TBANEN OPPDATERING:\n\
										" + results[j].tweet_text + "\n\
										Fra: " + referral);
								}

								//Update db to say it's been notified about.
								db.execute('UPDATE tweets SET notified_datetime=CURRENT_TIMESTAMP WHERE tweet_id=?',
									[ results[j].tweet_id ],
									function(err, results, fields)
									{
										if (err)
										{
											console.log("WARN: Failed to update DB (tbanenTimer)");
										}
									}
									);
							}
						}
					}
					);
			}
		}
		);
}

var timerWrapper = function()
{
	tw.updateDB(db); //Update the DB from twitter sources.
	sendUpdatesTbanen();
}

//Set timer, and trigger when first loaded.
setInterval(timerWrapper, 60000);
timerWrapper();


//Command event handlers.
bot.on('/start', msg => {
	db.execute('SELECT chat_id FROM chats WHERE chat_id=?',
		[ msg.chat.id ],
		function(err, results, fields)
		{
			if (err)
			{
				console.log("WARN: Failed to get data from DB (/start)");
				bot.sendMessage(msg.chat.id, "Mislyktes med å kontakte databasen.");
			}
			else
			{
				if (results.length === 1)
				{
					bot.sendMessage(msg.chat.id, "Denne chatten er allerede registrert i databasen.");
				}
				else
				{
					db.execute('INSERT INTO chats (chat_id, admin_id) VALUES (?, ?)',
						[ msg.chat.id, msg.from.id ],
						function(err, results, fields)
						{
							if (err)
							{
								console.log("WARN: Failed to save data to DB (/start)");
								bot.sendMessage(msg.chat.id, "Mislyktes med å kontakte databasen.");
							}
							else
							{
								bot.sendMessage(msg.chat.id, "Hei, " + msg.from.first_name + "!\n\
									Registreringen lyktes. Se /hjelp for hvilke kommandoer du kan gi botten.\n\
									Husk å bruke /oppdater for å aktivere live oppdateringer om du vil motta dette.");
							}
						}
						);
				}
			}
		}
		);
	return;
});

bot.on('/avganger', msg => {
	bot.sendMessage(msg.chat.id, "Kommer snart!");
	return;
});

bot.on('/oppdater', msg => {
	db.execute('SELECT admin_id,tbane_updates FROM chats WHERE chat_id=?',
		[ msg.chat.id ],
		function(err, results, fields)
		{
			if (results.length === 0)
			{
				bot.sendMessage(msg.chat.id, "Chatten er ikke registrert. Skriv /start for å begynne.");
			}
			else
			{
				if (msg.chat.type === "private" || msg.from.id === results[0].admin_id)
				{
					if (results[0].tbane_updates === 0)
					{
						db.execute('UPDATE chats SET tbane_updates=1 WHERE chat_id=?',
							[ msg.chat.id ],
							function(err, results, fields)
							{
								if (err)
								{
									console.log("WARN: Failed to update DB (/oppdater)");
									bot.sendMessage(msg.chat.id, "Mislyktes med å kontakte databasen.");
								}
								else
								{
									bot.sendMessage(msg.chat.id, "Oppdateringer for Tbanen aktivert.");
								}
							}
							);
					}
					else
					{
						db.execute('UPDATE chats SET tbane_updates=0 WHERE chat_id=?',
							[ msg.chat.id ],
							function(err, results, fields)
							{
								if (err)
								{
									console.log("WARN: Failed to update DB (/oppdater)");
									bot.sendMessage(msg.chat.id, "Mislyktes med å kontakte databasen.");
								}
								else
								{
									bot.sendMessage(msg.chat.id, "Oppdateringer for Tbanen deaktivert.");
								}
							}
							);
					}
				}
				else
				{
					bot.sendMessage(msg.chat.id, "Du er ikke chattens registrerte administrator.");
				}
			}
		}
		);
	return;
});

bot.on('/glemmeg', msg => {
	if (msg.chat.type === "private")
	{

		db.execute('DELETE FROM chats WHERE chat_id=?',
			[ msg.from.id ],
			function(err, result, fields)
			{
				if (err)
				{
					console.log("WARN: Failed to remove chat data from DB (/glemmeg)");
					bot.sendMessage(msg.chat.id, "Mislyktes med å kontakte databasen.");
				}
				else
				{
					bot.sendMessage(msg.chat.id, "Du er slettet som bruker.\n\
						NB: Dersom du er registrert som administrator i en gruppe er du fortatt knyttet til den gruppen.");
				}
			}
			);
	}
	else
	{
		db.execute('SELECT admin_id FROM chats WHERE chat_id=?',
			[ msg.chat.id ],
			function(err, results, field)
			{
				if (err)
				{
					console.log("WARN: Failed to get data from DB (/glemmeg)");
					bot.sendMessage(msg.chat.id, "Mislyktes med å kontakte databasen.");
				}
				else
				{
					if (results.length === 1)
					{
						if (results[0].admin_id === msg.from.id)
						{
							db.execute('DELETE FROM chats WHERE chat_id=?',
								[ msg.chat.id ],
								function(err, results, field)
								{
									if (err)
									{
										console.log("WARN: Failed to remove group chat data from DB (/glemmeg)");
										bot.sendMessage(msg.chat.id, "Mislyktes med å kontakte databasen.");
									}
									else
									{
										bot.sendMessage(msg.chat.id, "Gruppen er slettet fra databasen.");
									}
								}
								);
						}
						else
						{
							bot.sendMessage(msg.chat.id, "Du er ikke gruppens registrerte administrator.");
						}
					}
					else
					{
						bot.sendMessage(msg.chat.id, "Gruppen er ikke registrert. Skriv /start for å begynne.");
					}
				}
			}
			);
	}
	return;
});

bot.on(['/help', '/hjelp'], msg => {
	bot.sendMessage(msg.chat.id, "Tilgjengelige kommandoer:\n\n\
		\t/start - Registrerer deg/kanalen hos botten (angir bot admin for grupper).\n\
		\t/oppdater - Aktiver eller deaktiver automatiske oppdateringer om trafikk.\n\
		\t/glemmeg - Sletter deg som bruker (Sletter gruppen fra systemet hvis brukt i en gruppe).\n\
		Mer funksjonalitet kommer snart!");
	/*bot.sendMessage(msg.chat.id, "Tilgjengelige kommandoer:\n\n\
		\t/start - Registrerer deg/kanalen hos botten (angir bot admin for grupper).\n\
		\t/avganger [stedsnavn] - Lister neste avganter på den angitte stasjonen.\n\
		\t/fav [handling] [argument] - Vis eller endre listen over favorittstopp.\n\
		\t/oppdatermeg - Aktiver eller deaktiver automatiske oppdateringer om trafikk.\n\
		\t/glemmeg - Sletter deg som bruker (Sletter gruppen fra systemet hvis brukt i en gruppe).");*/
	return;
});


//Connect.
bot.connect();