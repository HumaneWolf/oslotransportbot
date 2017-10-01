const axios = require('axios');
const req = axios.create({ baseURL: 'https://reisapi.ruter.no' });

module.exports = app => {
    app.telegram.command('/avganger', async msg => {
        let args = msg.update.message.text.split(' ');

        //If no stop name is given.
        if (args.length === 1) return msg.reply('Syntax: /avganger stedsnavn');

        //Sett sammen alt som er skrevet.
        let placename = args[1];
        for (let i = 2; i < args.length; i++) {
            placename = placename + ' ' + args[i];
        }

        app.db.execute(
            'SELECT * FROM stops WHERE stop_name LIKE ? ORDER BY stop_name',
            [ '%' + placename + '%'],
            async (error, results) => {
                if (error) {
                    app.error.error('Failed to load from database (avganger/select): ' + error);
                    msg.reply('ERROR: Failed to load from database');
                    return;
                }

                if (results.length === 0) return msg.reply('Jeg finner ikke dette navnet.');

                let avganger = await req.get('/StopVisit/GetDepartures/' + results[0].stop_id);
                let message = '*Neste avganger fra ' + results[0].stop_name + '*\n';

                for (let i = 0; i < avganger.data.length && i < 6; i++) {
                    //Calcuale how long until departure.
                    let time = (new Date(avganger.data[i].MonitoredVehicleJourney.MonitoredCall.ExpectedDepartureTime) -
                        new Date()) / 60000;
                    //Show it in a pretty way
                    if (time <= 1) {
                        time = 'nå';
                    } else {
                        time = Math.floor(time) + 'min';
                    }

                    //Build frankensteins message.
                    message = message + time + ':    ' + '\\[ ' + avganger.data[i].MonitoredVehicleJourney.LineRef + ' ] ' +
                        '_' + avganger.data[i].MonitoredVehicleJourney.DestinationName + '_\n';
                }

                msg.replyWithMarkdown(message);
            }
        );
    });
};

