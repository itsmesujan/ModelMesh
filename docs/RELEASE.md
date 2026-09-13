# Release & Packaging Specification

## Release Artifacts
1. **ModelMesh Gateway Daemon**: Packaged as a standalone Node.js executable or CLI runner (`npx modelmesh` / `node apps/gateway/dist/index.js`).
2. **ModelMesh Control Center Dashboard**: Built as a static production SPA bundle (`apps/web/dist`) served directly by the gateway on `http://127.0.0.1:4000/` or standalone via Vite preview.

## Pre-Release Verification Checklist
- [ ] Clean typecheck: `npm run typecheck` across all packages passes with 0 errors.
- [ ] Unit tests pass: `npm test` across all workspaces.
- [ ] Contract tests pass: `/v1/models` and `/v1/chat/completions` pass validation.
- [ ] Zero secret leaks verified in logs and build artifacts.
- [ ] SQLite schema migrations initialize idempotently.
- [ ] Local loopback discovery properly discovers local engines without hanging.
