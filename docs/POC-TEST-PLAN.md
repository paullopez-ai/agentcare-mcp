# AgentCare MCP - Proof of Concept Test Plan

This document provides step-by-step instructions for testing the AgentCare MCP server with Epic and Cerner FHIR sandboxes.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Phase 1: Setup & Build](#phase-1-setup--build)
3. [Phase 2: Epic Sandbox Configuration](#phase-2-epic-sandbox-configuration)
4. [Phase 3: Cerner Sandbox Configuration](#phase-3-cerner-sandbox-configuration)
5. [Phase 4: Test Scenarios](#phase-4-test-scenarios)
6. [Phase 5: Write Operations Testing](#phase-5-write-operations-testing)
7. [Troubleshooting](#troubleshooting)
8. [Test Results Checklist](#test-results-checklist)

---

## Prerequisites

### Required Software
- Node.js v18+ (`node --version`)
- npm v9+ (`npm --version`)
- Claude Code CLI or Claude Desktop
- Git

### Required Accounts
- **Epic**: Register at https://fhir.epic.com/Developer/Apps
- **Cerner**: Register at https://code-console.cerner.com

### Network Requirements
- Port 3456 available for OAuth callback
- Access to fhir.epic.com and authorization.cerner.com

---

## Phase 1: Setup & Build

### Step 1.1: Clone Repository

```bash
# Navigate to your projects directory
cd ~/projects  # or your preferred location

# Clone the repository
git clone <your-agentcare-fork-url>
cd agentcare-mcp
```

### Step 1.2: Install Dependencies

```bash
npm install
```

**Expected Output:**
```
added 192 packages, and audited 193 packages in 12s
```

### Step 1.3: Build Project

```bash
npm run build
```

**Expected Output:**
- No errors
- `build/` directory created with compiled JavaScript

### Step 1.4: Verify Build

```bash
ls -la build/
```

**Expected:** `index.js` file exists and is executable

**Checkpoint:** Build completes without TypeScript errors

---

## Phase 2: Epic Sandbox Configuration

### Step 2.1: Register Epic App

1. Go to https://fhir.epic.com/Developer/Apps
2. Sign in or create a developer account
3. Click "Create" to register a new app
4. Configure app settings:
   - **Application Name:** AgentCare POC
   - **Application Type:** Provider-Facing
   - **Redirect URI:** `http://localhost:3456/oauth/callback`
5. Select FHIR R4 APIs:
   - Patient.Read
   - Observation.Read
   - Condition.Read
   - MedicationRequest.Read
   - AllergyIntolerance.Read
   - Procedure.Read
   - DocumentReference.Read
   - DiagnosticReport.Read
   - Coverage.Read
6. Save and note your **Client ID**

### Step 2.2: Configure MCP Server

Create or edit the MCP configuration file:

**For Claude Code CLI:**
```bash
mkdir -p ~/.config/claude
nano ~/.config/claude/mcp.json
```

**For Claude Desktop (macOS):**
```bash
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

Add the following configuration:

```json
{
  "mcpServers": {
    "agentcare-epic": {
      "command": "node",
      "args": ["<FULL_PATH_TO>/agentcare-mcp/build/index.js"],
      "env": {
        "FHIR_BASE_URL": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4",
        "OAUTH_CLIENT_ID": "<YOUR_EPIC_CLIENT_ID>",
        "OAUTH_CLIENT_SECRET": "",
        "OAUTH_TOKEN_HOST": "https://fhir.epic.com",
        "OAUTH_AUTHORIZE_PATH": "/interconnect-fhir-oauth/oauth2/authorize",
        "OAUTH_TOKEN_PATH": "/interconnect-fhir-oauth/oauth2/token",
        "OAUTH_AUTHORIZATION_METHOD": "body",
        "OAUTH_AUDIENCE": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4",
        "OAUTH_CALLBACK_URL": "http://localhost:3456/oauth/callback",
        "OAUTH_CALLBACK_PORT": "3456",
        "OAUTH_SCOPES": "user/Patient.read user/Observation.read user/Condition.read user/MedicationRequest.read user/AllergyIntolerance.read user/Procedure.read user/DocumentReference.read user/DiagnosticReport.read user/Coverage.read"
      }
    }
  }
}
```

**IMPORTANT:** Replace `<FULL_PATH_TO>` with your actual path (e.g., `/Users/yourname/projects`)

### Step 2.3: Test Epic Connection

```bash
# Launch Claude Code
claude

# Test patient search
> Search for patient with name Cadena using the Epic FHIR API
```

### Step 2.4: Epic OAuth Flow

When prompted, a browser window will open:

1. Click "Log In"
2. Enter Epic sandbox credentials:
   - **Username:** `FHIRTWO`
   - **Password:** `EpicFhir11!`
3. Authorize the application
4. Browser redirects to localhost:3456 (success page)

**Expected:** Patient data returned in Claude

**Checkpoint:** Epic OAuth flow completes successfully

---

## Phase 3: Cerner Sandbox Configuration

### Step 3.1: Register Cerner App

1. Go to https://code-console.cerner.com
2. Create a developer account
3. Create a new application:
   - **Application Type:** Provider
   - **SMART Launch:** EHR Launch
   - **Redirect URI:** `http://localhost:3456/oauth/callback`
4. Note your **Client ID** and **Client Secret**

### Step 3.2: Configure MCP Server

Add Cerner configuration to your MCP config file:

```json
{
  "mcpServers": {
    "agentcare-cerner": {
      "command": "node",
      "args": ["<FULL_PATH_TO>/agentcare-mcp/build/index.js"],
      "env": {
        "FHIR_BASE_URL": "https://fhir-ehr.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d",
        "OAUTH_CLIENT_ID": "<YOUR_CERNER_CLIENT_ID>",
        "OAUTH_CLIENT_SECRET": "<YOUR_CERNER_CLIENT_SECRET>",
        "OAUTH_TOKEN_HOST": "https://authorization.cerner.com",
        "OAUTH_AUTHORIZE_PATH": "/tenants/ec2458f2-1e24-41c8-b71b-0e701af7583d/protocols/oauth2/profiles/smart-v1/personas/provider/authorize",
        "OAUTH_TOKEN_PATH": "/tenants/ec2458f2-1e24-41c8-b71b-0e701af7583d/hosts/api.cernermillennium.com/protocols/oauth2/profiles/smart-v1/token",
        "OAUTH_AUTHORIZATION_METHOD": "header",
        "OAUTH_AUDIENCE": "https://fhir-ehr.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d",
        "OAUTH_CALLBACK_URL": "http://localhost:3456/oauth/callback",
        "OAUTH_CALLBACK_PORT": "3456",
        "OAUTH_SCOPES": "user/Patient.read user/Observation.read user/Condition.read user/MedicationRequest.read user/AllergyIntolerance.read user/Procedure.read user/CarePlan.read user/CareTeam.read user/Encounter.read user/DocumentReference.read user/DiagnosticReport.read user/Coverage.read"
      }
    }
  }
}
```

### Step 3.3: Test Cerner Connection

```bash
# Launch Claude Code
claude

# Test patient search
> Search for a patient named Smart in the Cerner FHIR sandbox
```

### Step 3.4: Cerner OAuth Flow

1. Browser opens to Cerner authorization
2. Enter Cerner sandbox credentials:
   - **Username:** `portal`
   - **Password:** `portal`
3. Select a patient from the list
4. Authorize the application

**Expected:** Patient data returned in Claude

**Checkpoint:** Cerner OAuth flow completes successfully

---

## Phase 4: Test Scenarios

### Test 4.1: Patient Search

```
> Find patient with last name "Cadena" (Epic) or "Smart" (Cerner)
```

**Expected:** Patient demographics returned (name, DOB, gender, address)

### Test 4.2: Conditions/Diagnoses

```
> Get all active conditions for patient [patientId]
```

**Expected:** List of diagnoses with ICD-10/SNOMED codes

### Test 4.3: Medications

```
> What medications is patient [patientId] currently taking?
```

**Expected:** Active medication list with dosages

### Test 4.4: Lab Results

```
> Show recent lab results for patient [patientId]
```

**Expected:** Laboratory observations with values and reference ranges

### Test 4.5: Vital Signs

```
> Get vital signs history for patient [patientId]
```

**Expected:** Blood pressure, heart rate, temperature, etc.

### Test 4.6: Allergies

```
> List all allergies for patient [patientId]
```

**Expected:** Allergy list with reactions and severity

### Test 4.7: Clinical Documents (New)

```
> Get clinical notes for patient [patientId]
```

**Expected:** DocumentReference resources (discharge summaries, progress notes)

### Test 4.8: Diagnostic Reports (New)

```
> Show diagnostic reports for patient [patientId]
```

**Expected:** Lab reports, radiology reports with interpretations

### Test 4.9: Insurance Coverage (New)

```
> What insurance does patient [patientId] have?
```

**Expected:** Coverage information (payer, plan, subscriber ID)

### Test 4.10: Medical Research

```
> Search PubMed for recent articles on Type 2 Diabetes management
```

**Expected:** List of relevant articles with titles and abstracts

```
> Find clinical trials for lung cancer in California
```

**Expected:** List of matching trials from ClinicalTrials.gov

---

## Phase 5: Write Operations Testing

> **WARNING:** Write operations modify patient data. Only test in sandbox environments.

### Test 5.1: Create Observation

```
> Record a blood pressure reading of 120/80 mmHg for patient [patientId]
```

**Expected:** Observation created, resource ID returned

### Test 5.2: Create Allergy

```
> Add a penicillin allergy with moderate severity for patient [patientId]
```

**Expected:** AllergyIntolerance created, resource ID returned

### Test 5.3: Create Condition

```
> Add a diagnosis of Type 2 Diabetes (E11.9) for patient [patientId]
```

**Expected:** Condition created, resource ID returned

### Test 5.4: Verify Write Operations

```
> Show the most recent observation for patient [patientId]
```

**Expected:** The observation you just created appears in the results

---

## Troubleshooting

### OAuth Flow Issues

| Problem | Solution |
|---------|----------|
| Browser doesn't open | Manually navigate to the URL shown in terminal |
| "Invalid redirect URI" | Ensure `http://localhost:3456/oauth/callback` is registered in EMR app |
| "Client ID not found" | Verify OAUTH_CLIENT_ID matches registered app |
| Token refresh fails | Re-authenticate by restarting Claude |

### Port Conflicts

```bash
# Check what's using port 3456
lsof -i :3456

# Kill the process
kill -9 $(lsof -t -i:3456)
```

### Connection Errors

| Error | Cause | Solution |
|-------|-------|----------|
| ECONNREFUSED | EMR server unreachable | Check internet, verify FHIR_BASE_URL |
| 401 Unauthorized | Token expired | Re-authenticate |
| 403 Forbidden | Insufficient scopes | Add required scopes to app registration |
| 404 Not Found | Invalid patient ID | Verify patient exists in sandbox |

### MCP Server Issues

```bash
# Test server directly with MCP Inspector
npm run inspector
# Open http://localhost:5173
```

### Common Fixes

1. **Restart Claude** after config changes
2. **Clear token cache** by deleting stored credentials
3. **Check logs** in Claude's output for detailed errors
4. **Verify JSON syntax** in mcp.json (use a JSON validator)

---

## Test Results Checklist

### Setup & Build
- [ ] Repository cloned successfully
- [ ] npm install completed without errors
- [ ] npm run build completed successfully
- [ ] build/index.js exists

### Epic Integration
- [ ] Epic sandbox app registered
- [ ] MCP configuration created
- [ ] OAuth flow completed
- [ ] Patient search works
- [ ] Conditions query works
- [ ] Medications query works
- [ ] Lab results query works
- [ ] DocumentReference query works (new)
- [ ] DiagnosticReport query works (new)
- [ ] Coverage query works (new)

### Cerner Integration
- [ ] Cerner sandbox app registered
- [ ] MCP configuration created
- [ ] OAuth flow completed
- [ ] Patient search works
- [ ] Conditions query works
- [ ] Medications query works

### Write Operations
- [ ] Create observation works
- [ ] Create allergy works
- [ ] Create condition works
- [ ] Written data retrievable

### Medical Research
- [ ] PubMed search works
- [ ] Clinical trials search works
- [ ] FDA drug info works

---

## Notes

```
Test Date: _______________
Tester: _______________
Environment: Epic / Cerner / Both
Claude Version: _______________
AgentCare Version: _______________

Additional Notes:
_________________________________________________
_________________________________________________
_________________________________________________
```

---

*For technical details, see [README.md](../README.md) and [CLAUDE.md](../CLAUDE.md)*
