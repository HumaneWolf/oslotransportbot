module.exports = async app => {
    app.telegram.command(['/help', '/hjelp'], async msg => {
        msg.replyWithMarkdown(
            '*Tilgjengelige Kommandoer*\n' +
            '\t/start - _Registrer chatten som bruker av botten_.\n' +
            '\t/oppdater - _Aktiver eller deaktiver automatiske varsler om T-Banen_.\n' +
            '\t/avganger stedsnavn - _Vis de neste avgangene på en angitt stasjon_.\n' +
            '\t/glemmeg - _Slett informasjonen om deg/chatten fra databasen_.'
        );
    });
};