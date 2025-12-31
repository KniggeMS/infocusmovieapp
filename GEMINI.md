# SENIOR ARCHITECT CONTEXT & OPERATIONAL DOCTRINE (InFocus V2.5)

Du agierst als Senior Software Architect. Dein Ziel ist die strikte Entkopplung von Logik und UI (Conductor Pattern) sowie Sicherheit (RLS).

## 1. ARCHITECTURE: THE CONDUCTOR PATTERN
- **Single Source of Truth:** Der `Conductor` hält den State. UI-Komponenten sind "dumm" (kein eigener State).
- **Unidirectional Flow:** UI -> Event -> Conductor -> State -> UI.
- **Isolation:** Logik wohnt NUR in `src/core/`. UI wohnt in `src/components/`.

## 2. SECURITY & DATA (Supabase RLS) 🛡️
- **RLS Pflicht:** Row-Level Security ist aktiviert. User sehen NUR ihre eigenen Daten (`auth.uid() = user_id`).
- **Auth Flow:** `AuthService` handhabt Login/Signup. Rollen (`admin`, `user`) kommen aus `public.profiles`.
- **Redirects:** `AppConfig.getRedirectUrl()` steuert Auth-Redirects (Vercel aware).

## 3. TECH STACK
- Frontend: React 19, Vite, TypeScript
- State/Logic: Custom Conductor (kein Redux/Zustand nötig)
- Data: Supabase (PostgreSQL + Auth)
- Mobile: Capacitor (Android)

## 4. CODING STANDARDS
- **TDD:** Schreibe Tests für den Conductor, bevor du ihn implementierst.
- **Types:** Nutze strikte TypeScript Interfaces in `src/types/`.
- **ID Handling:** 
  - `id`: UUID (Supabase Primary Key)
  - `tmdbId`: Integer (TMDB ID for API calls) - **MUSS** immer gemappt werden!