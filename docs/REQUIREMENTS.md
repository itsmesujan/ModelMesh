# Requirements Specification

## 1. Problem Statement
Developers and AI teams currently face immense operational friction configuring, credentialing, and load-balancing multiple LLM providers (cloud, OAuth, API key, and local servers). AI gateways either focus on raw adapter counts without automated onboarding, or expose noisy, complex configuration consoles without explainable routing or legitimate credential orchestration.

## 2. Target Users & Personas
- **Local AI Developer**: Wants zero-config connection to local backends (Ollama, LM Studio, vLLM, llama.cpp) and free cloud tiers without entering 20 API keys.
- **Application Engineer**: Requires a resilient OpenAI-compatible drop-in proxy (`/v1/chat/completions`) with intelligent fallbacks, rate-limit awareness, and zero downtime.
- **Enterprise / Team Lead**: Requires transparent policy gates (e.g., "Free only", "Local only", "No data training allowed") with full audit logging and secure local credential vaults.

## 3. Scope Boundaries
- **MVP Scope**:
  - AutoConnect orchestrator supporting keyless, API key, OAuth/device flow, and loopback local discovery.
  - Normalized model registry mapping canonical models to concrete provider offerings.
  - Smart multi-signal router with policy gates, 9-factor scoring, circuit breakers, and explainable decision traces.
  - Local SQLite database and AES-256-GCM encrypted credential vault.
  - OpenAI-compatible REST + SSE streaming endpoints.
  - Calm developer-grade web dashboard with 9 functional screens.
- **Non-Goals (Out of Scope)**:
  - Bypassing CAPTCHAs, MFA, or provider anti-abuse mechanisms.
  - Manufacturing disposable accounts or evading platform terms of service.
  - Storing plaintext credentials in configuration or databases.
  - Unsolicited LAN subnet scanning without explicit user consent.

## 4. Functional Requirements

- **FR-1 [AutoConnect Engine]**: System must discover eligible providers, execute official authentication routes, and transition connections through durable states (`Discovered`, `Auth-ready`, `Authorizing`, `Human-action`, `Validating`, `Connected`, `Degraded`, `Blocked`).
- **FR-2 [Loopback Local Discovery]**: System must scan predefined allowlisted localhost ports (11434, 1234, 8000, 8080) to discover running Ollama, LM Studio, vLLM, and llama.cpp instances.
- **FR-3 [Model Graph Normalization]**: System must map canonical model identifiers (e.g. `llama-3.3-70b`, `gpt-4o-mini`) to provider-specific models, tracking modalities, capabilities, context limits, and token pricing.
- **FR-4 [Free-Tier & Quota Taxonomy]**: System must classify quotas into `recurring-free`, `daily-free`, `rate-limited-free`, `signup-credit`, `promotional`, `paid`, and `unknown`, parsing `x-ratelimit-*` headers when present.
- **FR-5 [Multi-Signal Router]**: System must score candidates using policy gates, live health, capability fit, quota headroom, latency profile, quality tier, cost class, and stability.
- **FR-6 [Explainable Routing Traces]**: System must emit a routing trace for every request detailing gate decisions, candidate scores, and fallback chain ordering.
- **FR-7 [Resilient Fallbacks]**: System must handle upstream failures (429 rate limit, 503 outage, timeout) by seamlessly falling back down the candidate chain according to an error taxonomy.
- **FR-8 [Encrypted Vault]**: System must encrypt all API keys and OAuth tokens using AES-256-GCM with a user-derived master key, with zero plaintext persistence.
- **FR-9 [Redaction]**: System must redact secrets in all logs, telemetry events, and API payloads.
- **FR-10 [OpenAI-Compatible Gateway]**: System must provide `/v1/models`, `/v1/chat/completions` (supporting SSE `text/event-stream`), `/v1/responses`, and `/v1/embeddings`.
- **FR-11 [Calm Developer Control Center]**: System must provide a web dashboard across 9 core screens: Overview, Providers, AutoConnect, Models, Routing, Usage, Health, Policies, Settings.
- **FR-12 [Policy Modes]**: System must support selectable presets: Balanced, Free, Local, Fast, Cheap, Best, Resilient, Private.

## 5. Non-Functional Requirements

- **NFR-1 [Performance]**: Gateway routing overhead must be < 5ms per request.
- **NFR-2 [Reliability]**: Database and queue state must be crash-resilient and recoverable from SQLite WAL.
- **NFR-3 [Security]**: Zero plaintext secret exposure in any network response, log, or telemetry.
- **NFR-4 [Aesthetics & UX]**: Calm, neutral surfaces, dark/light support, zero noisy animations or emoji, SVG line icons, accessibility compliance.
- **NFR-5 [Zero-Dependency Local DB]**: Use Node 26 native `node:sqlite` without external C++ compilation dependencies.
