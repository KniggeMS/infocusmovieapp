# Changelog

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
