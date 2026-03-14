# TMDB API Setup für InFocus Movie App

## Problem
Die Filmliste funktioniert nicht, weil der TMDB API Key fehlt.

## Lösung: TMDB API Key besorgen

### 1. TMDB Konto erstellen
1. Gehe zu: https://www.themoviedb.org/
2. Registriere dich kostenlos
3. Bestätige deine E-Mail
4. Login in dein Konto

### 2. API Key anfordern
1. Gehe zu: https://www.themoviedb.org/settings/api
2. Klicke auf "Request an API Key"
3. Fülle das Formular aus:
   - Application Name: "InFocus Movie App"
   - Application URL: "http://localhost:3000"
   - Description: "Family movie diary app"
4. Warte auf Genehmigung (meistens sofort)

### 3. API Key eintragen
1. Öffne `.env.local` Datei
2. Ersetze `your_tmdb_api_key_here` mit deinem echten API Key:
   ```
   TMDB_API_KEY=dein_echter_api_key_hier
   ```

### 4. App neustarten
1. Server stoppen (Ctrl+C)
2. `start_app.bat` ausführen oder `npm run dev`

## Testen
Nach dem Eintrag des API Keys sollte funktionieren:
- Filmliste laden
- Filme suchen
- Filmdetails anzeigen
- Filme zur Watchlist hinzufügen

## API Limits
- Free Account: 40 Anfragen pro 10 Sekunden
- Genug für Entwicklung und Tests

## Fehlerbehebung
Falls es immer noch nicht funktioniert:
1. API Key auf Tippfehler prüfen
2. TMDB Konto Status prüfen
3. Browser Console auf Fehler prüfen (F12)
