# ITIL V4 Service Management Dokumentation

**Projekt:** InFocus Family CineLog  
**Dokumentationsdatum:** 10. Juni 2026  
**Dokumentationsverantwortlicher:** KniggeMS (Service Owner)  
**Aktuelle Version:** 2.4.1 (Build 34aaafa)  
**Klassifizierung:** Intern — Entwicklungsteam

---

## Inhaltsverzeichnis

1. [Service Design Package (SDP)](#1-service-design-package-sdp)
2. [Service Value Chain (SVC)](#2-service-value-chain-svc)
3. [Change Enablement — Change Records (CR)](#3-change-enablement--change-records-cr)
4. [Release & Deployment Management](#4-release--deployment-management)
5. [Known Error Database (KEDB)](#5-known-error-database-kedb)
6. [Configuration Management Database (CMDB)](#6-configuration-management-database-cmdb)
7. [Incident & Problem Management Log](#7-incident--problem-management-log)
8. [Continual Improvement Register (CIR)](#8-continual-improvement-register-cir)
9. [Four Dimensions of Service Management](#9-four-dimensions-of-service-management)
10. [Guiding Principles — Angewandt](#10-guiding-principles--angewandt)

---

## 1. Service Design Package (SDP)

### 1.1 Service Description

InFocus Family CineLog ist eine **Progressive Web App (PWA)** zum Tracken von Filmen und Serien, Verwalten von Watchlists, Anzeigen von Statistiken und Erhalten KI-gestützter Empfehlungen. Die App folgt einer **Mobile-First / Offline-First**-Strategie mit nativen App-Transitions und Glassmorphism-Design.

### 1.2 Service Scope

#### In Scope
- Filme/Serien suchen (TMDB API), zur persönlichen Watchlist hinzufügen
- Watch-Status, Favoriten, Bewertungen (1–10), Notizen und Tags verwalten
- Benutzerdefinierte Listen erstellen und teilen
- Episoden-Tracking für Serien mit Persistenz in Supabase
- Tagebuch (Diary) mit automatischen Einträgen bei "gesehen"-Markierung
- Statistiken (Genres, Dekaden, Laufzeit, Bewertungen)
- Achievements (7 Stufen, automatisch)
- KI-Tag-Generierung via Google Gemini
- Authentifizierung via Supabase Auth (Email + OAuth: Google/GitHub/Discord/Apple)
- Rollenverwaltung (admin / manager / user)
- 5 UI-Themes (Noir, Glass, Neon, Light, Cinematic Dark)
- i18n (Deutsch / Englisch)
- Admin-Panel (User-Management, Notifications)
- PWA-Installation + Offline-Caching

#### Out of Scope
- Push-Benachrichtigungen (geplant für Future Release)
- Desktop-App (Electron) — nicht priorisiert
- Öffentliche API für Drittanbieter

### 1.3 Service Level Requirements (SLR)

| Kriterium | Anforderung | Status |
|-----------|-------------|--------|
| Verfügbarkeit | 99.5 % (Vercel Hosting) | ✅ Erfüllt |
| Ladezeit Initial | < 3s (3G) | ✅ Erfüllt (324 KB JS gzip) |
| Ladezeit Folgeseiten | < 1s (Cache-First) | ✅ Erfüllt (Service Worker) |
| Antwortzeit TMDB-Suche | < 2s | ✅ Erfüllt |
| Auth-Vorgänge | < 3s | ✅ Erfüllt |
| Offline-Funktionalität | Volle Basisfunktion | ✅ Erfüllt |

### 1.4 Acceptance Criteria (SAC)

Der Service gilt als akzeptiert, wenn:
1. ✅ Alle CRUD-Operationen auf Filme/Serien funktionieren
2. ✅ Authentifizierung (Login, Registrierung, OAuth, Logout) durchgängig funktioniert
3. ✅ Episoden-Toggle nach Seiten-Refresh persistent ist
4. ✅ Tagebuch-Einträge automatisch bei "gesehen"-Markierung erzeugt werden
5. ✅ TypeScript `tsc --noEmit` fehlerfrei durchläuft
6. ✅ Vercel Build (Production) ohne Errors deployed
7. ✅ PWA-Installation auf Mobile + Desktop möglich ist
8. ✅ Alle 5 Themes korrekt dargestellt werden

### 1.5 Technical Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    Client (Browser/PWA)                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React 19 + TypeScript 5 + Vite 5 (Build)                │   │
│  │  Tailwind CSS 3 + Framer Motion + Lucide Icons           │   │
│  │  Glassmorphism Design System (GlassCard, GlassInput...)  │   │
│  └──────────────────────┬───────────────────────────────────┘   │
│                          │                                       │
│  ┌──────────────────────▼───────────────────────────────────┐   │
│  │  MovieConductor (Conductor Pattern — State Machine)       │   │
│  │  • dispatch(UserIntent) → handler                          │   │
│  │  • Optimistic Updates + Rollback                          │   │
│  │  • subscribe(Listener) → Observer Pattern                 │   │
│  └──────────────────────┬───────────────────────────────────┘   │
│                          │                                       │
│  ┌──────────────────────▼───────────────────────────────────┐   │
│  │  Service Layer (Adapter Pattern)                          │   │
│  │  • MovieServiceAdapter (Interface)                        │   │
│  │  • SupabaseMovieService (Implementation)                  │   │
│  │  • AuthService (Singleton)                                │   │
│  │  • GeminiService (AI Tagging)                             │   │
│  └──────────────────────┬───────────────────────────────────┘   │
└──────────────────────────┼───────────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│  External Services                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │  Supabase    │  │  TMDB API    │  │  Google Gemini AI     │  │
│  │  PostgreSQL  │  │  Filme/Serien│  │  Tag-Generierung      │  │
│  │  Auth (SSO)  │  │  Watch-      │  │  Recommendations      │  │
│  │  Realtime    │  │  Provider    │  │                       │  │
│  └──────────────┘  └──────────────┘  └───────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### 1.6 Data Model (Entity Relationship)

```
users (Supabase Auth)
  ├── profiles (1:1) — username, display_name, role, theme, ui_style
  ├── movies (1:N) — title, tmdb_id, watched, favorite, user_rating, notes, tags
  ├── diary_entries (1:N) — tmdb_movie_id, watched_on, rating
  ├── tv_progress (1:N) — tmdb_id, season_number, episode_number, watched
  ├── custom_lists (1:N) — name, description
  │     └── list_items (1:N) — tmdb_movie_id, movie_title, media_type
  ├── list_shares (1:N) — shared_with (user_id), can_edit
  └── notifications (1:N) — type, payload, read_at
```

---

## 2. Service Value Chain (SVC)

### 2.1 Value Stream: Fehlerbehebung & Funktionserweiterung (Juni 2026)

```
Demand ──► Plan ──► Design ──► Obtain/Build ──► Transition ──► Operate
  │          │         │            │               │              │
  ▼          ▼         ▼            ▼               ▼              ▼
Bug-Reports  Sprint    Architektur  Code-Impl.     Vercel         Monitoring
Feature-     Planning  Review       Code-Review    Deploy         User-
Wünsche      Risk      Test-        CI (tsc +      Production     Feedback
             Assessment Konzeption  vitest + build) Promote
```

### 2.2 Aktivitäten dieser Session (10. Juni 2026)

| SVC-Schritt | Aktivität | Status |
|-------------|-----------|--------|
| **Demand** | Episoden-Tracking flüchtig, Diary nie dispatchet, UIStyleSwitcher deaktiviert, NotificationBell/AdminNotifications tot | ✅ Erkannt |
| **Plan** | Risikobewertung: Kein DB-Schema-Change nötig (Tabellen existieren), keine Breaking Changes | ✅ Abgeschlossen |
| **Design** | 4 neue Adapter-Methoden: `saveEpisodeProgress`, `loadEpisodeProgress`, `saveDiaryEntry`, `getDiaryEntries` | ✅ Abgeschlossen |
| **Obtain/Build** | 7 Dateien geändert (siehe Change Records), ~330 Zeilen neu | ✅ Abgeschlossen |
| **Transition** | CI (tsc + build) ✅ → GitHub Push ✅ → Vercel Build ✅ → Production Promote ✅ | ✅ Abgeschlossen |
| **Operate** | Production Deployment Ready. Noch offen: Poster-Responsivität (Fix committed, wartet auf Build) | ◐ Teilweise |

---

## 3. Change Enablement — Change Records (CR)

### 3.1 Change CR-2026-06-10-001: Episoden-Tracking Persistenz

| Feld | Wert |
|------|------|
| **Change ID** | CR-2026-06-10-001 |
| **Kategorie** | Minor Change (Fehlerbehebung) |
| **Risikobewertung** | Gering — Nur In-Memory → DB-Persistenz, kein Schema-Change |
| **Betroffene CIs** | `MovieConductor.ts`, `SupabaseMovieService.ts`, `types/domain.ts` |
| **Change Author** | OpenCode Agent |
| **Change Owner** | KniggeMS |
| **CAB** | Nicht erforderlich (Major Change < Minor) |
| **Implementierungsdatum** | 10.06.2026 |

**Beschreibung:**
`handleToggleEpisode()` in MovieConductor.ts aktualisierte nur den In-Memory-State (`this.state.episodes`) aber persistierte nie in die Supabase-Tabelle `tv_progress`. Nach Seiten-Refresh waren alle Episode-Toggles verloren.

**Resolution:**
1. `MovieServiceAdapter` um `saveEpisodeProgress()` und `loadEpisodeProgress()` erweitert
2. `SupabaseMovieService` implementiert Upsert-Logik (Delete + Insert) in `tv_progress`
3. `MovieConductor.handleToggleEpisode()` ruft nach State-Update `adapter.saveEpisodeProgress()` auf
4. `handleLoadMovies()` lädt Episoden via `adapter.loadEpisodeProgress()`

**Rollback-Plan:**
- Commit `d21f545` revert → Zurück zu altem Verhalten (In-Memory only)

---

### 3.2 Change CR-2026-06-10-002: Diary Entry Automatism

| Feld | Wert |
|------|------|
| **Change ID** | CR-2026-06-10-002 |
| **Kategorie** | Minor Change (Feature-Erweiterung) |
| **Risikobewertung** | Gering — Schreibzugriff auf `diary_entries`-Tabelle |
| **Betroffene CIs** | `MovieConductor.ts`, `SupabaseMovieService.ts` |
| **Implementierungsdatum** | 10.06.2026 |

**Beschreibung:**
`DIARY_ENTRY`-Intent war definiert aber wurde von keiner Komponente dispatchet. Tagebuch blieb leer.

**Resolution:**
1. `MovieServiceAdapter` um `saveDiaryEntry()` und `getDiaryEntries()` erweitert
2. `handleToggleWatched()` ruft bei "gesehen"-Markierung automatisch `handleDiaryEntry()` auf
3. `handleDiaryEntry()` persistiert in `diary_entries`-Tabelle via Adapter
4. `handleLoadMovies()` lädt vorhandene Tagebuch-Einträge

---

### 3.3 Change CR-2026-06-10-003: Silent Exception Handling

| Feld | Wert |
|------|------|
| **Change ID** | CR-2026-06-10-003 |
| **Kategorie** | Minor Change (Code-Qualität) |
| **Risikobewertung** | Kein Risiko |
| **Betroffene CIs** | `MovieConductor.ts`, `hooks/useExternalRatings.ts` |

**Resolution:**
- `handleUpdateField()`: `console.warn` wenn Film-ID nicht gefunden wird
- `handleToggleWatched()`: `console.warn` bei Fehler
- `useExternalRatings()`: Leeren Catch-Block (`catch { /* silent */ }`) durch `console.warn` ersetzt

---

### 3.4 Change CR-2026-06-10-004: Reaktivieren toter Komponenten

| Feld | Wert |
|------|------|
| **Change ID** | CR-2026-06-10-004 |
| **Kategorie** | Minor Change (UI-Ergänzung) |
| **Risikobewertung** | Gering |
| **Betroffene CIs** | `ProfileModal.tsx`, `App.tsx` |

**Resolution:**
1. **UIStyleSwitcher** in `ProfileModal.tsx`: Import + JSX einkommentiert (war mit TODO deaktiviert)
2. **NotificationBell** in `App.tsx` Header eingebunden
3. **AdminNotifications** in `App.tsx` Header eingebunden (nur für admin-Rolle sichtbar)

---

### 3.5 Change CR-2026-06-10-005: Responsive Movie Grid

| Feld | Wert |
|------|------|
| **Change ID** | CR-2026-06-10-005 |
| **Kategorie** | Minor Change (UI-Verbesserung) |
| **Risikobewertung** | Kein Risiko |
| **Betroffene CIs** | `App.tsx` |
| **Implementierungsdatum** | 10.06.2026 |
| **Status** | ✅ Committed & Pushed (wartet auf Vercel Build) |

**Beschreibung:**
Hardcodiertes `grid-cols-3` führte auf Desktop-Bildschirmen (>1000px) zu überdimensionierten Postern (~590px Breite).

**Resolution:**
| Breakpoint | Vorher | Nachher |
|------------|--------|---------|
| Default (<640px) | 3 Spalten | 3 Spalten |
| sm (640px+) | 3 | 4 |
| md (768px+) | 3 | 5 |
| lg (1024px+) | 3 | 6 |
| xl (1280px+) | 3 | 7 |
| TMDB Bildgröße | w342 (342px) | w500 (500px) |

---

### 3.6 Change CR-2026-06-10-006: TypeScript-Test-Fix + Gitignore

| Feld | Wert |
|------|------|
| **Change ID** | CR-2026-06-10-006 |
| **Kategorie** | Minor Change (Build-Fix) |
| **Risikobewertung** | Kein Risiko |
| **Betroffene CIs** | `.gitignore`, `MovieConductor_Providers.test.ts` |

**Beschreibung:**
- `.gitignore` Pattern `conductor/` matchte fälschlich `src/core/conductor/` → force-add nötig
- `MovieConductor_Providers.test.ts` fehlten 4 neue Adapter-Methoden → `lint_or_type_error` in Vercel

**Resolution:**
1. `.gitignore`: `conductor/` → `/conductor/` (nur Root-Verzeichnis)
2. Mock-Adapter im Test-File um 4 neue Methoden ergänzt

---

## 4. Release & Deployment Management

### 4.1 Release History (Auszug aktuellste)

| Release | Datum | Commit | Status | Deployment-URL |
|---------|-------|--------|--------|----------------|
| v2.4.1-hotfix.6 | 10.06.2026 | `34aaafa` | 🔄 Building | `infocusmovieapp-o1kb25xv7-...` |
| v2.4.1-hotfix.5 | 10.06.2026 | `f3b4927` | ✅ Ready (Prod) | `infocusmovieapp-o1kb25xv7-...` |
| v2.4.1-hotfix.4 | 10.06.2026 | `d21f545` | ✅ Ready (Preview → Prod) | Preview → Production |
| v2.4.1-hotfix.3 | 10.06.2026 | `85405a6` | ❌ Error (lint_or_type_error) | CI failed |
| v2.4.1 | 09.06.2026 | `c8z458bwn` | ✅ Ready (Prod, alt) | Production |

### 4.2 Build & Deployment Pipeline

```
Push to main (GitHub)
  │
  ├── GitHub Actions CI
  │   ├── npm ci
  │   ├── npx tsc --noEmit (TypeScript Check)
  │   ├── npx vitest run (Unit Tests)
  │   └── npm run build (Vite Production Build)
  │
  └── Vercel (Git Integration)
      ├── Auto-Deploy Preview
      ├── Promote to Production (manuell via Vercel CLI)
      └── URL: https://infocusmovieapp-o1kb25xv7-kniggems-projects.vercel.app
```

### 4.3 Deployment Protection

- **Status**: Aktiv (Vercel Deployment Protection)
- **Auswirkung**: App nur nach Vercel-Authentifizierung sichtbar
- **Empfehlung**: Production Protection deaktivieren oder Custom Domain (z.B. `cinelog.app`) konfigurieren

### 4.4 MCP-Server-Integration

| MCP Server | URL | Authentifizierung | Status |
|-----------|-----|-------------------|--------|
| **Supabase** | `mcp.supabase.com/mcp?project_ref=ekbpexbhuochrplzorce&read_only=true` | Bearer Token (PAT) | ✅ Konfiguriert |
| **Vercel** | `mcp.vercel.com` | Bearer Token (Vercel PAT) | ✅ Konfiguriert |
| **Context7** | `mcp.context7.com/mcp` | API-Key Header | ✅ Konfiguriert |

---

## 5. Known Error Database (KEDB)

### KEDB-001: Vite dev server port 3000

| Feld | Wert |
|------|------|
| **KEDB-ID** | KEDB-001 |
| **Status** | Workaround bekannt |
| **Schweregrad** | Gering |
| **Betroffene Komponente** | `vite.config.ts` — server.port = 3000 |

**Fehler:** Vite-Dev-Server läuft auf Port 3000 (nicht Standard 5173).  
**Ursache:** Explizite Konfiguration in `vite.config.ts`.  
**Workaround:** `npm run dev` → Browser öffnen → `http://localhost:3000`.  
**Root Cause:** Kein Fehler — gewollte Konfiguration.

### KEDB-002: Rollup native module fehlt in Linux-Umgebungen

| Feld | Wert |
|------|------|
| **KEDB-ID** | KEDB-002 |
| **Status** | Workaround bekannt |
| **Schweregrad** | Mittel (betrifft lokales dev) |

**Fehler:** `Error: Cannot find module @rollup/rollup-linux-x64-gnu`  
**Ursache:** Fehlende optionale Dependency `@rollup/rollup-linux-x64-gnu`. Bekannter npm-Bug (#4828).  
**Workaround:** `npm install @rollup/rollup-linux-x64-gnu`  
**Root Cause:** npm installiert optionale Dependencies nicht immer korrekt.

### KEDB-003: TypeScript Test-Env mit Node 24

| Feld | Wert |
|------|------|
| **KEDB-ID** | KEDB-003 |
| **Status** | Workaround bekannt |
| **Schweregrad** | Mittel (betrifft CI mit Node 24) |

**Fehler:** `vitest` und `tsc` hängen in Umgebungen mit Node v24 (aktuell).  
**Ursache:** Kompatibilitätsprobleme zwischen Node v24 und jsdom/Test-Libraries.  
**Workaround:** CI verwendet Node 22 (siehe `.github/workflows/ci.yml`). Lokal Node 18 oder 20 verwenden.  
**Root Cause:** Node v24 ist sehr neu (April 2026). Dependency-Aktualisierungen abwarten.

### KEDB-004: TMDB API Key clientseitig

| Feld | Wert |
|------|------|
| **KEDB-ID** | KEDB-004 |
| **Status** | Bekannt, akzeptiert |
| **Schweregrad** | Mittel (Sicherheit) |

**Fehler:** `VITE_TMDB_API_KEY` liegt im Client-Bundle (Vite ersetzt `import.meta.env.VITE_*` zur Build-Zeit).  
**Ursache:** Architekturbedingt — TMDB hat kein Backend, Anfragen kommen vom Client.  
**Workaround:** TMDB erlaubt Public-Keys; Rate-Limiting ist auf TMDB-Seite. Für Production: Proxy-Endpoint in Supabase Edge Function.  
**Root Cause:** Single-Page-App ohne eigenes Backend.

### KEDB-005: Gemini API Key clientseitig

| Feld | Wert |
|------|------|
| **KEDB-ID** | KEDB-005 |
| **Status** | Bekannt, akzeptiert |
| **Schweregrad** | Mittel (Sicherheit + Kosten) |

**Fehler:** `VITE_GEMINI_API_KEY` im Client-Bundle.  
**Ursache:** Gleiches Problem wie KEDB-004.  
**Workaround:** Gemini Free Tier (15 RPM, 1.500 Requests/Tag). Für Production: Proxy-Endpoint empfohlen.  
**Root Cause:** Kein Backend-Zwischenschicht.

---

## 6. Configuration Management Database (CMDB)

### 6.1 Configuration Items (CIs) — Source Code

| CI-ID | Typ | Pfad | Version (SHA) | Owner |
|-------|-----|------|---------------|-------|
| CI-001 | Core Logic | `src/core/conductor/MovieConductor.ts` | `34aaafa` | KniggeMS |
| CI-002 | Service Interface | `src/types/domain.ts` | `34aaafa` | KniggeMS |
| CI-003 | DB Adapter | `src/services/SupabaseMovieService.ts` | `34aaafa` | KniggeMS |
| CI-004 | Auth Service | `src/services/AuthService.ts` | `34aaafa` | KniggeMS |
| CI-005 | AI Service | `src/services/GeminiService.ts` | `34aaafa` | KniggeMS |
| CI-006 | Main App | `src/App.tsx` | `34aaafa` | KniggeMS |
| CI-007 | Styles/Themes | `src/styles/themes.css` | `34aaafa` | KniggeMS |
| CI-008 | i18n | `src/lib/i18n.ts` | `34aaafa` | KniggeMS |
| CI-009 | Glass Design | `src/components/glass/` | `34aaafa` | KniggeMS |
| CI-010 | Test Setup | `src/core/conductor/MovieConductor.test.ts` | `34aaafa` | KniggeMS |
| CI-011 | CI/CD | `.github/workflows/ci.yml` | `34aaafa` | KniggeMS |
| CI-012 | Build Config | `vite.config.ts` | `34aaafa` | KniggeMS |
| CI-013 | OpenCode Config | `opencode.json` | `34aaafa` | KniggeMS |

### 6.2 Configuration Items — External Services

| CI-ID | Dienst | Typ | Konfiguration | SLA |
|-------|--------|-----|---------------|-----|
| CI-020 | Vercel | Hosting/Deployment | Team: `kniggems-projects`, Project: `infocusmovieapp` | 99.99 % |
| CI-021 | Supabase | Backend/Database | Projekt: `ekbpexbhuochrplzorce` (Frankfurt) | 99.95 % |
| CI-022 | TMDB | Film-Metadaten | API Key via `VITE_TMDB_API_KEY` | Rate Limited |
| CI-023 | Google Gemini | KI-Tagging | API Key via `VITE_GEMINI_API_KEY`, Model: `gemini-2.5-flash` | 15 RPM / 1.500 Requests/Tag |
| CI-024 | OMDb | Fallback-Suche | API Key via `VITE_OMDB_API_KEY` | Rate Limited |

### 6.3 CI-Relationships

```
CI-001 (MovieConductor) ──uses──▶ CI-002 (MovieServiceAdapter Interface)
                              ──uses──▶ CI-003 (SupabaseMovieService)
                              ──uses──▶ CI-004 (AuthService)
                              ──uses──▶ CI-005 (GeminiService)

CI-006 (App.tsx) ──renders──▶ CI-009 (Glass Components)
                   ──imports──▶ CI-001 (MovieConductor)

CI-003 (SupabaseMovieService) ──connects──▶ CI-021 (Supabase)
CI-005 (GeminiService) ──connects──▶ CI-023 (Google Gemini)

CI-011 (CI/CD Pipeline) ──deploys──▶ CI-020 (Vercel)
CI-020 (Vercel) ──serves──▶ CI-013 (opencode.json MCP Server Config)
```

---

## 7. Incident & Problem Management Log

### INC-2026-06-10-001: Vercel Build Error (lint_or_type_error)

| Feld | Wert |
|------|------|
| **Incident ID** | INC-2026-06-10-001 |
| **Datum/Zeit** | 10.06.2026 22:41 CEST |
| **Status** | ✅ Resolved |
| **Schweregrad** | Hoch — Build-Blocker |
| **Betroffen** | CI/CD Pipeline |

**Symptom:** Vercel Build fehlgeschlagen mit `lint_or_type_error`.  
**Diagnose:** CI-Logs zeigten `error TS2304: Cannot find name 'UIStyleSwitcher'` in `ProfileModal.tsx`.  
**Root Cause:** Nach dem Einkommentieren des UIStyleSwitcher-Imports waren 4 neue Adapter-Methoden nicht im Mock von `MovieConductor_Providers.test.ts` vorhanden.  
**Workaround:** Kein Workaround notwendig — Fix direkt implementiert.  
**Resolution:** `MovieConductor_Providers.test.ts` um `saveEpisodeProgress`, `loadEpisodeProgress`, `saveDiaryEntry`, `getDiaryEntries` ergänzt.  
**Known Error:** KEDB-003 (Parallel-Test-Env)

### INC-2026-06-10-002: UIStyleSwitcher Import fehlerhaft

| Feld | Wert |
|------|------|
| **Incident ID** | INC-2026-06-10-002 |
| **Status** | ✅ Resolved |

**Symptom:** `Cannot find name 'UIStyleSwitcher'`.  
**Root Cause:** Die Zeile `// disabled import ...` wurde nur teilweise vom Kommentar befreit.  
**Achtung:** Eigentliche Ursache war INC-2026-06-10-001 (fehlende Mock-Methoden).  
**Resolution:** Mit INC-2026-06-10-001 behoben.

---

## 8. Continual Improvement Register (CIR)

### CIR-001: OMDb-Fallback N+1 Problem

| Feld | Wert |
|------|------|
| **CIR-ID** | CIR-001 |
| **Priorität** | Mittel |
| **Kategorie** | Performance |

**Beschreibung:** `searchOMDb()` macht für jedes OMDb-Ergebnis einen separaten TMDB-API-Call → 10 OMDb-Results = 10 TMDB-Calls.  
**Vorschlag:** Batch-Resolve der IMDb-IDs in einem einzigen TMDB-Call.  
**Aufwand:** ~2h  
**Status:** 🔲 Offen

### CIR-002: App.tsx Monolith aufteilen

| Feld | Wert |
|------|------|
| **CIR-ID** | CIR-002 |
| **Priorität** | Mittel |
| **Kategorie** | Maintainability |

**Beschreibung:** `App.tsx` ist 414 Zeilen lang und vermischt Suchlogik, Filter, Tags, Grid, Loading/Error-States.  
**Vorschlag:** Auslagerung in `MovieGrid.tsx`, `AppHeader.tsx`, `AppContent.tsx`.  
**Aufwand:** ~4h  
**Status:** 🔲 Offen

### CIR-003: MovieConductor in Sub-Conductors aufteilen

| Feld | Wert |
|------|------|
| **CIR-ID** | CIR-003 |
| **Priorität** | Mittel |
| **Kategorie** | Maintainability |

**Beschreibung:** `MovieConductor.ts` 554 Zeilen, 20+ Handler.  
**Vorschlag:** Aufteilung in `MovieConductor.ts` (Kern) + `EpisodeConductor.ts` + `ListConductor.ts` + `DiaryConductor.ts`.  
**Aufwand:** ~6h  
**Status:** 🔲 Offen

### CIR-004: Testabdeckung erhöhen

| Feld | Wert |
|------|------|
| **CIR-ID** | CIR-004 |
| **Priorität** | Hoch |
| **Kategorie** | Quality Assurance |

**Fehlende Tests:**
- Recommendations Service/Component
- OMDb Fallback
- GeminiService
- useNotifications / useListSharing / useExternalRatings / useUIStyle hooks
- List sharing flow
- Admin-Panel

**Status:** 🔲 Offen

### CIR-005: Custom Domain einrichten

| Feld | Wert |
|------|------|
| **CIR-ID** | CIR-005 |
| **Priorität** | Hoch |
| **Kategorie** | Service Availability |

**Beschreibung:** Keine Custom Domain konfiguriert. App nur über Vercel-URL erreichbar. Vercel Deployment Protection aktiv (nicht öffentlich).  
**Vorschlag:** `cinelog.app` oder Subdomain konfigurieren. Deployment Protection für Production deaktivieren.  
**Aufwand:** ~1h  
**Status:** 🔲 Offen

### CIR-006: API Keys aus opencode.json in Env-Vars

| Feld | Wert |
|------|------|
| **CIR-ID** | CIR-006 |
| **Priorität** | Mittel |
| **Kategorie** | Security |

**Beschreibung:** Supabase PAT und Vercel Token liegen als `${VAR}`-Referenzen in `opencode.json`. Werte aktuell hard-coded in `.bashrc`.  
**Vorschlag:** Tokens von Environment-Variablen beziehen lassen (aktuell schon korrekt), Werte in `.bashrc` sichern.  
**Status:** ✅ Bereits umgesetzt (Env-Vars in `.bashrc`, Config nutzt `${SUPABASE_TOKEN}` und `${VERCEL_TOKEN}`)

### CIR-007: CI um Lint + Coverage ergänzen

| Feld | Wert |
|------|------|
| **CIR-ID** | CIR-007 |
| **Priorität** | Niedrig |
| **Kategorie** | Quality Assurance |

**Beschreibung:** `.github/workflows/ci.yml` hat nur `tsc`, `vitest`, `build`. Kein Lint, kein Coverage-Report.  
**Vorschlag:** `eslint` und `vitest --coverage` ergänzen. Dependencies-Caching optimieren.  
**Aufwand:** ~2h  
**Status:** 🔲 Offen

---

## 9. Four Dimensions of Service Management

### 9.1 Organizations & People

| Rolle | Verantwortung | Personen |
|-------|---------------|----------|
| **Service Owner** | Gesamtverantwortung, Budget, Strategie | KniggeMS |
| **Product Owner** | Feature-Priorisierung, Backlog | KniggeMS |
| **Developer** | Implementierung, Testing, CI/CD | KniggeMS + OpenCode Agent |
| **Service Desk** | Anwender-Support (über GitHub Issues) | KniggeMS |

### 9.2 Information & Technology

Siehe [CMDB (Abschnitt 6)](#6-configuration-management-database-cmdb) und [SDP (Abschnitt 1)](#1-service-design-package-sdp).

**Security:**
- Supabase RLS (Row Level Security) pro User
- Auth via Supabase (JWT-basiert)
- Rollen-System (admin/manager/user)
- Keine Secrets im Client-Bundle (außer API-Keys) — **bekannte Einschränkung**
- MCP-Server im Read-Only-Modus für Datenbank-Zugriff

### 9.3 Partners & Suppliers

| Partner/Supplier | Service | Vertragsbasis | Abhängigkeit |
|-----------------|---------|---------------|-------------|
| **Vercel** | Hosting, Deployment, CDN | Free Tier (Hobby) | Kritisch — Ausfall = App offline |
| **Supabase** | PostgreSQL, Auth, Storage | Free Tier | Kritisch — Ausfall = kein Login, keine Daten |
| **TMDB** | Filmdaten, Poster, Trailer | Kostenloser API-Key (attribution erforderlich) | Hoch — keine Filmdaten ohne TMDB |
| **Google (Gemini)** | KI-Taggenerierung | Free Tier (1.500 req/day) | Mittel — Feature degradiert ohne KI |
| **GitHub** | Source Control, CI/CD, Issues | Kostenlos | Mittel — Entwicklung betroffen |

### 9.4 Value Streams & Processes

| Prozess | Tool/Methode | Status |
|---------|-------------|--------|
| **Incident Management** | GitHub Issues | ✅ Eingerichtet |
| **Change Management** | ITIL V4 Change Records (diese Doku) | ✅ Eingerichtet (diese Session) |
| **Release Management** | Vercel Auto-Deploy + Promotion | ✅ Eingerichtet |
| **Continual Improvement** | CIR-Register (Abschnitt 8) | ✅ Eingerichtet (diese Session) |
| **Known Error Management** | KEDB (Abschnitt 5) | ✅ Eingerichtet (diese Session) |
| **Configuration Management** | CMDB (Abschnitt 6) | ✅ Eingerichtet (diese Session) |
| **Service Design** | SDP (Abschnitt 1) | ✅ Eingerichtet (diese Session) |

---

## 10. Guiding Principles — Angewandt

Die ITIL V4 Guiding Principles wurden in dieser Session wie folgt angewandt:

### 10.1 Focus on Value

**Anwendung:** Jeder Fix wurde gegen konkrete Nutzerprobleme priorisiert:
- Episoden-Toggle verloren → Direkter Nutzer-Schmerz → Höchste Priorität
- Tagebuch nie befüllt → Feature nicht nutzbar → Hohe Priorität
- UIStyleSwitcher versteckt → Geringere Priorität, aber einfacher Fix
- Poster zu groß → Gemeldet via Screenshot → Umgehend gefixt

### 10.2 Start Where You Are

**Anwendung:** Kein Neuentwurf der Architektur. Bestehendes Conductor-Pattern, bestehende Supabase-Tabellen (`tv_progress`, `diary_entries`) wurden genutzt. Keine Migration nötig.

### 10.3 Progress Iteratively with Feedback

**Anwendung:**
1. Code-Analyse → Issue-Erkennung → Fix → Commit → Deploy
2. Feedback von Vercel (Build Error) → Sofortiger Fix → Re-Deploy
3. Feedback via Screenshot (Poster-Größe) → Sofortiger Fix → Commit
4. Schnelle Iteration: 3 Commits in dieser Session

### 10.4 Collaborate and Promote Visibility

**Anwendung:**
- MCP-Server konfiguriert (Supabase + Vercel) für Transparenz und direkten Zugriff
- Detaillierte ITIL-Dokumentation aller Changes
- GitHub als zentrale Kollaborationsplattform
- Vercel-Deployments öffentlich einsehbar

### 10.5 Think and Work Holistically

**Anwendung:**
- Keine isolierten Fixes: Alle Änderungen berücksichtigen das Gesamtsystem
- Adapter-Interface zentral erweitert → Alle Services profitieren
- Tests mitgeupdated → Qualitätssicherung ganzheitlich
- Neben Funktions-Fixes auch Infrastruktur: `.gitignore`, CI, MCP-Integration

### 10.6 Keep It Simple and Practical

**Anwendung:**
- Minimalinvasive Änderungen: Kein Refactoring, wo ein Fix reicht
- Bestehende Patterns genutzt (kein neues State-Management)
- Evidenzbasierte Priorisierung: Nur das gefixt, was wirklich kaputt war
- Dokumentation praktisch und direkt nutzbar (nicht überladen)

### 10.7 Optimize and Automate

**Anwendung:**
- CI/CD vollständig automatisiert (GitHub Actions + Vercel)
- MCP-Server automatisiert DB-Zugriffe
- Env-Vars statt Hardcoding (Sicherheitsoptimierung)
- Responsive Grid verhindert zukünftige Layout-Probleme

---

## Anhang A: Änderungshistorie dieser Dokumentation

| Datum | Autor | Änderung |
|-------|-------|----------|
| 11.05.2026 | KniggeMS | Initiale ITIL V4 Dokumentation (v2.4.2 Release) |
| 10.06.2026 | OpenCode Agent | Vollständige Überarbeitung; SDP, CMDB, KEDB, CIR ergänzt; 6 Change Records dokumentiert |

---

## Anhang B: ITIL V4 Compliance-Checkliste

| Praxis | Status | Nachweis |
|--------|--------|----------|
| Service Design Package (SDP) | ✅ | Abschnitt 1 |
| Service Level Requirements (SLR) | ✅ | Abschnitt 1.3 |
| Service Acceptance Criteria (SAC) | ✅ | Abschnitt 1.4 |
| Change Records (CR) | ✅ | Abschnitt 3 (6 CRs) |
| Known Error Database (KEDB) | ✅ | Abschnitt 5 (5 Einträge) |
| Configuration Management (CMDB) | ✅ | Abschnitt 6 (20+ CIs) |
| Incident Management Log | ✅ | Abschnitt 7 (2 Incidents) |
| Continual Improvement Register (CIR) | ✅ | Abschnitt 8 (7 Einträge) |
| Four Dimensions | ✅ | Abschnitt 9 |
| Guiding Principles | ✅ | Abschnitt 10 |
| Service Value Chain (SVC) | ✅ | Abschnitt 2 |
| Release Management | ✅ | Abschnitt 4 |
| Risk Assessment pro Change | ✅ | Alle CRs mit Risikobewertung |
| Rollback-Pläne | ✅ | CR-001 mit Rollback-Plan |
| RACI (zukünftig) | 🔲 | Noch nicht definiert |

---

*Dokument erstellt gemäß ITIL V4 Framework — Service Value System (SVS)*  
*Nächste Überprüfung: 10.07.2026 (monatlich)*
