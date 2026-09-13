# Security & Privacy Model

## Threat Model & Boundaries

ModelMesh operates on the developer's local machine, managing upstream provider credentials (API keys, OAuth bearer tokens) that carry financial, privacy, and infrastructure consequences.

## 1. Zero Plaintext Credential Persistence
- Credentials are encrypted at rest using **AES-256-GCM** with a 128-bit authentication tag and a unique 96-bit IV per encryption.
- Master keys are derived via **PBKDF2-HMAC-SHA256** (100,000 iterations) from an OS machine ID or user passphrase.
- Plaintext keys are never written to SQLite database tables. Database tables store only encrypted ciphertext, IV, tag, and an opaque `credential_ref`.

## 2. In-Memory Security & Secret Redaction
- In-memory decrypted credentials are retained in a dedicated transient cache and zeroed on cache eviction or process termination.
- All logs, telemetry payloads, trace events, and API error messages pass through a strict **Redaction Layer** that masks keys (`sk-...`, `Bearer ...`, passwords, tokens) into redacted hashes (e.g. `sk-****3a8f`).

## 3. Network Boundaries & SSRF Prevention
- Local loopback auto-discovery is strictly constrained to `127.0.0.1` and `[::1]` on predefined allowlisted ports (`11434`, `1234`, `8000`, `8080`).
- Local Area Network (LAN) discovery is **disabled by default**. It requires explicit user activation and generates a trust confirmation prompt before any LAN endpoint can join the routing pool.
- Custom user-entered provider URLs are validated against private IP ranges unless explicitly categorized as a trusted local server.

## 4. Trust Tiers
Every provider connector carries an explicit trust classification:
- `Verified Official`: Audited official SDK / endpoint integration.
- `Community Adapter`: Verified declarative connector.
- `Generic Compatible`: Standard OpenAI `/v1/models` compatible connector.
- `Local Trusted`: Loopback server with verified user consent.
- `Unverified`: Requires manual user approval before activation.
