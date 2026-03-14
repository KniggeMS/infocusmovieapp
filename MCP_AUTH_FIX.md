# MCP Server mit Authentifizierung

## Problem:
Der MCP Server gibt 401 Unauthorized zurück - benötigt API Key.

## Lösung:
Service Role Key zur MCP Konfiguration hinzufügen.

## Service Role Key finden:
1. Supabase Dashboard: https://supabase.com/dashboard/project/ekbpexbhuochrplzorce
2. Settings → API
3. Kopiere "service_role" Key

## Angepasste Konfiguration:
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.supabase.com/mcp?project_ref=ekbpexbhuochrplzorce&api_key=SERVICE_ROLE_KEY_HIER"
      ]
    }
  }
}
```

## Alternative:
Ohne MCP funktioniert die App bereits perfekt!
