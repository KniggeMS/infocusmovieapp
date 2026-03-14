# Supabase MCP Server Setup

## 1. MCP Server konfigurieren

### Für VS Code / Cursor:
Füge dies zu deiner IDE-Konfiguration hinzu (z.B. settings.json oder MCP-Konfiguration):

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.supabase.com/mcp?project_ref=ekbpexbhuochrplzorce"
      ]
    }
  }
}
```

### Alternative: .cursor/rules oder .windsurf/workflows:
Erstelle Datei: `.windsurf/mcp-config.json`
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.supabase.com/mcp?project_ref=ekbpexbhuochrplzorce"
      ]
    }
  }
}
```

## 2. IDE neu starten
Nach der Konfiguration:
- IDE vollständig neu starten
- MCP Server sollte automatisch geladen werden

## 3. Tabellen automatisch erstellen
Nachdem der MCP Server aktiv ist, können wir:
- Tabellen mit einem Klick erstellen
- Authentifizierung konfigurieren
- Datenbank-Struktur prüfen

## 4. Fallback: Manuelles Setup
Falls MCP nicht funktioniert:
- Supabase Dashboard: https://supabase.com/dashboard
- Projekt: ekbpexbhuochrplzorce
- SQL Editor mit Code aus SUPABASE_QUICK_SETUP.md

## 5. Test-Checkliste
Nach Setup:
□ Tabellen erstellt (profiles, diary_entries, watchlist, lists, list_items, likes)
□ Authentication Settings konfiguriert
□ Site URL: http://localhost:3000
□ Redirect URLs: http://localhost:3000/auth/callback
□ Email confirmations aktiviert (oder für Tests deaktiviert)
□ Registrierung getestet
