import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createGatewayServer } from './index.ts';

const testDbPath = path.join(process.cwd(), '.modelmesh_test_data', 'test.db');

test('Gateway OpenAI Compatibility and Control API Contract Suite', async (t) => {
  const server = createGatewayServer(':memory:');
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  t.after(() => {
    server.close();
  });

  // 1. GET /v1/models
  await t.test('GET /v1/models returns standard OpenAI models list', async () => {
    const res = await fetch(`${baseUrl}/v1/models`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.object, 'list');
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length > 0);
    const hasCanonical = body.data.some((m: any) => m.id === 'llama-3.3-70b');
    assert.ok(hasCanonical);
  });

  // 2. POST /v1/chat/completions (non-streaming)
  await t.test('POST /v1/chat/completions returns valid response structure', async () => {
    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'auto',
        messages: [{ role: 'user', content: 'Hello ModelMesh' }]
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.object, 'chat.completion');
    assert.ok(Array.isArray(body.choices));
    assert.ok(body.choices.length > 0);
    assert.strictEqual(body.choices[0].message.role, 'assistant');
    assert.ok(body.choices[0].message.content.length > 0);
  });

  // 3. POST /v1/chat/completions (streaming SSE)
  await t.test('POST /v1/chat/completions with stream=true emits SSE chunks and [DONE]', async () => {
    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'auto',
        messages: [{ role: 'user', content: 'Stream test' }],
        stream: true
      })
    });

    assert.strictEqual(res.status, 200);
    assert.ok(res.headers.get('content-type')?.includes('text/event-stream'));
    
    const text = await res.text();
    assert.ok(text.includes('data: {"id":'));
    assert.ok(text.includes('data: [DONE]'));
  });

  // 4. GET /api/overview
  await t.test('GET /api/overview returns healthy gateway metrics', async () => {
    const res = await fetch(`${baseUrl}/api/overview`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.gatewayStatus, 'healthy');
    assert.ok(body.totalProviders >= 10);
    assert.ok(typeof body.connectedProviders === 'number');
  });

  // 5. Policy Mode switching
  await t.test('PUT /api/policies switches active mode cleanly', async () => {
    const putRes = await fetch(`${baseUrl}/api/policies`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'Free' })
    });
    assert.strictEqual(putRes.status, 200);
    const putBody = await putRes.json();
    assert.strictEqual(putBody.activePolicy.mode, 'Free');

    const getRes = await fetch(`${baseUrl}/api/policies`);
    const getBody = await getRes.json();
    assert.strictEqual(getBody.activePolicy.mode, 'Free');
  });
});
