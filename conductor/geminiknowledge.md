# Gemini CLI Knowledge Base & Operator Manual

Dieses Dokument beschreibt umfassend die Fähigkeiten, Werkzeuge und Erweiterungen des Gemini CLI Agenten in diesem Projekt. Nutze es, um das volle Potenzial der KI-gestützten Entwicklung auszuschöpfen.

---

## 1. Core Capabilities (Die Basis-Werkzeuge)

Diese Werkzeuge stehen immer zur Verfügung und bilden das Rückgrat der Interaktion.

### 📂 Dateisystem & Navigation
| Tool | Beschreibung & Best Practice |
| :--- | :--- |
| **`list_directory`** | Listet Dateien auf. Nutze ich, um mich zu orientieren. |
| **`read_file`** | Liest Dateiinhalt. **Wichtig:** Ich lese oft erst, bevor ich schreibe, um Kontext zu verstehen. |
| **`search_file_content`** | Mächtige `ripgrep`-Suche. Ideal, um Verwendungen von Funktionen, Variablen oder Strings im gesamten Projekt zu finden. |
| **`glob`** | Findet Dateien anhand von Mustern (z.B. `**/*.test.ts`). |
| **`replace`** | **Das chirurgische Skalpell.** Ersetzt Textblöcke präzise. Ich benötige dafür den exakten `old_string` (3 Zeilen Kontext). Das ist sicherer als komplettes Überschreiben. |
| **`write_file`** | Erstellt neue Dateien oder überschreibt existierende komplett. |

### 💻 Shell & System
| Tool | Beschreibung |
| :--- | :--- |
| **`run_shell_command`** | Führt Befehle aus (PowerShell auf Windows). Ich nutze dies für: <br>• `npm run build` (Validierung)<br>• `git ...` (Version Control)<br>• `npx playwright ...` (Testing)<br>• Dateisystem-Checks (`dir`, `where`). |

### 🌐 Web & Wissen
| Tool | Beschreibung |
| :--- | :--- |
| **`google_web_search`** | Sucht aktuelle Infos im Web (z.B. Dokumentation, Bug-Fixes für neue Library-Versionen). |
| **`web_fetch`** | Liest den Inhalt einer URL (z.B. einen Blogpost oder eine Docs-Seite), um den Kontext zu verstehen. |
| **`save_memory`** | Speichert Fakten in mein Langzeitgedächtnis (z.B. "User bevorzugt Tailwind", "Pfad zu Logs ist X"). |

---

## 2. Active Extensions (Die Spezialkräfte)

Das Projekt ist mit leistungsstarken MCP-Servern (Model Context Protocol) ausgestattet.

### 🐘 Supabase (Database & Backend)
Wir haben vollen Zugriff auf das Supabase-Projekt `kypjknmjywiwyyynffev`.

| Befehl/Tool | Funktion |
| :--- | :--- |
| **`list_tables`** | Zeigt das Schema aller Tabellen. |
| **`execute_sql`** | Führt rohes SQL aus. Nutzen wir für Daten-Checks oder DML (Data Manipulation). |
| **`apply_migration`** | **Der korrekte Weg für Schema-Änderungen.** Führt DDL aus und protokolliert die Migration. |
| **`get_logs`** | Holt Logs (Auth, API, DB) zum Debuggen. |
| **`search_docs`** | Durchsucht die offizielle Supabase-Dokumentation. |
| **`generate_typescript_types`** | Generiert `database.types.ts` direkt aus der DB (Sync). |

### 🧠 Open Aware (Codebase Intelligence)
Ein "zweites Gehirn", das den Code semantisch versteht (über Embeddings).

| Tool | Wann nutzen? |
| :--- | :--- |
| **`ask`** | Schnelle Frage an die Codebasis. *Beispiel: "Wo wird die Authentifizierung initialisiert?"* |
| **`get_context`** | Holt relevante Snippets für eine Aufgabe. *Beispiel: "Zeig mir Beispiele für RLS Policies."* |
| **`deep_research`** | **Der Deep Dive Agent.** Analysiert komplexe Zusammenhänge über mehrere Dateien hinweg. *Beispiel: "Analysiere den Datenfluss von Login bis zum Dashboard."* |

### 🛡️ Code Review
| Befehl | Funktion |
| :--- | :--- |
| **`/code-review`** | Fordert eine formale Überprüfung der letzten Änderungen an. Ich schlüpfe in die Rolle eines "Principal Engineers" und suche nach Bugs, Security-Lücken und Anti-Patterns. |

---

## 3. The Conductor Pattern (Unsere Doktrin)

Wir arbeiten nach einer strikten Architektur, die im Ordner `conductor/` dokumentiert ist.

### Struktur
1.  **Logic Separation:**
    *   `src/core/`: Reine Logik & State (Der "Conductor"). Keine UI-Abhängigkeiten.
    *   `src/components/`: Dumme UI-Komponenten. Erhalten Daten via Props.
    *   `src/services/`: Externe Kommunikation (API, DB).
2.  **Dateien:**
    *   `PLAN.md`: Der Master-Plan. Enthält Backlog, aktive Tasks und Changelog.
    *   `conductor/tracks.md`: High-Level Roadmap.
    *   `conductor/product.md`: Produktvision.

### Workflow
1.  **Understand:** Ich lese den Code und den Plan.
2.  **Plan:** Ich schlage Änderungen vor (oft unter Bezug auf `PLAN.md`).
3.  **Implement:** Ich nutze `replace` oder `write_file`.
4.  **Verify:** Ich führe `npm run build` und Tests (`npx playwright test`) aus.
5.  **Document:** Ich aktualisiere `CHANGELOG.md` und `PLAN.md`.

---

## 4. "Computer Use" (Status: Inaktiv)

Wir haben kurzzeitig mit der **Computer Use Extension** experimentiert (Automatisierte Maus/Tastatur-Steuerung).
*   **Status:** Deinstalliert (wegen Instabilität unter Windows).
*   **Alternative:** Wir nutzen natives **Playwright** (`tests/e2e/`), um User-Interaktionen robust und wiederholbar zu testen (siehe `tests/e2e/smoke_suite.spec.ts`).

---

## 5. Pro-Tipps für den Operator (Du)

Wie du das Beste aus mir herausholst:

1.  **Sei spezifisch:** Statt *"Mach es schön"*, sag *"Nutze Tailwind Glassmorphism-Effekte mit `bg-black/40 backdrop-blur-md`"*.
2.  **Referenziere Dateien:** Wenn du weißt, wo etwas ist, sag es mir. *"Schau in `App.tsx`"*. Das spart Tokens und Zeit.
3.  **Fordere Tests:** *"Schreibe einen Test dafür"* zwingt mich, die Funktionalität zu beweisen.
4.  **Nutze den Code Review:** Bevor wir ein großes Feature abschließen, sag einfach *"Reviewe das"*.
5.  **Architektur-Check:** Wenn du unsicher bist, frag: *"Entspricht das unserer Conductor-Doktrin?"*

---

*Erstellt am 03.01.2026 für InFocus Project.*
