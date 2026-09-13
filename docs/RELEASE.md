# Release & Packaging Specification

## Release Artifacts
1. **ModelMesh Gateway Daemon**: Packaged as a standalone Node.js executable or CLI runner (`npx modelmesh` / `node apps/gateway/dist/index.js`).
2. **ModelMesh Control Center Dashboard**: Built as a static production SPA bundle (`apps/web/dist`) served directly by the gateway on `http://127.0.0.1:4000/` or standalone via Vite preview.

## Pre-Release Verification Checklist
- [x] Clean typecheck: `npm run typecheck` across all packages passes with 0 errors.
- [x] Unit tests pass: `npm test` across all workspaces (30/30 tests passing).
- [x] Provider catalog completeness: All 369 providers registered with zero missing.
- [x] Contract tests pass: `/v1/models` and `/v1/chat/completions` pass validation.
- [x] Web frontend build: `npm run build:web` succeeds with zero errors.
- [x] Zero secret leaks verified in logs and build artifacts.
- [x] SQLite schema migrations initialize idempotently.
- [x] Local loopback discovery properly discovers local engines without hanging.

## Release Smoke Test Run
```bash
# 1. Typecheck and unit tests
npm run typecheck
npm test

# 2. Build production assets
npm run build:web

# 3. Boot gateway daemon
npm run gateway &

# 4. Smoke test overview and provider count
curl http://127.0.0.1:4000/api/overview
# Verify: "totalProviders": 369, "gatewayStatus": "healthy"
```

