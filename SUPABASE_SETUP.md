# Supabase Setup Anleitung

## 1. Tabellen erstellen
Führe diese SQL-Skripte im Supabase SQL Editor aus:

### Schema erstellen:
```sql
-- Führe scripts/001_create_schema.sql aus
```

### Tabellen erstellen:
```sql
-- Führe scripts/001_create_tables.sql aus
```

## 2. Authentifizierung konfigurieren

### Im Supabase Dashboard:
1. Gehe zu **Authentication > Settings**
2. Setze **Site URL**: `http://localhost:3000`
3. Füge zu **Redirect URLs** hinzu: `http://localhost:3000/auth/callback`
4. Aktiviere **Enable email confirmations**
5. Passe das **Email Template** an, falls nötig

### Email-Template anpassen (falls nötig):
```
Confirmation Link: {{ .ConfirmationURL }}
```

## 3. Environment Variablen prüfen
Die `.env.local` sollte enthalten:
```
NEXT_PUBLIC_SUPABASE_URL=https://ekbpexbhuochrplzorce.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable__UII_iKx3pgvLQvc1xrN1w_qnwP6JOv
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
```

## 4. Testen
1. Registriere neuen Benutzer
2. Bestätigungs-E-Mail sollte ankommen
3. Klick auf Link sollte zur App zurückleiten
4. Benutzer sollte eingeloggt sein

## 5. Fehlersuche
Falls Email nicht ankommt:
- Prüfe Spam-Ordner
- Verwende temporär **Disable email confirmations** für Tests
