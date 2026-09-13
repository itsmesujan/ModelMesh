import test from 'node:test';
import assert from 'node:assert';
import { ProviderRegistry, SEED_PROVIDERS, OMNIROUTE_CATALOG } from './index.ts';

test('ProviderRegistry initializes with exhaustive seed providers (360+)', () => {
  const registry = new ProviderRegistry();
  const all = registry.getAll();
  assert.ok(all.length >= 360, `Expected at least 360 providers, got ${all.length}`);
  assert.strictEqual(registry.count(), all.length);
  
  const ollama = registry.get('ollama');
  assert.ok(ollama);
  assert.strictEqual(ollama.category, 'local');
  assert.strictEqual(ollama.trustTier, 'local_trusted');
  assert.strictEqual(ollama.connectors[0].defaultPort, 11434);
});

test('ProviderRegistry filters by category correctly across all categories', () => {
  const registry = new ProviderRegistry();
  const locals = registry.getLocalProviders();
  assert.ok(locals.length >= 14, `Expected >= 14 local providers, got ${locals.length}`);
  
  const keyless = registry.getKeylessProviders();
  assert.ok(keyless.length >= 12, `Expected >= 12 keyless providers, got ${keyless.length}`);

  const aggregators = registry.getAggregators();
  assert.ok(aggregators.length >= 80, `Expected >= 80 aggregators, got ${aggregators.length}`);

  const oauth = registry.getOAuthProviders();
  assert.ok(oauth.length >= 25, `Expected >= 25 OAuth providers, got ${oauth.length}`);

  const humanAction = registry.getHumanActionProviders();
  assert.ok(humanAction.length >= 30, `Expected >= 30 human action providers, got ${humanAction.length}`);
});

test('ProviderRegistry searches correctly with multi-result matching', () => {
  const registry = new ProviderRegistry();
  const results = registry.search('groq');
  assert.ok(results.length >= 1, 'Should find at least 1 match for groq');
  assert.ok(results.some(p => p.providerId === 'groq'), 'Direct groq should be in matches');
});

test('ProviderRegistry contains zero missing OmniRoute keyless and OAuth providers', () => {
  const registry = new ProviderRegistry();
  
  // No-auth keyless
  const keylessIds = ['duckduckgo-web', 'opencode', 'theoldllm', 'chipotle'];
  for (const id of keylessIds) {
    const p = registry.get(id);
    assert.ok(p, `Keyless provider ${id} must exist in registry`);
    assert.ok(p.connectors.some(c => c.type === 'keyless'), `${id} should have keyless connector`);
  }

  // OAuth & device flow
  const oauthIds = ['clinepass', 'devin-cli', 'trae', 'xai-oauth', 'zed-hosted'];
  for (const id of oauthIds) {
    const p = registry.get(id);
    assert.ok(p, `OAuth provider ${id} must exist in registry`);
    assert.ok(p.connectors.some(c => c.type === 'oauth' || c.type === 'device_flow'), `${id} should have oauth connector`);
  }
});

test('ProviderRegistry contains web cookie providers flagged with human action', () => {
  const registry = new ProviderRegistry();
  const cookieIds = ['chatgpt-web', 'deepseek-web', 'kimi-web', 'gemini-web', 'grok-web'];
  for (const id of cookieIds) {
    const p = registry.get(id);
    assert.ok(p, `Cookie provider ${id} must exist`);
    assert.strictEqual(p.policy.requiresHumanAction, true, `${id} must require human action`);
    assert.strictEqual(p.policy.automation, 'user_action');
    assert.ok(p.connectors.some(c => c.type === 'human_action'));
  }
});

test('ProviderRegistry contains popular inference and aggregator providers', () => {
  const registry = new ProviderRegistry();
  const cloudIds = ['together', 'fireworks', 'hyperbolic', 'deepinfra', 'cerebras', 'sambanova', 'elevenlabs', 'tavily'];
  for (const id of cloudIds) {
    const p = registry.get(id);
    assert.ok(p, `Cloud provider ${id} must exist`);
    assert.ok(p.connectors.some(c => c.type === 'api_key'));
  }
});

test('ProviderRegistry resolves aliases transparently', () => {
  const registry = new ProviderRegistry();
  const fromAlias = registry.get('ollama-local');
  assert.ok(fromAlias, 'ollama-local should resolve');
  assert.strictEqual(fromAlias.category, 'local');
});
