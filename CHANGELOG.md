# Changelog

## [3.1.1] - 2026-05-24

### 🏷️ Tags UX-Verbesserung

- **Tag-Filter kollapsibel:** Tag-Cloud in der Hauptansicht hinter Toggle-Button mit Chevron-Icon versteckt, mobile-optimiert
- **Tag-Verwaltung kollapsibel:** Im MovieDetailModal sind bestehende Tags + Eingabefeld jetzt einklappbar, Platz sparender

### 📋 Listen-Fixes & Robustheit

- **Duplicate-Prevention:** `addMovieToList` prüft vor Insert auf bestehende Einträge, verhindert doppelte Hinzufügungen
- **TMDB-ID Fallback:** Wenn `movie.tmdbId` fehlt, wird aus `movie.id` abgeleitet — verhindert Insert-Fehler bei Suchergebnissen
- **Grid-Buttons intelligent:** TMDB-Filme bereits in Bibliothek zeigen `ListPlus`-Icon (DetailModal) statt `+` (Watchlist-Add)
- **Fehler-Toast:** Im DetailModal wird bei Listen-Hinzufügen jetzt der konkrete Fehler angezeigt (statt immer "Erfolg")

---

## [3.1.0] - 2026-05-17

### 🧊 Frosted Glass Redesign — iOS Glassmorphismus

**Foundation:**
- **Frosted Glass Token-System:** Neue CSS-Variablen `--glass-blur`, `--glass-saturation`, `--glass-tint`, `--glass-shadow` für alle 4 Themes (Noir/Light/Glass/Neon in individuellen Werten)
- **Utility-Classes:** `.glass-card`, `.glass-card-tinted`, `.glass-tabbar`, `.glass-sheet`, `.glass-input`, `.glass-button`, `.glass-pill`, `.glass-divider`, `.glass-shimmer` in `index.css`
- **Tailwind-Integration:** `backdropBlur`-Custom-Values via CSS-Vars, neue Farb-Token `accent-color`, `glass-bg`, `glass-border`, `tabbar-bg`, `sheet-bg`

**Glass-Komponenten-Bibliothek (`src/components/glass/`):**
- `GlassCard` — Basis-Karte mit backdrop-blur + Saturation, optional tinted/hover
- `GlassButton` — Pill-Button mit Glas-Hintergrund, accent-Variante, active:scale-95
- `GlassInput` — Input mit Icon-Prop, Glas-Look
- `GlassSection` — iOS-Section-Header (uppercase, tracking-wider)
- `GlassDivider` — Gradient-Trenner
- `SheetModal` — iOS-Sheet von unten (spring-animiert, framer-motion)

**Anwendung:**
- **BottomNav** → schwebende Glas-Tab-Bar (`glass-tabbar`, `bottom-4`, `rounded-2xl`, `max-w-sm`)
- **Header** → `glass-card`-Styling, Suche via `GlassInput`
- **ProfileModal** → `SheetModal` von unten, innen `GlassCard` + `GlassSection`
- **LoginScreen** → `GlassCard` + `GlassInput` + `GlassButton`
- **MovieGrid** → `GlassCard` statt bg-app-card-bg

### 📓 Diary/Feed (Letterboxd-Stil)

- **Data:** `watched_at`-Timestamp bei TOGGLE_WATCHED, Backfill-Migration für bestehende Filme
- **DiaryView:** Tagebuch gruppiert nach Heute/Gestern/Diese Woche/Früher, Mini-Poster + Rating + Uhrzeit
- **ActivityFeed:** Aktivitäten (gesehen/bewertet) + "Aktuell am Schauen"-Karussell
- **Migration:** `20260521_diary_and_episodes.sql` (`watched_at`, `total_seasons`, `total_episodes`)

### 📺 Episode-Tracking (Serializd-Stil)

- **tv_progress-Tabelle:** `user_id, tmdb_id, season_number, episode_number, watched, watched_at`
- **EpisodeTracker:** Serien-Liste mit Progress-Bar, Season-Breakdown, 10er-Episode-Grid, "Fortsetzen"-Button
- **Conductor:** `TOGGLE_EPISODE`-Action mit optimistischem Update

### 📋 Listen-Verwaltung & Teilen

- **ListsOverview:** Eigene Listen-Übersicht mit Poster-Previews, Filmzahlen, Teilen/Löschen-Buttons
- **WhatsApp-Share:** `shareList()` mit `wa.me`-Link, formatierte Liste (Name, Beschreibung, alle Filme mit Jahr + Bewertung)
- **BottomNav:** Neuer Listen-Tab zwischen Start und Serien

### 🐛 Bugfixes

- **Schema-Mismatch:** `list_items` auf Remote-DB hatte `tmdb_movie_id` statt `movie_id` — Service auf Remote-Schema umgestellt
- **BottomNav-Labels:** Übersetzung via `t()` für i18n-Keys korrigiert
- **Supabase-Typen:** Regeneriert via `--linked`, CLI-Output aus Datei entfernt

