# ADR-0004: Calm Developer Control Center Architecture

## Status
Accepted

## Context
AI developer dashboards often suffer from sensory overload: flashing cards, excessive marketing banners, uninformative circular meters, and confusing navigation. Developers operating an AI gateway require a calming, high-density, low-distraction interface that conveys system health, model availability, and routing policies clearly at a glance.

## Decision
1. **Design Principles**:
   - Palette: Neutral dark (`#0F1115`) and light (`#F7F8FA`) slate tones with a single restrained indigo accent (`#6366F1`).
   - Accessible Status Indicators: Never rely on color alone. Use composite status badges with icon + text + geometric dot (`Connected`, `Auth-ready`, `Degraded`, `Blocked`).
   - Typography: Clean modern sans-serif with monospace accents for model IDs, ports, and tokens.
   - Zero distracting animations or emoji clutter.
2. **Architecture & 9 Functional Views**:
   - Built with React 18 and Vite with zero heavy external UI component libraries.
   - Organized into 9 functional views:
     1. **Overview**: Key gateway statistics, active policy, p95 latency, connected count.
     2. **Providers**: Full searchable 369-provider catalog with live category counts and vault key entry.
     3. **AutoConnect**: Live visual state machine showing discovery, validation, and human action queue.
     4. **Models**: Normalized model graph, canonical mappings, context limits, and cost classes.
     5. **Routing**: Interactive live simulator to test prompts against policy presets with full decision traces.
     6. **Usage**: Aggregated token counts, request counts, and cost estimates.
     7. **Health**: Provider latency EMAs and circuit breaker status meters.
     8. **Policies**: Policy mode selector (Balanced, Free, Local, Fast, Cheap, Best, Resilient, Private).
     9. **Settings**: Vault passkey management, port configuration, and audit log controls.
3. **Deployment**:
   - Built as static assets (`apps/web/dist`) and served directly by the ModelMesh gateway HTTP server, requiring no separate web server process in production.

## Consequences
- **Positive**: Low memory footprint; zero cross-origin configuration in production; intuitive developer experience; accessible status representation.
- **Negative**: Requires rebuilding the web bundle (`npm run build:web`) when frontend code is changed.
