# OsloTransportBot (Norwegian only)

Dette er en [Telegram](https://telegram.org/) bot som gir informasjon om offentlig transport i Oslo.

## Features

* Kan varsle automatisk ved problemer med Tbanen.
* Andre transporttyper og mer funksjonalitet kommer.


## Bruk  

* Åpne [t.me/oslotransportbot](t.me/oslotransportbot) i Telegram.  
* Skriv _/start_ for å registrere deg som en bruker av botten.
* Skriv _/oppdater for å aktivere eller deaktivere automatiske oppdateringer ved problemer.


## Litt teknisk

Botten er programert i Node.JS v7.4.0 og bruker følgende moduler (alle er tilgjengelig via npm):  
* telebot  
* twitter  
* mysql2  
* node-env-file  
* log-timestamp (ikke påkrevd for normal bruk)  

Botten lagrer informasjonen den trenger i en MySQL database, som følger strukturen i filen _oslotrans.sql_.

For å sette opp botten må du installere de brukte modulene, fylle inn informasjonen i .env.sample filen og endre navnet på denne til .env.
