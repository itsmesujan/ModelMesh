import test from 'node:test';
import assert from 'node:assert';
import { ProviderRegistry, SEED_PROVIDERS } from './index.ts';

test('ProviderRegistry initializes with seed providers', () => {
  const registry = new ProviderRegistry();
  const all = registry.getAll();
  assert.ok(all.length >= 10);
  
  const ollama = registry.get('ollama');
  assert.ok(ollama);
  assert.strictEqual(ollama.category, 'local');
  assert.strictEqual(ollama.trustTier, 'local_trusted');
  assert.strictEqual(ollama.connectors[0].defaultPort, 11434);
});

test('ProviderRegistry filters by category correctly', () => {
  const registry = new ProviderRegistry();
  const locals = registry.getLocalProviders();
  assert.ok(locals.length >= 4); // ollama, lmstudio, vllm, llamacpp
  
  const keyless = registry.getKeylessProviders();
  assert.ok(keyless.length >= 2); // pollinations, duckduckgo
});

test('ProviderRegistry searches correctly', () => {
  const registry = new ProviderRegistry();
  const results = registry.search('groq');
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].providerId, 'groq');
});
