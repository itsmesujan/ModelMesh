# Technical Architecture

## 1. High-Level Architecture Overview

ModelMesh operates as a local-first control plane and proxy between AI clients (IDEs, CLI tools, web apps, agent frameworks) and AI model providers (cloud, OAuth, API key, and local servers).

```
+-------------------------------------------------------------------------+
|                              AI Clients                                 |
|            (OpenAI SDK, LangChain, Cursor, Claude Code, etc.)           |
+-------------------------------------------------------------------------+
                                    |
                                    v (HTTP / SSE)
+-------------------------------------------------------------------------+
|                  ModelMesh Gateway (apps/gateway)                       |
|  - /v1/models, /v1/chat/completions, /v1/responses, /v1/embeddings     |
|  - /api/* Management & Control Plane API                                |
+-------------------------------------------------------------------------+
                                    |
         +--------------------------+--------------------------+
         |                                                     |
         v                                                     v
+-----------------------+                             +--------------------+
|  Core Router & Engine |                             | AutoConnect Engine |
|  - Policy Gates       |                             | - Local Loopback   |
|  - 9-Factor Scoring   |                             | - OAuth Device RFC |
|  - Fallback Cascade   |                             | - Key Validation   |
+-----------------------+                             +--------------------+
         |                                                     |
         v                                                     v
+-------------------------------------------------------------------------+
|                          Subsystem Engines                              |
|  - model-registry (Canonical graph, capabilities, economics)           |
|  - provider-registry (Manifests, endpoints, trust tiers)                |
|  - quota-engine (Free-tier classification, rate-limit headers)         |
|  - health-engine (EMA latency profiling, circuit breakers)              |
|  - secure-store (AES-256-GCM vault, key derivation, redaction)          |
|  - telemetry (Explainable decision traces, local audit logs)            |
+-------------------------------------------------------------------------+
                                    |
         +--------------------------+--------------------------+
         |                                                     |
         v                                                     v
+------------------+                                  +-------------------+
|  Local SQLite DB |                                  | Outbound Network  |
|  (node:sqlite)   |                                  | (Upstream HTTPS   |
|  - connections   |                                  |  & Local Loopback)|
|  - models        |                                  +-------------------+
|  - quotas        |
|  - traces        |
+------------------+
```

## 2. AutoConnect State Machine

The AutoConnect onboarding engine operates asynchronously via durable state transitions:

```
[ Discovered ]
      |
      v
[ Auth-ready ] --------------------------------------------+
      |                                                    |
      v (Requires user action, e.g. CAPTCHA, browser login)|
[ Authorizing ]                                            |
      |                                                    |
      +---> [ Human-action ]                               |
      |          | (User completes step)                   |
      v          v                                         |
[ Validating (Endpoint probe & model sync) ] <-------------+
      |
      +---> [ Connected (Healthy & in routing pool) ]
      |
      +---> [ Degraded (High latency / low quota) ]
      |
      +---> [ Blocked (Revoked credential / 401) ]
```

## 3. Multi-Signal 9-Factor Scoring Formula

Eligible candidate offerings are evaluated only after passing all active **Policy Gates**:

$$\text{Final Score} = \text{PolicyGate} \times \sum_{i} W_i \cdot S_i$$

Where:
- $\text{PolicyGate} \in \{0, 1\}$ (Strict exclusion based on policy mode, e.g., local-only, free-only, privacy terms)
- $S_{health}$: Provider health and circuit breaker status (0.0 to 1.0)
- $S_{capability}$: Exact match vs partial capability fit (tools, structured output, vision, context window)
- $S_{quota}$: Estimated quota headroom and concurrency availability
- $S_{latency}$: Inverted EMA p95 latency normalized against historical thresholds
- $S_{quality}$: Benchmark / quality tier rating of the model family
- $S_{cost}$: Inverted token cost per 1M tokens ($0 for free tiers = 1.0)
- $S_{stability}$: Inverse of recent error/retry frequency
- $S_{affinity}$: User-configured provider preference weighting

