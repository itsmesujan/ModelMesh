# FEAT-005: OpenAI-Compatible Gateway Proxy

## Unique ID
`FEAT-005`

## Purpose
Expose a high-performance, 100% standard OpenAI-compatible REST and SSE streaming interface to drop seamlessly into existing agent harnesses, developer IDEs, and client SDKs.

## User Story
As a developer using Cursor, Claude Code, or Python OpenAI SDK, I want to change `base_url="http://127.0.0.1:4000/v1"` and immediately use all ModelMesh routed models with streaming responses and standard error formats.

## Preconditions
- Gateway HTTP service started on port 4000.
- At least one healthy provider connected in the routing pool.

## Main Flow
1. Client issues `POST /v1/chat/completions` with JSON payload:
   ```json
   {
     "model": "auto",
     "messages": [{"role": "user", "content": "Hi"}],
     "stream": true
   }
   ```
2. Gateway validates payload schema and checks if client requested SSE streaming (`stream: true`).
3. Dispatches to CoreRouter, which resolves the highest-scoring candidate offering.
4. Translates request format to target provider schema (OpenAI format, Anthropic format, or local format).
5. If `stream: true`, sets `Content-Type: text/event-stream; charset=utf-8` and streams chunks formatted as `data: {"choices":[{"delta":{"content":"..."}}]}\n\n`.
6. Concludes stream with `data: [DONE]\n\n`.
7. Records request tokens and duration in TelemetryManager.

## Alternative Flows
- **JSON Non-Streaming**: When `stream: false`, returns standard JSON response body with `usage` block.
- **GET /v1/models**: Returns `{ "object": "list", "data": [...] }` compatible with OpenAI model enumeration.

## Error Flows
- **Malformed JSON**: Return 400 with `{ "error": { "message": "...", "type": "invalid_request_error" } }`.
- **Route Failure**: Return 502 with fallback summary.

## Acceptance Criteria
- Response to `GET /v1/models` passes standard OpenAI SDK client validation.
- Response to `POST /v1/chat/completions` emits valid SSE tokens followed by `[DONE]`.
- Compatible with official `openai` Python and Node.js SDKs.

## Data Requirements
- Incoming request body conforming to OpenAI Chat Completion specification.

## Security Implications
- CORS headers configured for local development (`127.0.0.1`).
- Upstream authentication headers injected by gateway; client cannot forge or steal upstream credentials.

## Permission Requirements
- TCP port binding permission for port 4000.

## Test Strategy
- Gateway contract test suite: `apps/gateway/src/index.test.ts`.
