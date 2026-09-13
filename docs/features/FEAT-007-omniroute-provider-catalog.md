# FEAT-007: Exhaustive OmniRoute Provider Catalog Integration

## Unique ID
`FEAT-007`

## Purpose
Integrate and maintain 100% complete coverage of all providers from the OmniRoute provider inventory (363+ providers across 10 categories), ensuring zero missing providers, normalized trust tiers, and transparent alias indexing.

## User Story
As a multi-cloud AI engineer, I want ModelMesh to support every provider supported by OmniRoute (including niche inference hosts, Chinese frontier labs, audio models, search providers, and web cookie endpoints), so that I never have to manually add an unsupported provider.

## Preconditions
- ProviderRegistry package initialized with `omniroute-catalog.ts`.

## Main Flow
1. ModelMesh initializes `ProviderRegistry` on startup.
2. Ingests 369 total providers:
   - 14 rich curated seed providers (preserving models, prices, context windows).
   - 363 OmniRoute ecosystem providers (`omniroute-catalog.ts`).
3. Indexes providers into primary `Map<string, ProviderManifest>`.
4. Indexes secondary aliases (`-local`, `-web`, `-search`, `-cli`, and hyphenless names) into `aliasMap`.
5. Exposes normalized catalog via:
   - `registry.getAll()`
   - `registry.get(idOrAlias)`
   - `registry.getByCategory(category)`
   - `registry.search(query)`
   - REST endpoint `GET /api/providers`.

## Alternative Flows
- **Alias Resolution**: Developer requests `ollama-local`; registry transparently resolves to `Ollama`. Developer requests `tavily`; registry resolves to `Tavily Search`.

## Error Flows
- **Unknown Provider ID**: Return `undefined` or 404 with nearest fuzzy-search suggestions.

## Acceptance Criteria
- Total registered providers in `ProviderRegistry.getAll()` is >= 360 (currently 369).
- Zero missing providers from OmniRoute v3.8.50 and main branch.
- Keyless providers have `connectors: [{ type: 'keyless' }]` and `category: 'keyless'`.
- Web cookie providers have `connectors: [{ type: 'human_action' }]`, `policy.requiresHumanAction: true`, and `trustTier: 'unverified'`.
- Local loopback providers have `connectors: [{ type: 'openai_compatible' }]` and `trustTier: 'local_trusted'`.

## Data Requirements
- Stored as static TypeScript manifests in `packages/provider-registry/src/omniroute-catalog.ts` and loaded into memory on gateway boot.

## Security Implications
- Providers mapped to appropriate trust tiers to prevent unverified web cookie wrappers from masquerading as verified official enterprise APIs.

## Permission Requirements
- None.

## Test Strategy
- Unit tests: `packages/provider-registry/src/index.test.ts` (7 exhaustive tests verifying counts, categories, aliases, and specific lookups).
