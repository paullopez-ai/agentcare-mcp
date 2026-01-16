# AgentCare MCP

> A fork of [Kartha-AI/agentcare-mcp](https://github.com/Kartha-AI/agentcare-mcp) with extended FHIR API support and write operations.

An MCP server that connects AI assistants (Claude, Goose) to healthcare EMRs (Epic, Cerner) via SMART on FHIR APIs.

[![smithery badge](https://smithery.ai/badge/@Kartha-AI/agentcare-mcp)](https://smithery.ai/server/@Kartha-AI/agentcare-mcp)

## What's New in This Fork

- **DocumentReference** - Access clinical notes, discharge summaries, progress notes
- **DiagnosticReport** - Retrieve structured lab and imaging reports
- **Coverage** - Query patient insurance information
- **Write Operations** - Create observations, allergies, and conditions

## Quick Start

```bash
git clone <your-fork-url>
cd agentcare-mcp
npm install
npm run build
```

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Claude/Goose   │────▶│  AgentCare MCP   │────▶│   Epic/Cerner   │
│   (AI Client)   │     │     Server       │     │   (FHIR R4)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  Medical APIs    │
                        │  PubMed | FDA |  │
                        │  ClinicalTrials  │
                        └──────────────────┘
```

**Core Flow:** `index.ts` → `AgentCareServer` → `ToolHandler` → `FhirClient` / Medical APIs

## Available Tools (22 total)

### Patient Data (Read)
| Tool | Description |
|------|-------------|
| `find_patient` | Search by name, DOB, gender |
| `get_patient_observations` | Vitals and lab observations |
| `get_patient_conditions` | Active diagnoses |
| `get_patient_medications` | Current prescriptions |
| `get_patient_encounters` | Clinical visits |
| `get_patient_allergies` | Allergies and intolerances |
| `get_patient_procedures` | Surgical/clinical procedures |
| `get_patient_careplans` | Active care plans |
| `get_vital_signs` | Vital signs history |
| `get_lab_results` | Laboratory results |
| `get_medications_history` | Medication history |
| `get_appointments` | Scheduled appointments |

### Clinical Documents (Read) - *New*
| Tool | Description |
|------|-------------|
| `get_patient_documents` | Clinical notes, discharge summaries |
| `get_document_content` | Full document with attachments |
| `get_diagnostic_reports` | Lab/radiology/pathology reports |
| `get_patient_coverage` | Insurance coverage info |

### Write Operations - *New*
| Tool | Description |
|------|-------------|
| `create_observation` | File vitals, patient-reported data |
| `create_allergy` | Add allergy/intolerance |
| `create_condition` | Add diagnosis/condition |

### Medical Research
| Tool | Description |
|------|-------------|
| `search-pubmed` | Search medical literature |
| `search-trials` | Find clinical trials |
| `get-drug-info` | FDA drug information |

## Configuration

Create a `.env` file or set environment variables:

### Epic
```env
OAUTH_CLIENT_ID=your_client_id
OAUTH_CLIENT_SECRET=
OAUTH_TOKEN_HOST=https://fhir.epic.com
OAUTH_AUTHORIZE_PATH=/interconnect-fhir-oauth/oauth2/authorize
OAUTH_TOKEN_PATH=/interconnect-fhir-oauth/oauth2/token
OAUTH_AUTHORIZATION_METHOD=body
OAUTH_AUDIENCE=https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4
OAUTH_CALLBACK_URL=http://localhost:3456/oauth/callback
OAUTH_CALLBACK_PORT=3456
OAUTH_SCOPES=user/Patient.read user/Observation.read user/Observation.write user/MedicationRequest.read user/Condition.read user/Condition.write user/AllergyIntolerance.read user/AllergyIntolerance.write user/Procedure.read user/CarePlan.read user/Encounter.read user/DocumentReference.read user/DiagnosticReport.read user/Coverage.read
FHIR_BASE_URL=https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4
```

### Cerner
```env
OAUTH_CLIENT_ID=your_client_id
OAUTH_CLIENT_SECRET=your_client_secret
OAUTH_TOKEN_HOST=https://authorization.cerner.com
OAUTH_AUTHORIZE_PATH=/tenants/ec2458f2-1e24-41c8-b71b-0e701af7583d/protocols/oauth2/profiles/smart-v1/personas/provider/authorize
OAUTH_TOKEN_PATH=/tenants/ec2458f2-1e24-41c8-b71b-0e701af7583d/hosts/api.cernermillennium.com/protocols/oauth2/profiles/smart-v1/token
OAUTH_AUTHORIZATION_METHOD=header
OAUTH_AUDIENCE=https://fhir-ehr.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d
OAUTH_CALLBACK_URL=http://localhost:3456/oauth/callback
OAUTH_CALLBACK_PORT=3456
OAUTH_SCOPES=user/Patient.read user/Observation.read user/MedicationRequest.read user/Condition.read user/AllergyIntolerance.read user/Procedure.read user/CarePlan.read user/Encounter.read user/DocumentReference.read user/DiagnosticReport.read user/Coverage.read
FHIR_BASE_URL=https://fhir-ehr.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d
```

### Medical Research APIs (Optional)
```env
PUBMED_API_KEY=your_key
CLINICAL_TRIALS_API_KEY=your_key
FDA_API_KEY=your_key
```

## Claude Desktop Setup

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "agent-care": {
      "command": "node",
      "args": ["/path/to/agentcare-mcp/build/index.js"],
      "env": {
        "OAUTH_CLIENT_ID": "...",
        "FHIR_BASE_URL": "..."
      }
    }
  }
}
```

## Development

```bash
npm run watch      # Watch mode
npm run inspector  # Test with MCP Inspector at http://localhost:5173
```

### Test Credentials
| EMR | Username | Password |
|-----|----------|----------|
| Cerner | `portal` | `portal` |
| Epic | `FHIRTWO` | `EpicFhir11!` |

### Port Conflict
```bash
kill -9 $(lsof -t -i:3456)
```

## Project Structure

```
src/
├── index.ts                    # Entry point
├── server/
│   ├── AgentCareServer.ts      # MCP server orchestration
│   ├── handlers/
│   │   └── ToolHandler.ts      # Tool routing
│   ├── connectors/
│   │   ├── fhir/
│   │   │   └── FhirClient.ts   # FHIR R4 API client
│   │   └── medical/
│   │       ├── PubMed.ts
│   │       ├── ClinicalTrials.ts
│   │       └── FDA.ts
│   ├── constants/
│   │   └── tools.ts            # Tool definitions
│   └── utils/
│       ├── Auth.ts             # OAuth2 flow
│       └── Cache.ts            # Response caching
```

## Documentation

- **[POC Test Plan](./docs/POC-TEST-PLAN.md)** - Complete step-by-step testing guide
- **[Quick Test Reference](./docs/QUICK-TEST-REFERENCE.md)** - Condensed reference card
- **[Old README](./Old-README.md)** - Original documentation

## License

See original repository for license information.
