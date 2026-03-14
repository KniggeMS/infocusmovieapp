# Windsurf MCP Konfiguration

## Datei erstellen:
`~/.codeium/windsurf/mcp_config.json`

## Inhalt:
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

## Anleitung:
1. Öffne Datei-Explorer
2. Navigiere zu: `C:\Users\Admin\.codeium\windsurf\`
3. Erstelle Datei: `mcp_config.json`
4. Kopiere den JSON-Code hinein
5. Speichern
6. Windsurf neu starten

## Danach testen:
Nach Neustart sollte der Supabase MCP Server verfügbar sein und ich kann:
- Tabellen automatisch erstellen
- Datenbank-Struktur prüfen
- Authentifizierung konfigurieren
