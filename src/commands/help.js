module.exports = async app => {
    app.telegram.command(['/help', '/hjelp'], async msg => {
        msg.replyWithMarkdown(
            '**Tilgjengelige Kommandoer**\n' +
            '\t_/start_ - Registrer chatten som bruker av botten.\n' +
            '\t_/oppdater_ - Aktiver eller deaktiver automatiske varsler om T-Banen.\n' +
            '\t_/avganger <stedsnavn>_ - Vis de neste avgangene på en angitt stasjon.\n' +
            '\t_/glemmeg_ - Slett informasjonen om deg/chatten fra databasen.'
        );
    });
};