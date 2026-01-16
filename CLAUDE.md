# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm install          # Install dependencies
npm run build        # Build TypeScript to ./build
npm run watch        # Watch mode for development
npm run inspector    # Run with MCP Inspector at http://localhost:5173
```

To test locally with MCP Inspector, ensure `.env` is configured first.

## Architecture Overview

This is a Model Context Protocol (MCP) server that integrates with healthcare EMRs (Cerner, Epic) via SMART on FHIR APIs and provides medical research tools.

### Core Flow
```
index.ts → AgentCareServer → ToolHandler → {FhirClient, PubMed, ClinicalTrials, FDA}
```

### Key Components

**Entry Point** (`src/index.ts`): Loads environment config, creates MCP Server instance, initializes AgentCareServer

**AgentCareServer** (`src/server/AgentCareServer.ts`): Orchestrates the MCP server, initializes all connectors (FhirClient, PubMed, ClinicalTrials, FDA), registers tool handler, uses stdio transport

**ToolHandler** (`src/server/handlers/ToolHandler.ts`): Registers MCP tool handlers, routes tool calls to appropriate connectors, handles OAuth authentication flow via `Auth.executeWithAuth()` wrapper

**FhirClient** (`src/server/connectors/fhir/FhirClient.ts`): FHIR R4 API client using axios, methods for each FHIR resource type (Patient, Observation, Condition, etc.), receives OAuth token from ToolHandler

**Auth** (`src/server/utils/Auth.ts`): OAuth2 implementation using simple-oauth2, spins up Express callback server on port 3456, handles token refresh with 5-minute buffer, opens browser for auth flow

**Medical Research Connectors** (`src/server/connectors/medical/`):
- `PubMed.ts` - PubMed article search
- `ClinicalTrials.ts` - ClinicalTrials.gov search
- `FDA.ts` - FDA drug information

**Tool Definitions** (`src/server/constants/tools.ts`): MCP tool schemas defining inputs for each available tool

### Authentication Flow
1. First tool call triggers OAuth flow if no token exists
2. Auth class opens browser to EMR authorization URL
3. User authenticates, callback received on localhost:3456
4. Token stored and refreshed automatically

## Required Environment Variables

For Cerner or Epic, configure OAuth settings:
- `OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET`
- `OAUTH_TOKEN_HOST`, `OAUTH_TOKEN_PATH`, `OAUTH_AUTHORIZE_PATH`
- `OAUTH_AUTHORIZATION_METHOD` (body for Epic, header for Cerner)
- `OAUTH_AUDIENCE`, `OAUTH_CALLBACK_URL`, `OAUTH_SCOPES`, `OAUTH_CALLBACK_PORT`
- `FHIR_BASE_URL`
- `PUBMED_API_KEY`, `TRIALS_API_KEY`, `FDA_API_KEY`

## Test Sandbox Credentials
- Cerner: `portal` / `portal`
- Epic: `FHIRTWO` / `EpicFhir11!`

## Port Conflict
If port 3456 is in use: `kill -9 $(lsof -t -i:3456)`
