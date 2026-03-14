# Supabase MCP mit OAuth 2.1

## Sichere Methode (empfohlen von Supabase)

### 1. OAuth Client erstellen
**Supabase Dashboard → Authentication → OAuth:**
1. **Create new OAuth App**
2. **Name:** "4115939bdc412c5f7b0c4598fcf29b77"
3. **Redirect URL:** `http://localhost:3000/auth/callback`
4. **Scopes:** `database:read database:write auth:read auth:write`
5. **Client ID und Secret kopieren**

### 2. MCP Konfiguration mit OAuth
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.supabase.com/mcp?project_ref=ekbpexbhuochrplzorce"
      ],
      "env": {
        "SUPABASE_CLIENT_ID": "d69fb339-4514-428e-9c54-2342100ad523",
        "SUPABASE_CLIENT_SECRET": "fdsfTpgnEhYjedv20czYfXo04ai6EqbhIlaal5fVGFk"
      }
    }
  }
}
```

### 3. Development Branch verwenden
**Für Tests:**
- Entwicklungs-Branch erstellen
- Keine Production-Daten gefährden
- Separate Test-Datenbank

### 4. Sicherheits-Features
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.supabase.com/mcp?project_ref=ekbpexbhuochrplzorce"],
      "env": {
        "SUPABASE_CLIENT_ID": "DEINE_CLIENT_ID",
        "SUPABASE_CLIENT_SECRET": "DEINE_CLIENT_SECRET"
      },
      "logging": {
        "level": "info",
        "file": "mcp-supabase.log"
      },
      "security": {
        "rate_limit": {
          "requests_per_minute": 100
        },
        "allowed_operations": ["read", "write", "schema"]
      }
    }
  }
}
```

### 5. Serverseitige Prüfungen
**In Windsurf Konfiguration:**
```json
{
  "mcpServers": {
    "supabase": {
      "validation": {
        "check_rls_policies": true,
        "validate_schema_changes": true,
        "backup_before_major_changes": true
      }
    }
  }
}
```

## Vorteile dieser Methode:
✅ OAuth 2.1 statt Service Keys
✅ Scoped Permissions (minimal Rechte)
✅ Row Level Security (RLS) respektiert
✅ Development-Branch sicher
✅ Logging und Monitoring
✅ Keine Production-Risiken
