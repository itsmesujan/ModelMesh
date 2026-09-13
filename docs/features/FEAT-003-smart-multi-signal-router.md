# FEAT-003: Smart Multi-Signal Router

## Unique ID
`FEAT-003`

## Purpose
Select the optimal candidate offering for every request using active policy gates, a 9-factor multi-signal scoring formula, and automatic fallback cascading with explainable decision traces.

## User Story
As an AI gateway operator, I want routing decisions to automatically respect my active business policy (e.g. Free-only or Local-only) and pick the fastest, healthiest available model offering, so that I experience high uptime without unexpected bills.

## Preconditions
- PolicyEngine has active policy preset configured.
- HealthEngine has recorded EMA latencies and circuit breaker states.
- QuotaEngine has tracking data for provider headroom.

## Main Flow
1. Incoming request arrives at `/v1/chat/completions`.
2. Router inspects request requirements: canonical model, streaming, tools, vision.
3. Evaluates candidates against active **Policy Gates** (e.g., Free Mode gate excludes paid providers).
4. For passing candidates, computes 9-factor weighted score:
   $$\text{Score} = \sum_{i} W_i \cdot S_i$$
5. Orders candidates by descending score into a fallback chain.
6. Emits structured decision trace to TelemetryManager.
7. Dispatches request to candidate #1.
8. If candidate #1 succeeds, updates latency EMA and returns response.

## Alternative Flows
- **Fallback Execution**: If candidate #1 returns 429 or 503, router immediately dispatches to candidate #2 in the compiled fallback chain.

## Error Flows
- **All Candidates Failed**: Return 502 with full explainable trace summarizing each candidate attempt.
- **Policy Gate Blocked All**: Return 403 detailing why no available provider met the active policy constraints.

## Acceptance Criteria
- Given `Free` policy mode, when `model="auto"` is requested, then only zero-cost offerings are scored and selected.
- Given `Local` policy mode, when request arrives, then only local loopback engines are selected.
- Given upstream 503 error, router seamlessly fails over to candidate #2 in < 50ms without dropping client stream.

## Data Requirements
- Ephemeral in-memory scoring context; persistent trace record in `telemetry_events`.

## Security Implications
- Privacy mode gate guarantees prompts never leave the local machine if `Local` or `Private` mode is active.

## Permission Requirements
- None.

## Test Strategy
- Unit tests: `packages/core-router/src/index.test.ts`, `packages/policy-engine/src/index.test.ts`.
- Gateway contract suite: `apps/gateway/src/index.test.ts`.
