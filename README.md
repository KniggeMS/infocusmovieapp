# InFocus CineLog V2 (Hybrid Mobile App)

InFocus CineLog is a modern, AI-powered watchlist application designed for film enthusiasts. It leverages a hybrid architecture to run seamlessly on the web and as a native Android application.

## ⚡ Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS (Custom Glassmorphism Design System)
- **State Management:** Custom **Conductor Pattern** (No Redux/Context hell)
- **Backend / Database:** Supabase (PostgreSQL)
- **Data Source:** TMDB (The Movie Database) API
- **Mobile Runtime:** Capacitor (Android)

## 🏗️ Architecture: The Conductor Pattern

V2.0 introduces a strict separation of concerns to ensure stability and scalability:

1.  **The Conductor (`src/core/conductor/`):**
    - The "Brain" of the application.
    - Holds the `WatchlistState`.
    - Processes `UserIntents` (e.g., `LOAD_MOVIES`, `ADD_MOVIE`).
    - Handles "Loop of Death" protection and Optimistic UI updates.

2.  **The View (`src/components/` & `App.tsx`):**
    - "Dumb" components that only render props.
    - Subscribes to the Conductor to receive state updates.
    - Dispatches intents via `conductor.dispatch()`.

3.  **The Adapters (`src/services/`):**
    - Abstraction layer for API calls (Supabase/TMDB).
    - Ensures the core logic remains independent of specific backend implementations.

## ✨ Features

- **📱 Native Android App:** Built with Capacitor for a native feel.
- **🧠 Smart Search:** Integrated with TMDB for real-time movie data (Posters, Ratings, Release Dates).
- **☁️ Cloud Sync:** All data is synced in real-time via Supabase.
- **🎨 Glassmorphism UI:** A beautiful, dark-themed UI with glass effects, designed for modern mobile displays.
- **🔐 Secure Auth:** Full Email/Password authentication with Role-Based Access Control (RBAC).
- **🛡️ Data Privacy:** Row-Level Security (RLS) ensures users only see and edit their own data.
- **❤️ Favorites & Watched:** Organize your collection with dedicated filters and status tracking.
- **🏆 Gamification System:** Unlockable achievements ('First Blood', 'Collector', etc.) to make tracking fun.
- **🛡️ Duplicate Protection:** Prevents adding the same movie twice.
- **🎬 Deep Dive:** Full Cast, Crew & Plot Details.
- **📺 Streaming Guide:** Watch Providers (Netflix, Amazon, etc.) via JustWatch.
- **✨ Polished UI:** Custom App Icon & Splash Screen.

## 🚀 Getting Started

### Prerequisites
- Node.js & npm
- Supabase Project (URL & Anon Key)
- TMDB API Key

### Database Setup (SQL)
Run the migration file `supabase/migrations/20251231_setup_rls.sql` in your Supabase SQL Editor to:
1. Enable Row-Level Security (RLS).
2. Create Policies for User-Data isolation.
3. Add the `user_id` column to the movies table.

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment (`.env`):
    ```env
    VITE_SUPABASE_URL=your_url
    VITE_SUPABASE_ANON_KEY=your_key
    VITE_TMDB_API_KEY=your_key
    VITE_APP_URL=https://your-production-url.com (Optional, for Auth Redirects)
    ```
4.  Run Development Server:
    ```bash
    npm run dev
    ```

### Build for Android

1.  Build the web assets:
    ```bash
    npm run build
    ```
2.  Sync with Capacitor:
    ```bash
    npx cap sync
    ```
3.  Open in Android Studio:
    ```bash
    npx cap open android
    ```
