# AgentCare MCP - Quick Test Reference

A condensed reference card for testing AgentCare MCP.

## Sandbox Credentials

| EMR | Username | Password | Patient Search |
|-----|----------|----------|----------------|
| Epic | `FHIRTWO` | `EpicFhir11!` | "Cadena" |
| Cerner | `portal` | `portal` | "Smart" |

## Essential Config (Epic)

```json
{
  "mcpServers": {
    "agentcare": {
      "command": "node",
      "args": ["/path/to/agentcare-mcp/build/index.js"],
      "env": {
        "FHIR_BASE_URL": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4",
        "OAUTH_CLIENT_ID": "your_client_id",
        "OAUTH_CLIENT_SECRET": "",
        "OAUTH_TOKEN_HOST": "https://fhir.epic.com",
        "OAUTH_AUTHORIZE_PATH": "/interconnect-fhir-oauth/oauth2/authorize",
        "OAUTH_TOKEN_PATH": "/interconnect-fhir-oauth/oauth2/token",
        "OAUTH_AUTHORIZATION_METHOD": "body",
        "OAUTH_AUDIENCE": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4",
        "OAUTH_CALLBACK_URL": "http://localhost:3456/oauth/callback",
        "OAUTH_CALLBACK_PORT": "3456",
        "OAUTH_SCOPES": "user/Patient.read user/Observation.read user/Condition.read user/MedicationRequest.read user/AllergyIntolerance.read user/DocumentReference.read user/DiagnosticReport.read user/Coverage.read"
      }
    }
  }
}
```

## Test Commands

### Quick Smoke Test
```
Find patient with last name Cadena
```

### Read Operations
```
Get conditions for patient [id]
Get medications for patient [id]
Get lab results for patient [id]
Get vital signs for patient [id]
Get allergies for patient [id]
Get clinical documents for patient [id]
Get diagnostic reports for patient [id]
Get insurance coverage for patient [id]
```

### Write Operations
```
Record blood pressure 120/80 for patient [id]
Add penicillin allergy for patient [id]
Add diagnosis of hypertension for patient [id]
```

### Medical Research
```
Search PubMed for diabetes treatment
Find clinical trials for breast cancer in New York
Get drug information for metformin
```

## Common Issues

| Issue | Fix |
|-------|-----|
| Port 3456 in use | `kill -9 $(lsof -t -i:3456)` |
| OAuth fails | Check client ID, restart Claude |
| 401 error | Re-authenticate |
| Patient not found | Use sandbox test patient |

## File Locations

| Platform | Config Path |
|----------|-------------|
| Claude Code | `~/.config/claude/mcp.json` |
| Claude Desktop (Mac) | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Claude Desktop (Win) | `%APPDATA%\Claude\claude_desktop_config.json` |

## Build Commands

```bash
npm install      # Install deps
npm run build    # Compile TypeScript
npm run watch    # Dev mode
npm run inspector # Test at http://localhost:5173
```