## 4. Resilient Fallback Chain Execution

When a request fails, the router consults the **Error Taxonomy**:
- **401 Unauthorized**: Upstream credential invalid or expired $\rightarrow$ Move connection to `Blocked`, trigger failover to candidate 2.
- **429 Too Many Requests**: Rate limit reached $\rightarrow$ Record cooldown period in health engine, trigger failover to candidate 2.
- **503 / 502 Upstream Failure**: Upstream server down $\rightarrow$ Increment circuit breaker failure count, failover to candidate 2.
- **400 Bad Request / Schema Failure**: Client-side error $\rightarrow$ Do not retry blindly; return normalized error to client.

## 5. Database Schema (SQLite)

Tables managed via Node 26 `node:sqlite`:
- `providers`: `id`, `name`, `category`, `registry_version`, `trust_tier`, `created_at`
- `connections`: `id`, `provider_id`, `auth_type`, `endpoint`, `credential_ref`, `status`, `last_validated_at`
- `models`: `id`, `canonical_id`, `name`, `capabilities_json`, `context_window`, `created_at`
- `model_offerings`: `id`, `model_id`, `connection_id`, `provider_model_id`, `health_score`, `p95_latency_ms`, `cost_class`, `cost_per_m_in`, `cost_per_m_out`
- `quotas`: `id`, `connection_id`, `kind`, `limit_val`, `remaining_val`, `reset_at`, `confidence`
- `routing_policies`: `id`, `name`, `mode`, `rules_json`, `is_active`
- `telemetry_events`: `id`, `request_id`, `timestamp`, `canonical_model`, `provider_id`, `offering_id`, `status_code`, `latency_ms`, `prompt_tokens`, `completion_tokens`, `cost_estimate`, `trace_json`

## 6. Provider Registry Architecture & OmniRoute Normalization

ModelMesh incorporates an exhaustive provider inventory of **369 providers** derived from the complete OmniRoute ecosystem (`v3.8.50` and `main` branch):

### 6.1 Provider Taxonomy & Connectors
```text
ProviderManifest
 ├── providerId: string
 ├── displayName: string
 ├── category: 'cloud' | 'local' | 'keyless' | 'aggregator' | 'custom'
 ├── trustTier: 'verified_official' | 'community_adapter' | 'generic_compatible' | 'local_trusted' | 'unverified'
 ├── connectors: ConnectorSpec[]
 │    ├── keyless: Public / zero-auth anonymous endpoint
 │    ├── openai_compatible: Standard loopback / port-probed local runtime
 │    ├── api_key: Stored in AES-256-GCM vault with key prefixes
 │    ├── oauth / device_flow: Device authorization or RFC flow
 │    └── human_action: Browser session cookie / userToken requiring manual user entry
 ├── modelDiscovery: { strategy: 'openai_models' | 'static_catalog' | 'custom' }
 ├── healthStrategy: { strategy: 'models_endpoint' | 'ping' | 'completion_probe' }
 ├── capabilities: ['chat', 'streaming', 'tools', 'vision', 'embeddings', 'audio', 'search']
 └── policy: { automation, requiresHumanAction, supportsStreaming, supportsTools, supportsVision }
```

### 6.2 Transparent Alias Indexing
To prevent friction when developers refer to providers by shorthand or alternate names, `ProviderRegistry` maintains secondary indexing:
- Local suffixes (`-local` $\leftrightarrow$ base): `ollama` $\leftrightarrow$ `ollama-local`, `lmstudio` $\leftrightarrow$ `lm-studio`
- Web suffixes (`-web` $\leftrightarrow$ base): `duckduckgo-web` $\leftrightarrow$ `duckduckgo`
- Search suffixes (`-search` $\leftrightarrow$ base): `tavily-search` $\leftrightarrow$ `tavily`
- Hyphenated variants (`x-y` $\leftrightarrow$ `xy`): `open-router` $\leftrightarrow$ `openrouter`

