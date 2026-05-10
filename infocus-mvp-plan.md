# InFocus MVP-Plan

## Ziel
- Stundenberechnung fixen.
- Benutzerverwaltung minimal integrieren: admin, manager, user.
- Username-Login ergänzen.
- Profil- und Admin-Meldungen migrationsfreundlich vorbereiten.

## Dateien
1. src/components/StatisticsDashboard.tsx
2. src/core/conductor/MovieConductor.ts
3. src/components/LoginScreen.tsx
4. src/components/ProfileModal.tsx oder ähnliche Profil-Komponente
5. supabase/migrations/*.sql

## Schritt 1 — Stundenberechnung
- Runtime-Summen prüfen.
- Nur numerische Minuten/Stunden addieren.
- Serien defensiv behandeln.
- Gesamtstunden nur aus verlässlichen Laufzeiten bilden.

## Schritt 2 — Auth und Username
- Signup um username erweitern.
- Login akzeptiert E-Mail oder Username.
- Username per Lookup auflösen.
- Fallback, falls Migration noch nicht ausgeführt ist.

## Schritt 3 — Profile und Rollen
- profiles um username, role, last_login_at ergänzen.
- role defaults: user.
- admin als Sonderfall via SQL-Vorlage.
- Profil zeigt E-Mail, Username, Rolle, registriert seit, letzte Anmeldung.

## Schritt 4 — Admin-Notifications
- Kleine Tabelle für Registrierungs-Meldungen.
- Admin sieht neue Registrierungen.
- Kein externes Messaging.

## Schritt 5 — Qualität
- tsc --noEmit
- npm run build
- Wenn nötig kleine Tests nur für Statistik/Auth-Mapping.
