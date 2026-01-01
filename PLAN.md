## ⚠️ CRITICAL BLOCKERS
- [ ] **Supabase Sync Failure:** '404 movies not found' (Local Cache mismatch) -> Priorität: Hoch.
- [x] **Mobile Detail Modal:** Add-Button (Regression V2.6) fixed via Z-Index & Layout Audit.

## Arbeitsweise
- Jeder UI-Fix erfordert eine Computer Use Simulation (Layout-Audit).

## 🚧 In Progress (Phase 3: Engagement)
- [x] **Gamification:** Re-implement Achievements and XP system.
- [x] **Statistics (Charts):** Visual Charts for watching habits (Genres, Watch time).
- [x] **App Branding (Splash & Icons):** Professional start-up experience.
- [x] **FIX: TMDB ID Persistence (Schema Update)**: Ensures local movies can fetch online details.
- [x] **AI Recommendations (via TMDB):** Discovery Feature with direct add-to-watchlist.
- [x] **User Management (Auth & Roles):** Secure access, Admin badges, and Production Redirects.
- [x] **Security (RLS):** Row-Level Security policies for Multi-User support.
- [x] **Refactoring & UI Polish:** Code Cleanup, Singleton Client, Normalized Navigation.

## ✅ Phase 8: Production Deployment
- [x] **Vercel Setup:** Connect Repo & Configure Build Settings.
- [x] **Environment Variables:** Set VITE_SUPABASE_URL, ANON_KEY, TMDB_KEY & VITE_APP_URL in Vercel.
- [x] **Supabase Whitelist:** Ensure Vercel domains are allowed in Auth Settings.
- [x] **Final Smoke Test:** Verify Auth flow & TMDB connection in Production environment.

## ✅ Phase 9: Movie Detail Polish
- [x] **UI Fix:** Netflix-style Hero Header (Backdrop instead of cropped poster).
- [x] **Trailer Integration:** YouTube Trailer support (Background Autoplay Muted + Modal toggle).

## 🚧 Phase 10: Internationalization (i18n)
- [x] **Setup:** react-i18next & Language Detector.
- [x] **UI:** Language Toggle (DE/EN) on Auth/Login Screen.
- [x] **Mobile UI:** Accessibility Fix for Modal Buttons (Mobile Viewport).
- [ ] **Content & Testing:** Translate common strings & verify mobile layouts.

## ⚠️ Next Steps (Prioritized)
1. [ ] **FIX: Backend Local Sync:** Debug Supabase 404 errors.
2. [ ] **VERIFY: i18n:** Complete translation audit.
3. [ ] **Deploy:** Phase 11.

## 📋 Backlog
- [x] **Cast & Crew:** Detailed view for actors and directors.
- [x] **Streaming Providers:** "Where to watch" integration (JustWatch API).
- [ ] **Social Features:** Share lists with friends.
- [ ] **Unit Testing:** Increase coverage for Conductor and Services.

---
**Global Status:** 🔵 Phase 10: i18n & Mobile UI Fixes (V2.6.2)
**Session Note:** Mobile UI fixed (Z-Index). Login Screen localized. Critical backend issue (404s) remains active.