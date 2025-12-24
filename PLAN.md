# MASTER PLAN: InFocus CineLog V2 (Conductor Core)

## Phase 1: The Contract (Interfaces & Types)
- [ ] **Task 1:** Erstelle `src/types/domain.ts`. Definiere `Movie`, `WatchlistState` und `UserIntent`.
- [ ] **Task 2:** Definiere `MovieServiceAdapter` Interface (Abstraktion von Supabase).

## Phase 2: The Brain (Conductor Logic)
- [ ] **Task 3:** Erstelle `tests/conductor.test.ts` (TDD: Teste State-Changes ohne UI).
- [ ] **Task 4:** Implementiere `src/core/conductor/MovieConductor.ts`.

## Phase 3: The Data Layer (Mock First)
- [ ] **Task 5:** Implementiere `MockMovieService` (für Entwicklung ohne Quota-Verbrauch).
- [ ] **Task 6:** Implementiere echten `SupabaseService`.

## Phase 4: The View (Dumb UI)
- [ ] **Task 7:** Baue UI-Komponenten, die nur Props empfangen.
- [ ] **Task 8:** Verbinde UI mit Conductor (`App.tsx`).