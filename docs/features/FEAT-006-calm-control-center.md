# FEAT-006: Calm Developer Control Center

## Unique ID
`FEAT-006`

## Purpose
Provide a high-density, low-distraction visual control plane for gateway operators across 9 core views with accessible status badges, real-time metrics, provider vault configuration, and an interactive routing simulator.

## User Story
As an AI engineer, I want a calm, responsive dashboard where I can monitor gateway latency, configure provider keys, switch routing policies, and simulate routes, without flashing animations or visual clutter.

## Preconditions
- Gateway running and serving static dashboard bundle from `apps/web/dist` or Vite dev server.

## Main Flow
1. Operator navigates to `http://127.0.0.1:4000/`.
2. Dashboard fetches `/api/overview` and populates summary cards.
3. Operator selects **Providers**: displays 369 providers with live category counts (`Cloud: 204`, `Aggregators: 97`, `Local: 17`, `Keyless: 15`, `Custom: 36`).
4. Operator selects a provider, enters an API key or browser session token, and clicks "Save & Connect".
5. Key is encrypted into local vault via `POST /api/connectors/connect` and connection state updates to `Connected`.
6. Operator navigates to **Routing** view: inputs test prompt and runs simulator to see real-time 9-factor scores and fallback decision traces.
7. Operator switches active mode in **Policies** (e.g. from `Balanced` to `Free Only`).

## Alternative Flows
- **Dark/Light Theme Toggle**: One-click toggle between `#0F1115` slate dark and `#F7F8FA` clean light.
- **Provider Search**: Live instant filter matching name, provider ID, or description.

## Error Flows
- **Gateway Disconnected**: Show calm offline banner with reconnection countdown.
- **Vault Encryption Failure**: Display non-blocking error toast without clearing user input.

## Acceptance Criteria
- 9 views navigable via sidebar: Overview, Providers, AutoConnect, Models, Routing, Usage, Health, Policies, Settings.
- Status indicators combine icon + text + geometric dot (accessible for color-blind users).
- Vite build completes with zero errors and < 200KB gzipped bundle size.

## Data Requirements
- Consumes JSON from `/api/*` REST management endpoints.

## Security Implications
- Vault inputs use password fields; keys never echoed back in API responses or DOM.

## Permission Requirements
- Browser web access to `http://127.0.0.1:4000`.

## Test Strategy
- Component & bundle build verification: `npm run build:web`.
- Gateway contract suite validating `/api/*` management endpoints.
