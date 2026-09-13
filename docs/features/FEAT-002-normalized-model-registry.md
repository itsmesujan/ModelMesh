# FEAT-002: Normalized Model Registry

## Unique ID
`FEAT-002`

## Purpose
Decouple conceptual canonical models (e.g. `llama-3.3-70b`, `claude-3.5-sonnet`, `gpt-4o`) from concrete, provider-specific offerings, normalizing capability metadata, context limits, and token pricing.

## User Story
As an application engineer, I want to request a canonical model or capability requirement (e.g., `model="auto"` or `llama-3.3-70b`) without worrying about whether Groq, Cerebras, Together, or Ollama is serving it, so that my application code remains completely vendor-agnostic.

## Preconditions
- Registered provider manifests available in `ProviderRegistry`.
- Active model catalog initialized in SQLite `models` and `model_offerings` tables.

## Main Flow
1. ModelRegistry indexes canonical models with capability requirements (tools, vision, context window, cost class).
2. Providers register concrete offerings (e.g. `groq/llama-3.3-70b-versatile`, `together/meta-llama/llama-3.3-70b-instruct`).
3. Client requests canonical model `llama-3.3-70b`.
4. ModelRegistry resolves all healthy, compliant offerings available across connected providers.
5. Passes offering list to CoreRouter for multi-signal scoring.

## Alternative Flows
- **Capability-Based Resolution**: Client requests `model="auto"` with `tools=true`. ModelRegistry filters offerings strictly to those with verified function-calling capabilities.

## Error Flows
- **Model Not Found**: If no offering matches requested canonical model, return 404 with list of available canonical models.
- **No Offerings Connected**: If canonical model exists but all offering providers are disconnected, return 503 with configuration recommendation.

## Acceptance Criteria
- Given request for `claude-3.5-sonnet`, registry resolves Anthropic offering with 200k context limit and vision modality.
- Given request for `llama-3.3-70b`, registry resolves both Groq and Together offerings.
- `GET /v1/models` returns unified list matching standard OpenAI schema (`id`, `created`, `owned_by`).

## Data Requirements
- `models`: `id`, `canonical_id`, `name`, `capabilities_json`, `context_window`.
- `model_offerings`: `id`, `model_id`, `connection_id`, `provider_model_id`, `cost_per_m_in`, `cost_per_m_out`.

## Security Implications
- Capability claims verified against provider manifests to prevent routing sensitive structured output to models that lack JSON schema support.

## Permission Requirements
- None.

## Test Strategy
- Unit tests: `packages/model-registry/src/index.test.ts`.
- Gateway contract tests: `apps/gateway/src/index.test.ts`.
