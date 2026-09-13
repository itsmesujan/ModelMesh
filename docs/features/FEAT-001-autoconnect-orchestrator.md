# FEAT-001: AutoConnect Orchestrator

## Unique ID
`FEAT-001`

## Purpose
Automate provider discovery, local loopback server probing, keyless connection establishment, and OAuth/human-action credential workflows through a durable, observable state machine.

## User Story
As an AI developer, I want ModelMesh to automatically discover running local servers (Ollama, LM Studio, vLLM) and connect free public tiers without manual configuration, so that I can immediately start sending chat completions without configuration overhead.

## Preconditions
- ModelMesh gateway initialized with local SQLite database.
- Network access permitted for loopback probing and upstream health validation.

## Main Flow
1. ConnectorEngine initiates an AutoConnect run (synchronously on gateway startup or on-demand via `POST /api/connectors/autoconnect`).
2. Scans allowlisted local ports (`11434`, `1234`, `8000`, `8080`). If a service responds to an OpenAI models probe, transitions to `Connected`.
3. Discovers keyless providers (`pollinations`, `duckduckgo-web`, `opencode`, `theoldllm`, `chipotle`) and marks them `Connected`.
4. Discovers credential-backed providers; if API key exists in local vault, runs probe and marks `Connected`.
5. For uncredentialed providers, transitions to `Auth-ready`.
6. For OAuth or browser cookie providers requiring user action, transitions to `Human-action` with guided instructions.

## Alternative Flows
- **Port Busy / Incompatible Protocol**: If a service answers on port 11434 but does not return valid models JSON, mark state `Degraded` and log error.
- **Offline Mode**: If network is unavailable, skip remote keyless probes and connect only local loopback engines.

## Error Flows
- **Upstream 401 on Probe**: Move state to `Blocked`, flag credential as invalid, and record in trace log.
- **Connection Timeout**: Retry with exponential backoff up to 2 times, then mark `Degraded`.

## Acceptance Criteria
- Given local Ollama running on `http://127.0.0.1:11434`, when AutoConnect executes, then state is `Connected` and models are populated in ModelRegistry.
- Given public keyless providers, when AutoConnect executes, then all 15 keyless providers transition to `Connected`.
- Given a web cookie provider, when AutoConnect executes, then state is `Human-action` with explicit instructions.

## Data Requirements
- Stored in SQLite `connections` table: `id`, `provider_id`, `auth_type`, `endpoint`, `status`, `last_validated_at`.

## Security Implications
- Loopback scanning restricted exclusively to `127.0.0.1` allowlisted ports to prevent LAN SSRF scanning.
- Keys retrieved from vault only in memory; zero plaintext keys written to database or logs.

## Permission Requirements
- Local OS loopback TCP socket connection permission.

## Test Strategy
- Unit tests: `packages/connector-engine/src/index.test.ts`.
- Gateway contract integration tests: `apps/gateway/src/index.test.ts`.
