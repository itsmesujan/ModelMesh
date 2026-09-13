# Changelog

All notable changes to the ModelMesh project will be documented in this file.

## [0.1.0] - 2026-09-13
### Added
- Project bootstrap and documentation hierarchy (`AGENT.md`, `GEMINI.md`, `docs/*`).
- Architecture Decision Record ADR-0001 (Node 26 Native SQLite & TypeScript Monorepo).
- Specifications for AutoConnect, Model Registry, Multi-Signal Router, Quota Engine, and Calm Dashboard.
- Initial monorepo foundation with npm workspaces.
- Ingested exhaustive OmniRoute provider catalog into `packages/provider-registry/src/omniroute-catalog.ts` (363 providers across all 10 categories).
- Enhanced `ProviderRegistry` with transparent alias resolution, category accessors, and live count metrics (369 total registered providers).
- Updated web control center `ProvidersView` with live category counts, expanded search, and support for cookie/session token vault entry.
- Eliminated all simulated/placeholder data: implemented real `discoverProviderModels` for keyless providers (OpenCode, Pollinations, AI Horde, DuckDuckGo), local loopback servers (Ollama, LM Studio, vLLM), and API keys.
- AutoConnect dynamically populates 109+ active real model offerings from live connected endpoints.
- Expanded `CANONICAL_MODELS` to 134 normalized models with automated dynamic synthesis (`ensureCanonicalForModel`) for uncataloged upstream IDs.
- Upgraded `ModelsView` in Calm Dashboard with real-time search, family filter tabs with live badges, connected-only toggle, and rich provider offering inspections.

