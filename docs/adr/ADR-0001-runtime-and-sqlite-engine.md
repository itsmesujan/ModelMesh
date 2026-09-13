# ADR-0001: Selection of Node.js 26 Native SQLite & TypeScript Monorepo

## Status
Accepted

## Context
ModelMesh requires a local-first, low-overhead database and proxy runtime capable of running reliably on developer workstations (including Windows 11).
Key constraints:
1. Native Rust toolchains (`cargo`) are not currently installed on the host system.
2. Compiling native SQLite wrappers (such as `better-sqlite3`) on Windows frequently encounters MSVC / Python build toolchain friction.
3. The host environment provides **Node.js v26.7.0**, which features stable, built-in synchronous SQLite through `node:sqlite`.
4. The frontend requires a responsive, high-fidelity developer dashboard with instant hot reloading and clean component modularity.

## Decision
1. We select **Node.js v26** with built-in `node:sqlite` for database persistence. This yields zero native build dependencies while providing synchronous, crash-safe SQLite access with WAL mode.
2. We structure the project as an **npm workspaces** monorepo:
   - `packages/secure-store`
   - `packages/provider-registry`
   - `packages/quota-engine`
   - `packages/health-engine`
   - `packages/model-registry`
   - `packages/policy-engine`
   - `packages/core-router`
   - `packages/connector-engine`
   - `packages/telemetry`
   - `apps/gateway` (Fastify/Node HTTP server)
   - `apps/web` (Vite + React + TypeScript)
3. We select **React + Vite + Vanilla CSS tokens** for the control center dashboard.

## Consequences
- **Positive**: Zero external native C++ build prerequisites on Windows; instant project installation; full TypeScript type-safety across all packages; high performance local proxying.
- **Negative**: Node-specific built-in `node:sqlite` requires Node.js >= 22 (and optimal in Node 26). This is completely satisfied by the host system's Node v26.7.0.
