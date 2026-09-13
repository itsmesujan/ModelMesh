# ModelMesh

> **Local-first AI gateway, provider control plane, and unified model router.**

ModelMesh eliminates the operational friction between *"I want to use AI"* and *"my gateway has a healthy, policy-compliant pool of models."* It combines automated provider discovery, legitimate credential orchestration, normalized multi-provider model routing, rate-limit and quota tracking, local hardware discovery, and a deliberately calm developer dashboard into a single local-first service.

[![Tests](https://img.shields.io/badge/tests-30%20passed-success)](file:///c:/MY%20Project/ModelMesh/packages)
[![Providers](https://img.shields.io/badge/providers-369%20registered-blue)](file:///c:/MY%20Project/ModelMesh/packages/provider-registry)
[![Runtime](https://img.shields.io/badge/node-%3E%3D26.0.0-informational)](https://nodejs.org)
[![Storage](https://img.shields.io/badge/storage-native%20node%3Asqlite-blueviolet)](https://nodejs.org/api/sqlite.html)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## Key Highlights

- 🚀 **Zero-Config AutoConnect**: Automatically detects local AI backends (Ollama, LM Studio, vLLM, llama.cpp, LocalAI, Jan) and connects public keyless providers (DuckDuckGo, Pollinations, OpenCode, Chipotle, etc.) without manual credential management.
- 🌐 **Exhaustive Provider Catalog (369 Providers)**: 100% complete integration of the entire OmniRoute provider inventory with zero missing providers across 10 distinct categories.
- 🎯 **Multi-Signal Smart Router**: Routes every request using explicit policy gates (Free, Local, Fast, Cheap, Best, Resilient, Private) and a 9-factor multi-signal scoring equation ($$\text{Score} = \text{PolicyGate} \times \sum W_i S_i$$).
- 🔄 **OpenAI-Compatible Drop-in Gateway**: Connect any standard OpenAI SDK, IDE (Cursor, VS Code, Cline, Windsurf, Zed), or agent framework by pointing to `http://127.0.0.1:4000/v1`. Supports full SSE streaming (`text/event-stream`).
- 🔐 **Zero-Leak Authenticated Vault**: AES-256-GCM authenticated encryption with PBKDF2-HMAC-SHA256 key derivation, in-memory credential zeroing, and recursive secret masking (`sk-****cdef`) across all logs and traces.
- 📊 **Calm Control Center (9 Functional Views)**: Restful dark/light developer dashboard with real-time health metrics, provider configuration, model catalog graph, and an interactive routing simulator.

---

## Provider Ecosystem (369 Registered)

ModelMesh organizes all 369 registered providers under typed trust tiers and connection protocols:

| Category | Count | Primary Auth | Default Trust Tier | Examples |
| :--- | :--- | :--- | :--- | :--- |
| **Cloud Frontier** | 204 | API Key / OAuth | `verified_official` / `generic_compatible` | OpenAI, Anthropic, Google Gemini, Groq, Mistral, xAI, Cohere |
| **Aggregators & Gateways** | 97 | API Key / Proxy | `community_adapter` | OpenRouter, Together AI, Fireworks, Hyperbolic, DeepInfra, Cerebras |
| **Custom & Web Cookie** | 36 | Session Cookie / Token | `unverified` (Human-action required) | ChatGPT Web, Claude Web, DeepSeek Web, Kimi Web, Gemini Web |
| **Local LLM Engines** | 17 | Loopback HTTP | `local_trusted` | Ollama, LM Studio, vLLM, llama.cpp, LocalAI, Jan, KoboldCpp |
| **Keyless (No-Auth)** | 15 | Public / Anonymous | `community_adapter` | Pollinations, DuckDuckGo AI, OpenCode, AI Horde, Chipotle |
| **Total** | **369** | — | — | **Zero missing providers** |

---

## Monorepo Architecture

ModelMesh is structured as a modular TypeScript monorepo powered by Node.js 26 native `--experimental-strip-types` and `node:sqlite`:

```text
ModelMesh/
├── apps/
│   ├── gateway/                 # OpenAI-compatible HTTP proxy + REST Management API
│   └── web/                     # React + Vite Calm Control Center (9 functional views)
├── packages/
│   ├── secure-store/            # AES-256-GCM vault, key derivation & secret redaction
│   ├── provider-registry/       # 369 provider manifests, alias resolution & catalog
│   ├── quota-engine/            # Rate-limit header parser, retry-after & concurrency
│   ├── health-engine/           # Latency EMA (p50/p95), circuit breakers & error classifier
│   ├── model-registry/          # Normalized canonical model graph & concrete offerings
│   ├── policy-engine/           # 8 routing modes with hard compliance filter gates
│   ├── core-router/             # Multi-signal scoring, explainable traces & fallback
│   ├── connector-engine/        # AutoConnect state machine & port probing
│   └── telemetry/               # OpenTelemetry GenAI semantic logging & aggregations
└── docs/                        # Complete specification, architecture & ADR documents
```

---

## Getting Started

### Prerequisites
- Node.js >= 22.0.0 (Node 26 recommended for native `node:sqlite` and type stripping)
- npm >= 10.0.0

### Quick Start

1. **Clone and Install Dependencies**:
   ```bash
   git clone https://github.com/majhi/modelmesh.git
   cd modelmesh
   npm install
   ```

2. **Run Automated Test Suite**:
   ```bash
   npm test
   ```
   *Runs 30 unit, integration, and gateway contract tests across all packages.*

3. **Start the ModelMesh Gateway**:
   ```bash
   npm run gateway
   ```
   The gateway initializes the local SQLite database (`modelmesh.db`), executes AutoConnect across all providers, and listens on `http://127.0.0.1:4000`.

4. **Access the Calm Control Center**:
   Open [http://127.0.0.1:4000](http://127.0.0.1:4000) in your browser.
   To run the standalone Vite development server:
   ```bash
   npm run build:web
   ```

---

## Using ModelMesh as an OpenAI Drop-in

Point any OpenAI SDK or AI development tool to `http://127.0.0.1:4000/v1`:

### cURL
```bash
curl -X POST http://127.0.0.1:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "auto",
    "messages": [
      {"role": "user", "content": "Explain quantum computing in one sentence."}
    ],
    "stream": false
  }'
```

### Python OpenAI Client
```python
from openai import OpenAI

client = OpenAI(
    base_url="http://127.0.0.1:4000/v1",
    api_key="modelmesh-local" # Any string works for local mode
)

response = client.chat.completions.create(
    model="auto", # ModelMesh automatically selects the optimal healthy provider
    messages=[{"role": "user", "content": "Hello ModelMesh!"}],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

---

## Control Plane REST APIs

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/v1/models` | `GET` | Standard OpenAI models list containing normalized inventory |
| `/v1/chat/completions` | `POST` | OpenAI-compatible chat completions (JSON and SSE stream) |
| `/api/overview` | `GET` | Health status, active policy mode, provider counts, p95 latency |
| `/api/providers` | `GET` | All 369 registered providers with live connection statuses |
| `/api/connectors/autoconnect` | `POST` | Triggers asynchronous AutoConnect orchestrator run |
| `/api/connectors/connect` | `POST` | Encrypts and stores API key or session token in local vault |
| `/api/policies` | `GET` | Active routing policy configuration and mode |
| `/api/policies` | `PUT` | Switches active policy mode (`Balanced`, `Free`, `Local`, etc.) |
| `/api/health` | `GET` | Latency EMAs and circuit breaker statuses per provider |
| `/api/telemetry` | `GET` | Aggregated metrics, error rates, token consumption |

---

## Project Documentation

Detailed specifications and architectural decisions are maintained under `/docs`:

- [Requirements Specification](file:///c:/MY%20Project/ModelMesh/docs/REQUIREMENTS.md)
- [Architecture & Data Model](file:///c:/MY%20Project/ModelMesh/docs/ARCHITECTURE.md)
- [Architecture Decision Records (ADRs)](file:///c:/MY%20Project/ModelMesh/docs/adr/)
- [Security & Redaction Protocol](file:///c:/MY%20Project/ModelMesh/docs/SECURITY.md)
- [Testing Strategy & Test Matrix](file:///c:/MY%20Project/ModelMesh/docs/TESTING.md)
- [Feature Specifications](file:///c:/MY%20Project/ModelMesh/docs/features/)
- [Progress Log](file:///c:/MY%20Project/ModelMesh/docs/PROGRESS.md)
- [Changelog](file:///c:/MY%20Project/ModelMesh/docs/CHANGELOG.md)

---

## License

MIT License. Designed with care for privacy-first, resilient AI engineering.
