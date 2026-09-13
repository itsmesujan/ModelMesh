import test from 'node:test';
import assert from 'node:assert';
import { HealthEngine } from './index.ts';

test('HealthEngine tracks success and updates latency EMA', () => {
  const engine = new HealthEngine();
  const connId = 'groq-1';
  engine.getOrCreateProfile(connId, 'groq');

  engine.recordSuccess(connId, 120);
  engine.recordSuccess(connId, 140);

  const profile = engine.getOrCreateProfile(connId, 'groq');
  assert.strictEqual(profile.circuitState, 'CLOSED');
  assert.strictEqual(profile.consecutiveFailures, 0);
  assert.ok(profile.healthScore >= 0.9);
  assert.ok(profile.p50LatencyMs < 250);
});

test('HealthEngine opens circuit after consecutive 503 failures', () => {
  const engine = new HealthEngine();
  const connId = 'failing-provider';
  engine.getOrCreateProfile(connId, 'custom');

  engine.recordFailure(connId, 503, 'Service Unavailable');
  engine.recordFailure(connId, 503, 'Service Unavailable');
  assert.strictEqual(engine.canAcceptRequests(connId), true);

  engine.recordFailure(connId, 503, 'Service Unavailable');
  const profile = engine.getOrCreateProfile(connId, 'custom');
  assert.strictEqual(profile.circuitState, 'OPEN');
  assert.strictEqual(profile.healthScore, 0.0);
  assert.strictEqual(engine.canAcceptRequests(connId), false);
});

test('HealthEngine does not trip circuit on 400 Bad Request client errors', () => {
  const engine = new HealthEngine();
  const connId = 'client-err-provider';
  engine.getOrCreateProfile(connId, 'groq');

  for (let i = 0; i < 5; i++) {
    const classification = engine.recordFailure(connId, 400, 'Invalid parameters');
    assert.strictEqual(classification, 'CLIENT_ERROR');
  }

  const profile = engine.getOrCreateProfile(connId, 'groq');
  assert.strictEqual(profile.circuitState, 'CLOSED');
  assert.strictEqual(profile.consecutiveFailures, 0);
});
