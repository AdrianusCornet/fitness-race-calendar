# Fitness Race Kalender

Een eenvoudige webapp met een overzicht van aankomende fitness races (zoals HYROX, DEKA en Turf Games).

## Functionaliteiten

- Overzicht van aankomende races op datum.
- Filters op race-type en land.
- Zoekfunctie op eventnaam of locatie.
- Maandoverzicht met aantal events.
- Eventdata wordt opgehaald vanaf een server-endpoint (`/api/events`).

## Starten

Start de Node-server:

```bash
node server.js
```

Ga daarna naar `http://localhost:4173`.

## Data updaten

Alle eventdata staat in `events.json` en wordt door de server beschikbaar gemaakt via `/api/events`.
