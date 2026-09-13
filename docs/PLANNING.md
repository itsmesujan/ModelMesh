# Project Planning & Roadmap

## Phase Model

```
PHASE 0: Discovery (Environment & Repository Audit) [COMPLETE]
PHASE 1: Requirements & Architecture (Specifications, ADRs, Threat Model) [IN PROGRESS]
PHASE 2: Foundation (Monorepo setup, TypeScript config, Node 26 SQLite)
PHASE 3: Core Subsystems (Vault, Registries, Quota, Health, Policy, Router, Connector)
PHASE 4: Applications (apps/gateway OpenAI proxy + apps/web Calm Dashboard)
PHASE 5: Verification & Contract Tests (Unit tests, OpenAI contract suite, E2E flow)
PHASE 6: Hardening & Documentation Walkthrough
```

## Milestone Schedule

### Milestone 1: Core Subsystems & Engines
- `packages/secure-store`: AES-256-GCM authenticated vault, redaction.
- `packages/provider-registry`: Declarative provider manifests & seed catalog.
- `packages/quota-engine`: Quota taxonomy & header parsing.
- `packages/health-engine`: Latency tracker & circuit breaker.
- `packages/model-registry`: Normalized model graph & capability matrices.
- `packages/policy-engine`: Policy mode validation & gate filters.
- `packages/core-router`: 9-factor scoring & explainable traces.
- `packages/connector-engine`: AutoConnect runner & loopback discovery.
- `packages/telemetry`: OpenTelemetry semantics & local logging.

### Milestone 2: Gateway & OpenAI Proxy
- Initialize SQLite schema via Node 26 `node:sqlite`.
- Implement `/v1/models`, `/v1/chat/completions` (JSON & SSE streaming), `/v1/responses`, `/v1/embeddings`.
- Implement management REST API (`/api/health`, `/api/providers`, `/api/connectors/*`, `/api/models/catalog`, `/api/policies`, `/api/telemetry`).

### Milestone 3: Control Center UI
- Implement React + TypeScript + Vite app with custom SVG icons and design system.
- Build the 9 primary views: Overview, Providers, AutoConnect, Models, Routing, Usage, Health, Policies, Settings.
- Connect UI to gateway API.

### Milestone 4: Verification & Anti-Demo Protocol
- Execute unit and contract tests.
- Perform end-to-end request dispatching with streaming.
- Verify zero secret leaks and proper fallback handling.