### 🔧 Infrastruktur

- **ctx7 MCP Server** installiert (Context7 für Library-Docs)
- **Vercel Production:** Automatisierte Deployments auf `v0-infocusmovie.vercel.app`

## [3.0.0] - 2026-05-16

### 🎨 Visueller Overhaul — Cinema-Erlebnis

**Foundation & Animations:**
- **CSS-Animation-System:** Einheitliche Transitions, Micro-Interactions für alle Klick-Elemente
- **Theme-Transitions:** Sanfte Übergänge (`transition-colors`) beim Umschalten zwischen Noir/Light/Glass/Neon
- **Typography-Scale:** Definierte Schriftgrößen-Hierarchie (2xs bis 3xl)
- **Semantische Farb-Tokens:** Konsistente CSS-Variablen statt hartcodierter Farben

**Login Screen:**
- **Cinematic Background:** Animierte Gradient-Blobs mit framer-motion
- **Brand-Logo:** "InFocus"-Schriftzug + Film-Icon oben zentriert
- **Mode-Transitions:** Geschmeidiger Wechsel zwischen Login/Signup/Forgot via `AnimatePresence`
- **Google OAuth:** "Weiter mit Google" Button (Login + Signup)
- **Lesbare Inputs:** Neue `.auth-input-field` Klasse mit festem Dark-Background und Autofill-Override

**Movie Grid:**
- **Staggered Entry:** Karten erscheinen nacheinander (40ms Verzögerung)
- **Hover-Lift:** `hover:-translate-y-1 hover:shadow-2xl` für jeden Card
- **Quick-Actions Overlay:** Heart/Eye/Plus/Trash erscheinen auf Hover
- **Watched-Badge:** "✓ Gesehen" Badge oben-links auf der Karte
- **Rating-Badge:** ★ Bewertung oben-rechts

**Detail Modal (Cinema Immersion):**
- **Full-Width Trailer:** YouTube-Trailer füllt 55vh des oberen Modalbereichs
- **CSS-Overlay:** Unsichtbare Schicht über dem iframe unterdrückt alle YouTube-Steuerelemente
- **Titel auf Hero:** Film-Titel + Metadaten (Jahr, Laufzeit, Typ, ★) überlappend auf dem Trailer
- **Parallax-Effekt:** Sanfter Zoom bei fehlendem Trailer (motion.div scale-Animation)

**Bottom Navigation:**
- **Icons + Labels:** Jeder Tab hat jetzt einen Textlabel unter dem Icon
- **Active Indicator:** Animierter Leuchtpunkt (spring physics) unter dem aktiven Tab
- **AnimatePresence:** Geschmeidige Seiten-Übergänge beim Filter-Wechsel

### 📊 Dashboard & Charts

- **Recharts Integration:** Volle Nutzung der bereits installierten Recharts-Bibliothek
- **Genre-Verteilung:** Interaktiver `PieChart` mit den Top-8 Genres inkl. Legende
- **Bewertungs-Verteilung:** `BarChart` mit farbcodierten Balken (grün/gelb/rot)
- **Jahrzehnte-Übersicht:** `BarChart` mit Filmen pro Dekade
- **Stat-Karten:** 4 Karten (Filme, Laufzeit, Ø-Bewertung, Ø-Laufzeit) mit Lucide-Icons
- **Theme-Adaptiv:** Chart-Farben lesen automatisch die aktuellen CSS-Variablen

### 🏆 Achievements & Gamification

- **XP/Level-System:** Level-Berechnung (10 XP pro Film, 100 XP pro Level)
- **Fortschrittsbalken:** Animierte XP-Leiste mit Level-Anzeige
- **7 Achievements:** First Blood, Collector Novice, Genre Guru, Film Fanatic, Cinema Legend, First Watch, Rating Pro
- **Unlock-Animationen:** Spring-Animation, Wobble-Effekt beim Icon, Gleit-Progress-Bar

### 👤 Profil & Benutzerverwaltung

- **Benutzername editieren:** Direkt im Profil klickbar → Bearbeiten-Modus → Speichern
- **Quick-Stats Übersicht:** Filme, Gesehen, Favoriten, Bewertet auf einen Blick
- **Theme Live-Preview:** 4 Theme-Kacheln mit Vorschau-Farben und Auswahl-Haken
- **System-Design folgen:** Toggle für OS-Theme-Präferenz (`prefers-color-scheme`)

### 🔐 Rollen-System

- **3 Rollen:** `admin` (voll), `manager` (löschen + Passwort), `user` (Filme verwalten)
- **Role-Badges:** Im Profil und in der Admin-Liste mit Farbcodierung (rot/blau/grün)
- **AdminPanel:** Komplette Benutzerverwaltung im Profil
  - User-Liste mit Email, Rolle, Registrierungs-/Login-Datum
  - Rollen-Dropdown zur direkten Änderung
  - Passwort-Ändern Modal (styled)
  - Löschen Modal (styled, mit Bestätigung)
  - Cascade-Löschung (Filme + Listen + User)

