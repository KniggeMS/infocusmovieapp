# Tech Stack: InFocus

## Frontend
- **Framework:** React 19 (TypeScript)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (Netflix-style dark theme)
- **State Management:** Custom Conductor Pattern (Unidirectional Flow)
- **i18n:** react-i18next (Multi-language support: DE/EN)
- **Icons:** Lucide React
- **Charts:** Recharts

## Backend & Data
- **Platform:** Supabase (Auth, PostgreSQL, RLS)
- **Database:** PostgreSQL with `movies` and `profiles` tables.
- **External APIs:** 
  - TMDB (Primary source for movie/TV data)
  - OMDb (Fallback for missing titles)

## Infrastructure
- **Deployment:** Vercel (Production)
- **PWA:** Vite PWA Plugin (Offline capabilities, Splash screens)
- **Mobile:** Capacitor (Android/iOS builds)
