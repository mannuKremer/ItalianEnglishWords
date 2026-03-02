# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MyItalianWordsApp is a macOS tray-based Electron app for learning Italian vocabulary. It displays random Italian words with English and Hebrew translations, plays audio pronunciation via Google TTS, and supports favorites. The app follows a client-server architecture with Firebase Firestore as the database.

## Architecture

```
client/          Electron desktop app (tray-only, no window)
server/          Express REST API (port 4000)
shared/          Word data JSON files used by both client and server
```

**Client** (`client/src/`): Electron app that hides its dock icon and lives in the macOS system tray. Services:
- `main.js` — Entry point, initializes app
- `trayService.js` — Builds tray menu (play audio, next word, favorites, quit)
- `wordsService.js` — Fetches words from server (`GET /words`), falls back to local JSON. Rotates words every 6 seconds
- `stateService.js` — Simple pub/sub state holder for `currentWord`
- `audioService.js` — Downloads TTS MP3 from Google Translate to `/tmp/`, plays via macOS `afplay`
- `favoritesService.js` — Reads/writes `client/favorites.json` (local file)

**Server** (`server/src/`): Express API with Firestore backend.
- `server.js` — Express setup with CORS + Morgan logging
- `wordsController.js` — `GET /words`, `GET /words/random` (Firestore with local JSON fallback)
- `favoritesController.js` — `GET /favorites`, `POST /favorites`, `DELETE /favorites/:id` (Firestore)
- `firebase.js` — Firebase Admin SDK initialization
- `localWordsLoader.js` — Loads `shared/italian_english_hebrew_words.json` as fallback

**Data flow**: Client fetches words from server on startup → server reads from Firestore (or falls back to `shared/` JSON) → client rotates words on a timer and renders in tray menu.

## Common Commands

```bash
# Start server (must run first)
cd server && npm start        # node -r dotenv/config src/server.js (port 4000)

# Start client
cd client && npm start        # electron .
```

No test framework, linter, or build pipeline is configured. Both `npm test` commands are placeholders.

## Word Data Structure

```json
{ "italian": "ciao", "english": "hello", "hebrew": "שלום" }
```

Main data file: `shared/italian_english_hebrew_words.json` (~1,805 words).

## Configuration

- `client/config.json` — `updateInterval` (6000ms), `wordsFile`, `tempDir`, `audioFormat`
- `client/.env` and `server/.env` — Firebase credentials (project: `krembel-36672`)