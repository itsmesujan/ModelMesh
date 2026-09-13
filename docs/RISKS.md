# Risk Management Matrix

| Risk ID | Description | Severity | Likelihood | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **RSK-001** | Upstream provider API drift (endpoint URLs, models) | High | Medium | Provider Registry is separated into declarative manifests with schema versioning, enabling runtime updates without binary recompilation. |
| **RSK-002** | Rate limits & 429 quota exhaustion | Medium | High | Quota engine tracks `x-ratelimit-*` headers, health engine tracks cooldowns, and router triggers automatic fallbacks. |
| **RSK-003** | Local port binding conflict (e.g. port 4000 in use) | Low | Medium | Gateway supports configurable `PORT` env var and auto-probes next available port if requested. |
| **RSK-004** | Accidental secret leakage in logs or traces | High | Low | Redaction layer systematically masks all keys and tokens before writing to telemetry or console. |
| **RSK-005** | SSRF or unauthorized LAN probing | High | Low | LAN discovery is disabled by default; loopback discovery is restricted to allowlisted loopback ports with strict timeout. |
