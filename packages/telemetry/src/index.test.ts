import test from 'node:test';
import assert from 'node:assert';
import { TelemetryManager } from './index.ts';

test('TelemetryManager aggregates requests, errors, tokens, and percentiles', () => {
  const manager = new TelemetryManager();

  manager.record({
    requestId: 'req-1',
    canonicalModel: 'llama-3.3-70b',
    providerId: 'groq',
    providerModelId: 'llama-3.3-70b-versatile',
    statusCode: 200,
    latencyMs: 120,
    promptTokens: 50,
    completionTokens: 100,
    totalTokens: 150,
    estimatedCostUsd: 0.0001,
    policyMode: 'Balanced',
    isStream: false
  });

  manager.record({
    requestId: 'req-2',
    canonicalModel: 'gpt-4o-mini',
    providerId: 'pollinations',
    providerModelId: 'openai',
    statusCode: 200,
    latencyMs: 350,
    promptTokens: 40,
    completionTokens: 80,
    totalTokens: 120,
    estimatedCostUsd: 0.0,
    policyMode: 'Free',
    isStream: true
  });

  const summary = manager.getSummary();
  assert.strictEqual(summary.totalRequests, 2);
  assert.strictEqual(summary.totalErrors, 0);
  assert.strictEqual(summary.totalTokens, 270);
  assert.strictEqual(summary.requestsByProvider['groq'], 1);
  assert.strictEqual(summary.requestsByProvider['pollinations'], 1);
  assert.ok(summary.p50LatencyMs > 0);
});
