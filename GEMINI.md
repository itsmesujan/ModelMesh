# ModelMesh Context & Workspace Guidelines

ModelMesh is a local-first AI gateway and provider control plane designed to make every available model understandable as a single normalized inventory and route requests using live health, quota, and user policy.

## Key Subsystems
- **AutoConnect**: Legitimate authorization orchestrator with durable state machine (`Discovered` -> `Auth-ready` -> `Authorizing` -> `Human-action` -> `Validating` -> `Connected` / `Degraded` / `Blocked`).
- **Normalized Model Registry**: Graph mapping canonical models to concrete provider offerings.
- **Smart Router**: Multi-signal scoring with policy gates, circuit breakers, and explainable decision traces.
- **Secure Vault**: OS-level / AES-256-GCM encrypted local storage for credentials.
- **OpenAI-Compatible Gateway**: `/v1/models`, `/v1/chat/completions` (with streaming SSE), `/v1/responses`, `/v1/embeddings`.
- **Calm Control Center**: 9 functional views (Overview, Providers, AutoConnect, Models, Routing, Usage, Health, Policies, Settings).

Refer to `/docs` for detailed architecture, requirements, and decisions.
