# Testing Strategy

## Test Levels & Verification Hierarchy

```
Level 1: Static Type Checking & Linting (tsc --noEmit)
Level 2: Unit Testing (Vault, Quota, Health, Model Registry, Scoring, AutoConnect)
Level 3: Contract Testing (OpenAI /v1/models, /v1/chat/completions with SSE)
Level 4: Integration Testing (AutoConnect State Machine, Loopback Discovery, Fallback Cascade)
Level 5: UI & End-to-End Verification (Dashboard navigation, visual sanity, zero console errors)
```

## Mandatory Test Suites

1. **Vault Cryptography (`packages/secure-store`)**:
   - AES-256-GCM roundtrip encryption/decryption.
   - Authentication tag tamper detection (integrity check).
   - Secret redaction filter ensuring keys do not leak in error strings.
2. **Quota Engine (`packages/quota-engine`)**:
   - Rate limit header parser tests (`x-ratelimit-remaining-*`).
   - Free-tier taxonomy classification.
3. **Core Router (`packages/core-router`)**:
   - 9-factor scoring evaluation with deterministic assertions.
   - Policy gate exclusion (e.g. Free-only strictly rejects paid offerings).
   - Fallback execution on 429/503 errors.
4. **OpenAI Gateway Compatibility (`apps/gateway`)**:
   - `/v1/models` format fidelity.
   - `/v1/chat/completions` JSON payload verification.
   - Server-Sent Events (SSE) streaming verification (`data: [DONE]`).
5. **Provider Registry (`packages/provider-registry`)**:
   - Verification of 360+ registered providers (369 total).
   - Category filtering across Local, Keyless, Aggregators, OAuth, and Human-Action Web Cookie.
   - Transparent alias resolution (`ollama` $\leftrightarrow$ `ollama-local`, `tavily` $\leftrightarrow$ `tavily-search`).
   - Niche and major provider existence assertions.
6. **Control Center UI (`apps/web`)**:
   - Verified render of all 9 screens.
   - Dark/light mode theme switching.
   - Calm design system compliance: 1px borders, SVG icons, zero emoji.
   - Live provider category counts (`All: 369`, `Cloud: 204`, `Aggregators: 97`, `Local: 17`, `Keyless: 15`, `Custom: 36`).

## Verification Commands

| Command | Level | Expected Outcome |
| :--- | :--- | :--- |
| `npm test` | Unit & Contract Tests | 30 tests pass in ~4 seconds |
| `npm run typecheck` | Static Type Analysis | 0 errors across packages & apps |
| `npm run build:web` | Production Web Bundle | Clean build in ~4.5s (`dist/index.html`) |
| `curl http://127.0.0.1:4000/api/overview` | Gateway Live Health | `{ gatewayStatus: "healthy", totalProviders: 369 }` |
| `curl http://127.0.0.1:4000/v1/models` | OpenAI Catalog Proxy | 200 OK with normalized models array |