### 🔌 Integrationen

- **Google OAuth:** "Weiter mit Google" Button + AuthService-Methoden
- **OAuth-Provider vorbereitet:** Google, GitHub, Discord, Apple (via Supabase Dashboard aktivierbar)
- **Chrome DevTools MCP:** Für Debugging direkt aus opencode

### 🛠️ Skills

- **vercel-deploy:** Deployment-Management für Vercel (Build, Preview, Production, Env-Vars)
- **supabase-manager:** Supabase DB-Admin (Migrations, RLS, Auth, Schema)
- **agent-memory-mcp:** Persistentes Memory-System (als MCP konfiguriert)

### 🐛 Bug Fixes

- **React Bundle Crash:** `manualChunks` in vite.config.ts entfernt → keine zirkulären Abhängigkeiten
- **importmap entfernt:** CDN-Import-Remapping (esm.sh) mit Vite-Bundle kollidiert
- **Supabase RLS Rekursion:** Radikale RLS-Policy-Bereinigung auf `profiles`
- **custom_lists 400 Error:** Separate Queries statt PostgREST-Join (Schema-Cache umgangen)
- **Login-Text unsichtbar:** Neue `.auth-input-field` Klasse mit fester Hintergrundfarbe
- **Username speichern 500:** RLS-Policies auf `profiles` komplett neu aufgesetzt
- **AdminPanel "id is ambiguous":** RPC-Funktion auf JSON-Rückgabe umgestellt
- **`image.png` Error:** Chrome-AI-Konsolenfehler unterdrückt

### 🔧 Technische Änderungen

- **framer-motion installiert** für Animationen (React Native & Web kompatibel)
- **Supabase RPCs erstellt:** `admin_get_all_users`, `admin_update_user_role`, `admin_delete_user`, `admin_change_password`
- **Migrations aufgeräumt:** Doppelte Versionsnummern gefixt, Sync-Probleme behoben
- **Backup-Branch erstellt:** `backup-vor-overhaul` als Sicherung

## [2.9.0] - 2026-01-03

### Added

- **Multi-Theme System:**
  - Introduced full theming support with three modes: **Dark** (Default), **Light**, and **Glassmorphism**.
  - Added new "Appearance" (Darstellung) tab in the Profile Modal.
  - Themes are persisted in the user profile across devices.
  - Refactored entire UI to use semantic CSS variables for consistent styling.

## [2.8.1] - 2026-01-03

### Added

- **Avatar Management:** Added "Remove Avatar" functionality to revert to initials.

### Added

- **Password Management:**
  - Added "Forgot Password" functionality to the login screen (email-based reset).
  - Added "Change Password" fields to the Profile Settings for logged-in users.

### Fixed

- **Security & Privacy (Critical):**
  - Implemented state clearing in `MovieConductor` on logout to prevent data leakage between users ("Cache Poisoning").
  - Added explicit `user_id` mapping when adding movies to ensure strict RLS enforcement.
  - Added automatic watchlist reload upon successful login.
  - **Verified:** End-to-End Test (`auth_isolation.spec.ts`) confirms strict data isolation between users.

## [2.7.0] - 2026-01-02

### Added

- **TV Show Support:** Full support for searching, adding, and viewing TV Series (e.g., "Suits").
  - Added `media_type` column to `movies` database table.
  - Updated TMDB integration to use `/search/multi` endpoint.
  - UI now distinguishes between "Movie" and "Series" and displays "Creator" instead of "Director" for shows.
- **Profile Management:** New Profile Modal accessible via the bottom navigation.
  - **User Profile:** View and edit Display Name.
  - **Settings:** Toggle Language (DE/EN) and Clear Cache.
  - **Data:** Export Watchlist as JSON (available to all users).
  - **Admin Area:** Import Watchlist from JSON (restricted to Admins).
- **Navigation:**
  - Replaced "Search" button in bottom nav with "Profile" button.
  - Search bar is now permanently visible in the header for quicker access.

### Fixed

- **Mobile Search:** Fixed an issue where the search bar was not accessible on mobile devices.
- **Initial Load:** App now automatically loads the watchlist upon login without requiring user interaction.
- **Supabase Sync:** Fixed critical 404 errors by adding missing database tables and validating UUIDs.
- **Layout:** Optimized Mobile UI (Z-Index fixes, Metadata relocation).
- **CI/CD:** Added `docs/` placeholder to resolve GitHub Pages build errors.

### Technical

- Implemented `SupabaseMovieService` refactoring for polymorphic media types.
- Enhanced `AuthService` with profile update capabilities.
- Added `ProfileModal` component with tabbed interface.
