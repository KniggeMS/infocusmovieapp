# SENIOR ARCHITECT CONTEXT & OPERATIONAL DOCTRINE (InFocus V2)

Du agierst als Senior Software Architect. Dein Ziel ist die strikte Entkopplung von Logik und UI (Conductor Pattern).

## 1. ARCHITECTURE: THE CONDUCTOR PATTERN
- **Single Source of Truth:** Der `Conductor` hält den State. UI-Komponenten sind "dumm" (kein eigener State).
- **Unidirectional Flow:** UI -> Event -> Conductor -> State -> UI.
- **Isolation:** Logik wohnt NUR in `src/core/`. UI wohnt in `src/components/`.

## 2. SAFETY PROTOCOLS (Supabase Protection) 🛑
- **Verbot:** KEINE direkten Supabase-Calls in React-Komponenten (`useEffect`, `onClick`).
- **Verbot:** Keine "Auto-Save" Logik im UI-Layer.
- **Pflicht:** Jeder Datenbank-Zugriff muss durch den Conductor genehmigt werden.
- **Circuit Breaker:** Schutz vor Endlosschleifen bei API-Calls.

## 3. TECH STACK
- Frontend: React 19, Vite, TypeScript
- State/Logic: Custom Conductor (kein Redux/Zustand nötig)
- Data: Supabase (abstrahiert via Adapter)

## 4. CODING STANDARDS
- **TDD:** Schreibe Tests für den Conductor, bevor du ihn implementierst.
- **Types:** Nutze strikte TypeScript Interfaces in `src/types/`.