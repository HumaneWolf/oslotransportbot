# OsloTransportBot (Norwegian only)

Dette er en [Telegram](https://telegram.org/) bot som gir informasjon om offentlig transport i Oslo.

## Features

* Kan varsle automatisk ved problemer med Tbanen.
* Andre transporttyper og mer funksjonalitet kommer.


## Bruk  

* Sett opp botten på en server, med en Twitter API key og en Telegram bot API key.
* Skriv _/start_ for å registrere deg som en bruker av botten.
* Skriv _/oppdater_ for å aktivere eller deaktivere automatiske oppdateringer ved problemer.


## Litt teknisk

Botten er programert i Node.JS v9.5.0.

For å sette opp botten, bruk kommandoen `npm install` for å sette opp node modulene. Deretter, kopier `./src/.end.sample` til `./src/.env` og fyll it informasjonen i den.
