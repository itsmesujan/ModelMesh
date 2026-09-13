# ADR-0002: Exhaustive OmniRoute Provider Normalization

## Status
Accepted

## Context
OmniRoute maintains an extensive catalog of 360+ AI providers across multiple categories (cloud frontier models, local loopback runtimes, keyless endpoints, web-cookie session wrappers, aggregators, audio TTS/STT, search engines, and cloud coding agents). ModelMesh requires an authoritative, strongly typed, declarative provider registry that:
1. Covers all 363+ OmniRoute providers with zero missing entries.
2. Accurately maps disparate auth schemes (AES-256-GCM vault API keys, OAuth device codes, keyless public endpoints, and human-action web cookies).
3. Enforces typed security trust tiers (`verified_official`, `community_adapter`, `generic_compatible`, `local_trusted`, `unverified`).
4. Avoids breaking existing curated seeds that contain rich static model benchmarks.

## Decision
1. **Catalog Ingestion & Code Generation**:
   - Extracted and normalized raw TypeScript constants from `diegosouzapw/OmniRoute` (release `v3.8.50`) and reference tables from `ourines/omniroute` (`main`).
   - Generated `packages/provider-registry/src/omniroute-catalog.ts` containing the complete 363 provider manifests with authentic metadata.
2. **Merge Strategy with Curated Seeds**:
   - Maintained `CURATED_SEED_PROVIDERS` for the 14 core providers (Ollama, LM Studio, vLLM, llama.cpp, OpenAI, Anthropic, Gemini, Groq, Together, OpenRouter, GitHub Models) containing rich pricing, context window, and modality mappings.
   - Merged `CURATED_SEED_PROVIDERS` with `OMNIROUTE_CATALOG` to form `SEED_PROVIDERS` (369 total unique registered providers).
3. **Smart Alias Resolution**:
   - Implemented secondary index lookup in `ProviderRegistry.get()` to resolve `-local`, `-web`, `-search`, `-cli`, and hyphen-stripped variants transparently.
4. **Real Functionality & Trust Tiers**:
   - Web-cookie session providers are explicitly typed with connector `human_action`, policy `requiresHumanAction: true`, and trust tier `unverified`, preventing false automation claims.
   - Local loopback servers are designated `local_trusted`.

## Consequences
- **Positive**: 100% provider parity with OmniRoute; zero missing providers; type-safe catalog; transparent alias lookup; clear security boundaries for web cookies vs official APIs.
- **Negative**: The catalog file is large (~320KB); however, in modern Node.js and client bundles, this memory overhead is negligible (< 1MB) and gives instant offline discovery without remote network round-trips.
