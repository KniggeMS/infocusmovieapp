# Film-Log Debugging

## Problem: Filme werden nicht im Diary angezeigt

## Mögliche Ursachen:

### 1. TMDB API Key fehlt
- Prüfen: `.env.local` Datei
- `TMDB_API_KEY` muss vorhanden sein

### 2. Supabase Verbindung
- User ist nicht eingeloggt
- RLS Policies blockieren den Zugriff

### 3. Datenbank-Tabellen
- Tabellen existieren nicht
- RLS Policies sind falsch

## Debugging-Schritte:

### 1. Browser Console prüfen (F12)
```javascript
// Network Tab prüfen auf:
// - API Fehler
// - Supabase Verbindungsfehler
// - TMDB API Fehler
```

### 2. Supabase Dashboard prüfen
1. **Authentication → Users:** User existiert?
2. **Table Editor:** `diary_entries` Tabelle prüfen
3. **Authentication → Policies:** RLS Policies prüfen

### 3. Datenbank direkt prüfen
```sql
-- Prüfen ob Einträge existieren
SELECT * FROM diary_entries;

-- Prüfen ob User existiert
SELECT * FROM profiles;
```

## Schnelltest:

### 1. User Status prüfen
```javascript
// In Browser Console (F12)
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);
```

### 2. Datenbank-Abfrage testen
```javascript
// In Browser Console (F12)
const { data, error } = await supabase
  .from('diary_entries')
  .select('*');
console.log('Entries:', data, 'Error:', error);
```

## Fehlerbehebung:

### Wenn User nicht existiert:
1. Neu registrieren
2. Email bestätigen
3. Einloggen

### Wenn Tabellen leer:
1. SQL Script erneut ausführen
2. RLS Policies prüfen
3. User ID prüfen

### Wenn API Fehler:
1. TMDB Key prüfen
2. Netzwerkverbindung prüfen
3. API Limits prüfen
