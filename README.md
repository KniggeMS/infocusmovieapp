# InFocus CineLog

**InFocus CineLog** is a modern, offline-capable Progressive Web App (PWA) designed for tracking movies, visualizing watch habits with statistics, and discovering new content via AI-powered recommendations. It is built to bridge the gap between a web application and a native mobile experience.

## ⚡ Tech Stack

This project leverages a cutting-edge stack for performance and developer experience:

*   **Core:** React 19, TypeScript
*   **Build Tool:** Vite 5
*   **Styling:** Tailwind CSS (Glassmorphism Design)
*   **Backend:** Supabase (PostgreSQL, Auth, Realtime)
*   **PWA/Mobile:** Vite PWA Plugin, Capacitor (Android)
*   **Icons:** Lucide React

## 🏗️ Architecture

### Singleton Supabase Client (`src/lib/supabase.ts`)

A key architectural improvement in version 2.4+ is the implementation of the **Singleton Pattern** for the Supabase client.

*   **Problem:** Previous versions instantiated `createClient` in multiple services (`AuthService`, `MovieService`). This led to "Multiple GoTrueClient instances detected" warnings and potential race conditions where the authentication state became out of sync.
*   **Solution:** We now export a single, shared `supabase` instance from `src/lib/supabase.ts`.
*   **Benefit:** This ensures a stable, unified authentication state across the entire application and eliminates redundant connection overhead.

### Conductor Pattern (`src/core/conductor`)

The application state is managed by a custom "Conductor". This pattern strictly separates business logic from UI components, making the application easier to test and reducing "prop drilling".

## 📱 PWA & Mobile Features

*   **Installable:** The app includes a complete `manifest.json` and high-resolution icons (`/public/pwa-icon-512.png`), allowing it to be installed on home screens.
*   **Offline-First:** Critical data is managed locally, ensuring the UI remains responsive even with poor network connectivity.
*   **Native Feel:** The bottom navigation and splash screen are optimized for a native-like experience on mobile devices.

## 📂 Project Structure

*   **`/src/core`**: The brain of the app. Contains the `Conductor` (State Management) and core configuration.
*   **`/src/services`**: API adapters. `AuthService` and `SupabaseMovieService` reside here, handling external communication.
*   **`/src/lib`**: Central infrastructure. Contains the singleton `supabase.ts` client.
*   **`/src/types`**: TypeScript interfaces (`domain.ts`, `auth.ts`, `supabase.ts`) ensuring type safety across the stack.
*   **`/public`**: Static assets like PWA icons and the manifest file.

## 🚀 Getting Started

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Setup:**
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_project_url
    VITE_SUPABASE_ANON_KEY=your_anon_key
    VITE_TMDB_API_KEY=your_tmdb_key
    ```

3.  **Run Development Server:**
    ```bash
    npm run dev
    ```

4.  **Build for Production:**
    ```bash
    npm run build
    ```