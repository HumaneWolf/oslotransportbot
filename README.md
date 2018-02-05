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

Botten er programert i Node.JS v8.6.0 og bruker følgende moduler (alle er tilgjengelig via npm):
* axios
* log-timestamp
* mysql2
* node-env-file
* pmx (For statistikk i Keymetrics via pm2, om man bruker dette. Hvis ikke, fjern modulet for det fra `./src/autoload` mappen.)
* telegraf
* twitter

Botten lagrer informasjonen den trenger i en MySQL database, som følger strukturen i filen `oslotrans.sql`.

For å sette opp botten, bruk kommandoen `npm install` for å sette opp node modulene. Deretter, kopier `./src/.end.sample` til `./src/.env` og fyll it informasjonen i den. Sett opp databasen som anvist i `oslotrans.sql`, så kan du kjøre botten med `node src/app.js`.
