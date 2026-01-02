# Changelog

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
