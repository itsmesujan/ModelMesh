import test from 'node:test';
import assert from 'node:assert';
import { QuotaEngine } from './index.ts';

test('QuotaEngine parses rate-limit headers accurately', () => {
  const engine = new QuotaEngine();
  const connId = 'groq-conn-1';
  engine.getOrCreate(connId, 'groq', 'recurring-free');

  const headers = {
    'x-ratelimit-limit-requests': '30',
    'x-ratelimit-remaining-requests': '25',
    'x-ratelimit-limit-tokens': '6000',
    'x-ratelimit-remaining-tokens': '5000'
  };

  engine.updateFromHeaders(connId, headers);

  const entry = engine.getOrCreate(connId, 'groq');
  assert.strictEqual(entry.rateLimit.limitRequests, 30);
  assert.strictEqual(entry.rateLimit.remainingRequests, 25);
  assert.strictEqual(entry.rateLimit.limitTokens, 6000);
  assert.strictEqual(entry.rateLimit.remainingTokens, 5000);

  const score = engine.calculateHeadroomScore(connId);
  assert.ok(score > 0.7);
});

test('QuotaEngine throttles on active retry-after header', () => {
  const engine = new QuotaEngine();
  const connId = 'conn-429';
  engine.getOrCreate(connId, 'google-ai-studio', 'recurring-free');

  engine.updateFromHeaders(connId, {
    'retry-after': '60'
  });

  const score = engine.calculateHeadroomScore(connId);
  assert.strictEqual(score, 0.0);
});

test('QuotaEngine tracks concurrency cleanly', () => {
  const engine = new QuotaEngine();
  const connId = 'local-ollama';
  const entry = engine.getOrCreate(connId, 'ollama', 'rate-limited-free');
  assert.strictEqual(entry.activeConcurrency, 0);

  engine.trackRequestStart(connId);
  assert.strictEqual(entry.activeConcurrency, 1);

  engine.trackRequestEnd(connId, 150);
  assert.strictEqual(entry.activeConcurrency, 0);
  assert.strictEqual(entry.totalTokensUsed, 150);
});
