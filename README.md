# 🎬 InFocus CineLog

<div align="center">

![Version](https://img.shields.io/badge/version-2.4+-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![PWA](https://img.shields.io/badge/PWA-enabled-5A0FC8?logo=pwa)

**Eine moderne, offline-fähige Progressive Web App zum Tracken von Filmen, Visualisieren von Watchlisten und KI-gestützten Empfehlungen**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Dokumentation](#-dokumentation) • [Contributing](#-contributing)

</div>

---

## 📋 Inhaltsverzeichnis

- [Übersicht](#-übersicht)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architektur](#-architektur)
- [Voraussetzungen](#-voraussetzungen)
- [Installation](#-installation)
- [Konfiguration](#-konfiguration)
- [Entwicklung](#-entwicklung)
- [Deployment](#-deployment)
- [PWA & Mobile](#-pwa--mobile)
- [Projektstruktur](#-projektstruktur)
- [API-Referenz](#-api-referenz)
- [Testing](#-testing)
- [Performance](#-performance)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🎯 Übersicht

**InFocus CineLog** ist eine moderne Progressive Web App, die entwickelt wurde, um die Lücke zwischen Web-Anwendungen und nativen mobilen Erlebnissen zu schließen. Die App ermöglicht es Nutzern, ihre Filme zu tracken, Watchlisten zu verwalten, detaillierte Statistiken über ihre Sehgewohnheiten zu visualisieren und KI-gestützte Filmempfehlungen zu erhalten.

### 🎯 Hauptziele

- **📱 Mobile-First**: Optimiert für mobile Endgeräte mit nativem Look & Feel
- **⚡ Offline-First**: Volle Funktionalität auch ohne Internetverbindung
- **🎨 Modern Design**: Glassmorphism UI mit flüssigen Animationen
- **🔐 Secure**: Supabase Auth mit Row Level Security (RLS)
- **📊 Data-Driven**: Umfassende Statistiken und Visualisierungen

---

## ✨ Features

### 🎬 Film-Management

- **Erweiterte Suche**: Integration mit der TMDB API für Zugriff auf Millionen von Filmen
- **Watch Status**: Markiere Filme als "Gesehen", "Watchlist" oder "Favoriten"
- **Detaillierte Filminfos**: Cast, Crew, Trailer, Budget, Einspielergebnis, etc.
- **Bewertungssystem**: Eigene Bewertungen (1-10) und Notizen hinzufügen
- **Cover & Poster**: Hochauflösende Filmcover automatisch von TMDB

### 📊 Statistiken & Analytics

- **Watchtime-Tracker**: Gesamte Sehdauer in Stunden/Tagen
- **Genre-Analyse**: Prozentuale Verteilung deiner Lieblingsgenres
- **Jahres-Übersicht**: Filme nach Erscheinungsjahr gruppiert
- **Durchschnittsbewertungen**: Deine durchschnittliche Bewertung pro Genre
- **Watching Streaks**: Längste Serien-Marathon-Sessions
- **Top-Listen**: Deine am besten bewerteten Filme, Directors, Actors

### 🤖 KI-Features

- **Smart Recommendations**: Personalisierte Filmempfehlungen basierend auf deinem Profil
- **Genre-Matching**: Algorithmus zur Analyse deiner Präferenzen
- **Mood-Based Discovery**: Finde Filme basierend auf deiner aktuellen Stimmung
- **Similar Movies**: "Wenn dir X gefällt, schau Y"-Vorschläge

### 📱 PWA-Funktionen

- **Installierbar**: Als App auf dem Homescreen installieren
- **Offline-Modus**: Funktioniert vollständig offline nach erstem Laden
- **Push-Benachrichtigungen**: Erinnerungen für Watchlist-Filme (geplant)
- **Background Sync**: Automatische Datensynchronisation im Hintergrund
- **Native Transitions**: Smooth Page-Transitions wie in nativen Apps

### 🔐 Authentifizierung & Sicherheit

- **Supabase Auth**: E-Mail/Passwort oder Magic Link Login
- **Row Level Security**: Jeder Nutzer sieht nur seine eigenen Daten
- **Session Management**: Sichere Token-basierte Sessions
- **Password Reset**: Passwort-Wiederherstellung via E-Mail

---

## 🛠️ Tech Stack

### Frontend

| Technologie | Version | Verwendung |
|------------|---------|------------|
| **React** | 19.x | UI-Framework mit Hooks & Concurrent Features |
| **TypeScript** | 5.0+ | Typsicherheit für das gesamte Projekt |
| **Vite** | 5.x | Blitzschneller Build-Tool & Dev-Server |
| **Tailwind CSS** | 3.x | Utility-First CSS-Framework |
| **Lucide React** | Latest | Icon-Library (700+ Icons) |

### Backend & Infrastructure

| Technologie | Verwendung |
|------------|------------|
| **Supabase** | PostgreSQL Database, Auth, Realtime Subscriptions |
| **TMDB API** | Film-Metadaten, Poster, Trailer, Cast-Infos |
| **Vercel/Netlify** | Hosting & Deployment (empfohlen) |

### Mobile & PWA

| Technologie | Verwendung |
|------------|------------|
| **Vite PWA Plugin** | Service Worker, Manifest, Offline-Caching |
| **Capacitor** | Native Android/iOS Build (optional) |
| **Workbox** | Advanced Caching-Strategien |

### Development Tools

| Tool | Verwendung |
|------|------------|
| **ESLint** | Code-Quality & Linting |
| **Prettier** | Code-Formatting |
| **Vitest** | Unit & Integration Testing |
| **Playwright** | E2E-Testing |
| **Husky** | Git Hooks für Pre-Commit Checks |

---

## 🏗️ Architektur

### Übersicht

InFocus CineLog folgt einer **Clean Architecture** mit klarer Trennung von Verantwortlichkeiten:

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer (React)                      │
│  Components, Pages, Hooks, Routing                      │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│              Conductor (State Management)                │
│  Business Logic, State Orchestration                    │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│                Service Layer                             │
│  AuthService, MovieService, TMDBService                 │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│              External APIs & Database                    │
│  Supabase (PostgreSQL), TMDB API                        │
└─────────────────────────────────────────────────────────┘
```

### 🎭 Conductor Pattern

Das **Conductor Pattern** ist das Herzstück der App-Architektur:

```typescript
// Conductor orchestriert den gesamten App-State
class Conductor {
  private authService: AuthService
  private movieService: MovieService
  
  // Zentrale State-Management-Methoden
  async initialize(): Promise<void>
  async login(email: string, password: string): Promise<void>
  async addMovie(movie: Movie): Promise<void>
  async updateWatchStatus(id: string, status: WatchStatus): Promise<void>
  
  // Observable State für React-Integration
  getState$(): Observable<AppState>
}
```

#### Vorteile:

✅ **Klare Verantwortlichkeiten**: UI-Komponenten sind "dumm", Business-Logic im Conductor  
✅ **Testbarkeit**: Conductor kann isoliert ohne UI getestet werden  
✅ **Kein Prop-Drilling**: Zentraler State via Context/Provider  
✅ **Wiederverwendbarkeit**: Services können in anderen Projekten genutzt werden  

### 🔄 Singleton Supabase Client

**Problem in Version <2.4:**
```typescript
// ❌ Mehrere Instanzen führten zu Auth-Sync-Problemen
const supabase1 = createClient(url, key) // in AuthService
const supabase2 = createClient(url, key) // in MovieService
```

**Lösung ab Version 2.4+:**
```typescript
// ✅ Eine zentrale Singleton-Instanz
// src/lib/supabase.ts
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Überall im Projekt verwenden
import { supabase } from '@/lib/supabase'
```

#### Vorteile:

✅ **Keine "Multiple GoTrueClient"-Warnungen mehr**  
✅ **Konsistenter Auth-State** über die gesamte App  
✅ **Reduzierter Connection-Overhead**  
✅ **Einfachere Konfiguration** an einer zentralen Stelle  

### 📦 Service-Layer-Design

```typescript
// AuthService: Zuständig für Authentication
class AuthService {
  async login(email: string, password: string): Promise<User>
  async logout(): Promise<void>
  async getSession(): Promise<Session | null>
  onAuthStateChange(callback: (user: User | null) => void): Unsubscribe
}

// MovieService: Zuständig für Movie-Operationen
class SupabaseMovieService implements MovieService {
  async getMovies(userId: string): Promise<Movie[]>
  async addMovie(movie: Movie): Promise<Movie>
  async updateMovie(id: string, updates: Partial<Movie>): Promise<Movie>
  async deleteMovie(id: string): Promise<void>
  async searchTMDB(query: string): Promise<TMDBMovie[]>
}
```

---

## 📋 Voraussetzungen

Stelle sicher, dass folgende Software installiert ist:

- **Node.js**: Version 18.x oder höher ([Download](https://nodejs.org/))
- **npm**: Version 9.x oder höher (kommt mit Node.js)
- **Git**: Für Versionskontrolle ([Download](https://git-scm.com/))
- **Supabase Account**: Kostenloser Account unter [supabase.com](https://supabase.com)
- **TMDB API Key**: Kostenloser Key unter [themoviedb.org](https://www.themoviedb.org/settings/api)

### Versionen prüfen

```bash
node --version   # sollte v18.0.0 oder höher sein
npm --version    # sollte 9.0.0 oder höher sein
git --version    # beliebige Version
```

---

## 🚀 Installation

### 1. Repository klonen

```bash
git clone https://github.com/IhrUsername/infocusmovieapp.git
cd infocusmovieapp
```

### 2. Dependencies installieren

```bash
npm install
```

Dies installiert alle benötigten Pakete aus der `package.json`.

### 3. Supabase-Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com) und erstelle ein neues Projekt
2. Wähle eine Region (z.B. `eu-central-1` für Europa)
3. Setze ein sicheres Datenbank-Passwort

### 4. Datenbank-Schema einrichten

Führe folgendes SQL-Script in deinem Supabase SQL-Editor aus:

```sql
-- Movies Table
CREATE TABLE movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tmdb_id INTEGER,
  title TEXT NOT NULL,
  original_title TEXT,
  overview TEXT,
  poster_path TEXT,
  backdrop_path TEXT,
  release_date DATE,
  runtime INTEGER,
  genres JSONB,
  vote_average DECIMAL(3,1),
  popularity DECIMAL(10,3),
  
  -- User-spezifische Felder
  watch_status TEXT CHECK (watch_status IN ('watched', 'watchlist', 'favorite')),
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 10),
  notes TEXT,
  watched_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes für Performance
CREATE INDEX idx_movies_user_id ON movies(user_id);
CREATE INDEX idx_movies_tmdb_id ON movies(tmdb_id);
CREATE INDEX idx_movies_watch_status ON movies(watch_status);

-- Row Level Security aktivieren
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

-- Policy: User kann nur eigene Movies sehen
CREATE POLICY "Users can view own movies" 
  ON movies FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: User kann eigene Movies erstellen
CREATE POLICY "Users can create own movies" 
  ON movies FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy: User kann eigene Movies updaten
CREATE POLICY "Users can update own movies" 
  ON movies FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy: User kann eigene Movies löschen
CREATE POLICY "Users can delete own movies" 
  ON movies FOR DELETE 
  USING (auth.uid() = user_id);

-- Updated_at Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_movies_updated_at 
  BEFORE UPDATE ON movies 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

### 5. TMDB API Key erhalten

1. Erstelle einen Account auf [themoviedb.org](https://www.themoviedb.org/signup)
2. Gehe zu **Settings → API**
3. Beantrage einen API Key (kostenlos)
4. Kopiere den **API Key (v3 auth)**

---

## ⚙️ Konfiguration

### Environment Variables

Erstelle eine `.env`-Datei im Root-Verzeichnis:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# TMDB API
VITE_TMDB_API_KEY=your-tmdb-api-key-here

# Optional: Environment
VITE_ENV=development
```

### Wo finde ich die Supabase-Credentials?

1. Gehe zu deinem Supabase-Projekt
2. Klicke auf **Settings → API**
3. Kopiere:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

⚠️ **Wichtig**: Die `.env`-Datei steht in `.gitignore` und sollte NIEMALS committed werden!

### Beispiel `.env.example`

Erstelle eine `.env.example` als Template:

```env
# Copy this file to .env and fill in your actual values

VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
VITE_TMDB_API_KEY=xxxxx
```

---

## 💻 Entwicklung

### Development Server starten

```bash
npm run dev
```

Die App läuft nun unter: **http://localhost:5173**

### Verfügbare Scripts

| Command | Beschreibung |
|---------|--------------|
| `npm run dev` | Startet Vite Dev-Server mit Hot-Reload |
| `npm run build` | Production Build erstellen |
| `npm run preview` | Production Build lokal testen |
| `npm run lint` | ESLint ausführen |
| `npm run lint:fix` | ESLint mit Auto-Fix |
| `npm run format` | Prettier Code-Formatting |
| `npm run type-check` | TypeScript Type-Checking |
| `npm run test` | Vitest Unit-Tests ausführen |
| `npm run test:e2e` | Playwright E2E-Tests |

### Hot Module Replacement (HMR)

Vite unterstützt HMR out-of-the-box. Änderungen werden sofort im Browser reflektiert ohne Full-Reload.

### TypeScript-Konfiguration

Die `tsconfig.json` ist optimiert für React 19:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Tailwind CSS Konfiguration

Die `tailwind.config.js` enthält Custom-Extensions für Glassmorphism:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0))',
      }
    }
  }
}
```

---

## 🚢 Deployment

### Vercel (Empfohlen)

1. **Vercel CLI installieren**:
   ```bash
   npm install -g vercel
   ```

2. **Projekt deployen**:
   ```bash
   vercel
   ```

3. **Environment Variables setzen**:
   - Gehe zu **Vercel Dashboard → Settings → Environment Variables**
   - Füge alle `.env`-Variablen hinzu

4. **Production Deployment**:
   ```bash
   vercel --prod
   ```

### Netlify

1. **Netlify CLI installieren**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Build und Deploy**:
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. **Environment Variables** in Netlify Dashboard unter **Site Settings → Environment Variables** setzen

### Docker (Optional)

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build und Run:
```bash
docker build -t infocus-cinelog .
docker run -p 80:80 infocus-cinelog
```

---

## 📱 PWA & Mobile

### PWA Installation

Die App kann auf jedem Gerät als PWA installiert werden:

**Desktop (Chrome/Edge):**
1. Klicke auf das **⊕ Install**-Icon in der Adressleiste
2. Oder: **Menü → App installieren**

**Mobile (Android/iOS):**
1. Öffne die App im Browser
2. **Android**: Tippe auf **Menü → Zum Startbildschirm hinzufügen**
3. **iOS**: Tippe auf **Teilen → Zum Home-Bildschirm**

### Service Worker

Der Service Worker cached automatisch:
- **App Shell**: HTML, CSS, JS
- **Bilder**: Poster, Backdrops (Cache-First-Strategie)
- **API-Responses**: TMDB-Daten (Network-First mit Fallback)

### Offline-Funktionalität

Die App funktioniert vollständig offline:
- ✅ Alle gespeicherten Filme sind verfügbar
- ✅ Statistiken werden lokal berechnet
- ✅ Neue Filme können hinzugefügt werden (Background Sync)
- ❌ TMDB-Suche erfordert Internet (wird als Fallback deaktiviert)

### Native App mit Capacitor (Optional)

1. **Capacitor installieren**:
   ```bash
   npm install @capacitor/core @capacitor/cli
   npm install @capacitor/android @capacitor/ios
   ```

2. **Capacitor initialisieren**:
   ```bash
   npx cap init
   ```

3. **Android Build**:
   ```bash
   npm run build
   npx cap add android
   npx cap sync
   npx cap open android
   ```

4. **iOS Build** (nur auf macOS):
   ```bash
   npm run build
   npx cap add ios
   npx cap sync
   npx cap open ios
   ```

---

## 📂 Projektstruktur

```
infocusmovieapp/
├── public/                      # Statische Assets
│   ├── pwa-icon-512.png        # PWA Icon (512x512)
│   ├── pwa-icon-192.png        # PWA Icon (192x192)
│   ├── manifest.json           # PWA Manifest
│   └── robots.txt
│
├── src/
│   ├── core/                   # 🧠 Kern der Anwendung
│   │   ├── conductor/
│   │   │   ├── Conductor.ts    # Zentrale State-Management-Logik
│   │   │   ├── ConductorContext.tsx  # React Context Provider
│   │   │   └── useConductor.ts       # React Hook
│   │   └── config/
│   │       └── constants.ts    # App-weite Konstanten
│   │
│   ├── services/               # 🔌 API-Adapter & Business Logic
│   │   ├── AuthService.ts      # Supabase Authentication
│   │   ├── MovieService.ts     # Interface Definition
│   │   ├── SupabaseMovieService.ts  # Supabase Implementation
│   │   └── TMDBService.ts      # TMDB API Integration
│   │
│   ├── lib/                    # 🛠️ Infrastructure & Utilities
│   │   ├── supabase.ts         # ✨ Singleton Supabase Client
│   │   └── utils.ts            # Helper-Funktionen
│   │
│   ├── types/                  # 📝 TypeScript Definitionen
│   │   ├── domain.ts           # Domain Models (Movie, User, etc.)
│   │   ├── auth.ts             # Auth-bezogene Types
│   │   └── supabase.ts         # Supabase-spezifische Types
│   │
│   ├── components/             # 🎨 React Components
│   │   ├── ui/                 # Wiederverwendbare UI-Komponenten
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   ├── features/           # Feature-spezifische Komponenten
│   │   │   ├── MovieCard.tsx
│   │   │   ├── MovieList.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── StatisticsChart.tsx
│   │   └── layout/             # Layout-Komponenten
│   │       ├── Header.tsx
│   │       ├── Navigation.tsx
│   │       └── Footer.tsx
│   │
│   ├── pages/                  # 📄 Seiten/Views
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Movies.tsx
│   │   ├── Statistics.tsx
│   │   └── Profile.tsx
│   │
│   ├── hooks/                  # 🪝 Custom React Hooks
│   │   ├── useAuth.ts
│   │   ├── useMovies.ts
│   │   └── useDebounce.ts
│   │
│   ├── styles/                 # 🎨 Global Styles
│   │   └── globals.css
│   │
│   ├── App.tsx                 # Main App Component
│   ├── main.tsx                # Entry Point
│   └── vite-env.d.ts           # Vite Type Definitions
│
├── .env                        # Environment Variables (nicht committen!)
├── .env.example                # Environment Template
├── .gitignore
├── package.json
├── tsconfig.json               # TypeScript Config
├── tailwind.config.js          # Tailwind Config
├── vite.config.ts              # Vite Config
├── postcss.config.js           # PostCSS Config
└── README.md
```

### 🗂️ Ordner-Konventionen

- **`/core`**: Enthält die Business-Logic. Hier sollte KEIN React-Code sein (außer Context/Provider)
- **`/services`**: Reine Data-Access-Layer. Keine UI-Logik
- **`/components`**: Nur Präsentations-Komponenten. Business-Logic via Props/Hooks
- **`/pages`**: Container-Komponenten die Services/Conductor nutzen
- **`/hooks`**: Custom Hooks für wiederverwendbare Logik

---

## 🔌 API-Referenz

### AuthService

```typescript
class AuthService {
  /**
   * Login mit E-Mail und Passwort
   */
  async login(email: string, password: string): Promise<{
    user: User
    session: Session
  }>

  /**
   * Registrierung eines neuen Users
   */
  async signUp(email: string, password: string): Promise<{
    user: User
    session: Session
  }>

  /**
   * Logout
   */
  async logout(): Promise<void>

  /**
   * Aktuelle Session abrufen
   */
  async getSession(): Promise<Session | null>

  /**
   * Auth-State-Änderungen abonnieren
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void
}
```

### MovieService

```typescript
interface MovieService {
  /**
   * Alle Filme eines Users laden
   */
  getMovies(userId: string): Promise<Movie[]>

  /**
   * Einzelnen Film abrufen
   */
  getMovie(id: string): Promise<Movie | null>

  /**
   * Neuen Film hinzufügen
   */
  addMovie(movie: Omit<Movie, 'id' | 'created_at'>): Promise<Movie>

  /**
   * Film aktualisieren
   */
  updateMovie(id: string, updates: Partial<Movie>): Promise<Movie>

  /**
   * Film löschen
   */
  deleteMovie(id: string): Promise<void>

  /**
   * TMDB durchsuchen
   */
  searchTMDB(query: string): Promise<TMDBMovie[]>

  /**
   * Film-Details von TMDB
   */
  getTMDBDetails(tmdbId: number): Promise<TMDBMovieDetails>
}
```

### Conductor

```typescript
class Conductor {
  /**
   * App initialisieren (Auth-Check, etc.)
   */
  async initialize(): Promise<void>

  /**
   * Login
   */
  async login(email: string, password: string): Promise<void>

  /**
   * Film zur Collection hinzufügen
   */
  async addMovie(tmdbId: number, watchStatus: WatchStatus): Promise<void>

  /**
   * Watch-Status ändern
   */
  async updateWatchStatus(movieId: string, status: WatchStatus): Promise<void>

  /**
   * Film bewerten
   */
  async rateMovie(movieId: string, rating: number): Promise<void>

  /**
   * Statistiken abrufen
   */
  getStatistics(): Statistics

  /**
   * App-State als Observable
   */
  getState$(): Observable<AppState>
}
```

---

## 🧪 Testing

### Unit Tests (Vitest)

```bash
# Alle Tests ausführen
npm run test

# Watch-Mode
npm run test:watch

# Coverage-Report
npm run test:coverage
```

Beispiel-Test:

```typescript
import { describe, it, expect } from 'vitest'
import { Conductor } from '@/core/conductor/Conductor'

describe('Conductor', () => {
  it('should calculate correct statistics', () => {
    const conductor = new Conductor()
    // Test-Logic
  })
})
```

### E2E Tests (Playwright)

```bash
# E2E Tests ausführen
npm run test:e2e

# UI-Mode
npm run test:e2e:ui
```

Beispiel E2E-Test:

```typescript
import { test, expect } from '@playwright/test'

test('user can add movie to watchlist', async ({ page }) => {
  await page.goto('http://localhost:5173')
  await page.click('[data-testid="search-button"]')
  await page.fill('[data-testid="search-input"]', 'Inception')
  await page.click('[data-testid="add-to-watchlist"]')
  
  await expect(page.locator('[data-testid="watchlist-count"]')).toHaveText('1')
})
```

---

## ⚡ Performance

### Lighthouse Score (Ziel)

- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 95+
- **SEO**: 100
- **PWA**: ✓

### Optimierungen

- ✅ **Code-Splitting**: Automatisch via Vite/React.lazy
- ✅ **Image Optimization**: TMDB-Bilder werden lazy-loaded
- ✅ **Tree-Shaking**: Ungenutzter Code wird entfernt
- ✅ **Minification**: CSS/JS wird minifiziert
- ✅ **Caching**: Aggressive Service-Worker-Strategien
- ✅ **Preload**: Kritische Resources werden preloaded

### Bundle Size

```bash
# Bundle-Größe analysieren
npm run build
npx vite-bundle-visualizer
```

Ziel: **< 200 KB** (gzipped) für Initial-Bundle

---

## 🐛 Troubleshooting

### Problem: "Multiple GoTrueClient instances detected"

**Lösung**: Stelle sicher, dass du Version 2.4+ verwendest und überall den Singleton-Client importierst:

```typescript
// ✅ Richtig
import { supabase } from '@/lib/supabase'

// ❌ Falsch
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(url, key)
```

### Problem: TMDB-Bilder laden nicht

**Mögliche Ursachen**:
1. **CORS-Problem**: TMDB erlaubt Cross-Origin. Prüfe Console auf Fehler
2. **Falscher Image-Path**: TMDB-Paths sind relativ. Stelle sicher, dass du `https://image.tmdb.org/t/p/original/uxzzxijgPIY7slzFvMotPv8wjKA.jpg` voranstellst

```typescript
// ✅ Richtig
const posterUrl = `https://image.tmdb.org/t/p/original/rzRb63TldOKdKydCvWJM8B6EkPM.jpg`

// ❌ Falsch
const posterUrl = movie.poster_path
```

### Problem: App funktioniert nicht offline

**Lösung**:
1. Prüfe ob Service Worker registriert ist: DevTools → Application → Service Workers
2. Checke Caching-Strategien in `vite.config.ts`
3. Stelle sicher, dass die App mindestens einmal online geladen wurde

### Problem: Supabase RLS blockiert Zugriff

**Lösung**: Überprüfe deine RLS-Policies:

```sql
-- Debug: Temporär RLS deaktivieren (NUR FÜR TESTS!)
ALTER TABLE movies DISABLE ROW LEVEL SECURITY;

-- Prüfe ob User eingeloggt ist
SELECT auth.uid(); -- sollte eine UUID zurückgeben
```

### Problem: Build schlägt fehl

**Häufige Ursachen**:
1. **TypeScript-Fehler**: `npm run type-check`
2. **Fehlende Env-Vars**: Prüfe ob `.env` alle Variablen enthält
3. **Dependency-Konflikte**: `rm -rf node_modules && npm install`

---

## 🤝 Contributing

Beiträge sind willkommen! Bitte folge diesen Guidelines:

### 1. Fork & Clone

```bash
git clone https://github.com/YourUsername/infocusmovieapp.git
cd infocusmovieapp
git remote add upstream https://github.com/OriginalOwner/infocusmovieapp.git
```

### 2. Branch erstellen

```bash
git checkout -b feature/amazing-new-feature
```

Branch-Naming-Convention:
- `feature/` - Neue Features
- `fix/` - Bugfixes
- `docs/` - Dokumentation
- `refactor/` - Code-Refactoring

### 3. Entwickeln & Testen

```bash
# Code schreiben
npm run dev

# Tests ausführen
npm run test
npm run lint

# Build testen
npm run build
npm run preview
```

### 4. Commit

Wir verwenden [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add genre filter to movie list"
git commit -m "fix: resolve login redirect loop"
git commit -m "docs: update installation guide"
```

### 5. Pull Request

1. Push zu deinem Fork: `git push origin feature/amazing-new-feature`
2. Öffne einen Pull Request auf GitHub
3. Beschreibe deine Änderungen detailliert
4. Warte auf Review

### Code-Style

- **ESLint**: Wird automatisch via Pre-Commit-Hook geprüft
- **Prettier**: Formatierung erfolgt automatisch
- **TypeScript**: Strict-Mode ist aktiviert, keine `any`-Types

---

## 🗺️ Roadmap

### Version 3.0 (Q2 2026)

- [ ] **Social Features**: Filme mit Freunden teilen
- [ ] **Watchlist-Gruppen**: Gemeinsame Watchlists
- [ ] **Advanced Recommendations**: ML-basierte Empfehlungen
- [ ] **Streaming-Integration**: Zeige wo Filme verfügbar sind
- [ ] **Dark/Light Mode**: Theme-Switcher

### Version 2.5 (Q1 2026)

- [ ] **Export-Feature**: Daten als CSV/JSON exportieren
- [ ] **Import von Letterboxd/IMDb**: Migration von anderen Plattformen
- [ ] **Push-Benachrichtigungen**: Erinnerungen für Watchlist
- [ ] **Trailer-Integration**: YouTube-Trailer direkt in der App

### Backlog

- [ ] **Desktop-App**: Electron-Wrapper für native Desktop-Experience
- [ ] **Browser-Extension**: Chrome/Firefox-Extension
- [ ] **API für Drittanbieter**: Public API für Entwickler
- [ ] **Multi-Language**: i18n-Support (DE, EN, FR, ES)

---

## 📄 License

MIT License

Copyright (c) 2026 InFocus CineLog

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 🙏 Acknowledgments

- **Supabase**: Für die fantastische BaaS-Plattform
- **TMDB**: Für die umfassende Film-API
- **Vite**: Für den blitzschnellen Build-Tool
- **React Team**: Für React 19 und die neuen Concurrent Features
- **Tailwind Labs**: Für das großartige CSS-Framework

---

## 📞 Support & Contact

- **GitHub Issues**: [Issues](https://github.com/IhrUsername/infocusmovieapp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/IhrUsername/infocusmovieapp/discussions)
- **Email**: support@infocuscinelog.app
- **Twitter**: [@InFocusCineLog](https://twitter.com/InFocusCineLog)

---

<div align="center">

**Entwickelt mit ❤️ und ☕**

[⬆ Zurück nach oben](#-infocus-cinelog)

</div>
