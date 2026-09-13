# FEAT-004: Secure Vault and Redaction Engine

## Unique ID
`FEAT-004`

## Purpose
Protect credentials (API keys, OAuth tokens, browser session cookies) with authenticated AES-256-GCM encryption at rest, and guarantee zero secret leaks through recursive redaction.

## User Story
As a security-conscious engineer, I want all my API keys and session tokens encrypted with my local passkey, and I want guarantees that logs, error traces, and API responses never expose my secrets in plaintext.

## Preconditions
- Master passkey configured (defaulting to local hardware-derived key if unconfigured).
- Node.js native `node:crypto` library available.

## Main Flow
1. User provides credential via web UI or API (`POST /api/connectors/connect`).
2. VaultManager derives 256-bit encryption key using PBKDF2-HMAC-SHA256 with 100,000 iterations and random salt.
3. Generates unique 12-byte IV and encrypts credential via `aes-256-gcm`.
4. Produces serialized payload: `salt:iv:authTag:ciphertext`.
5. Stores encrypted string in SQLite database or encrypted file.
6. When credential is required for upstream dispatch, VaultManager decrypts in memory, uses it for request headers, and zeroes memory buffer.
7. Any logging or trace generation passes through `redactSecret()` and `redactObject()`.

## Alternative Flows
- **Credential Rotation**: User updates key; new random IV and auth tag generated, old record overwritten.

## Error Flows
- **Auth Tag Tampering**: If ciphertext or auth tag is modified by 1 bit, decipher throws `Unsupported state or unable to authenticate data`, refusing to emit plaintext.

## Acceptance Criteria
- Given valid secret, encrypted payload contains no plaintext substrings of secret.
- Given tampered auth tag, decryption fails with authentication error.
- Given log payload containing `{ apiKey: "sk-proj-12345678" }`, output is sanitized to `sk-****5678`.

## Data Requirements
- Stored format: `${salt}:${iv}:${authTag}:${ciphertext}` in Base64/Hex encoding.

## Security Implications
- Defense in depth: zero plaintext storage, authenticated encryption, recursive log sanitization.

## Permission Requirements
- Read/write access to local SQLite data directory.

## Test Strategy
- Unit tests: `packages/secure-store/src/index.test.ts`.
