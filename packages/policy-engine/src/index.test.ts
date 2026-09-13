import test from 'node:test';
import assert from 'node:assert';
import { PolicyEngine, PRESET_POLICIES } from './index.ts';
import type { ModelOffering } from '@modelmesh/model-registry';

const samplePaidOffering: ModelOffering = {
  id: 'anthropic:claude-3-5-sonnet',
  canonicalId: 'claude-3-5-sonnet',
  providerId: 'anthropic',
  connectionId: 'conn-ant-1',
  providerModelId: 'claude-3-5-sonnet-20241022',
  costClass: 'high',
  inputPricePerM: 3.0,
  outputPricePerM: 15.0,
  contextWindow: 200000,
  capabilities: ['chat', 'tools', 'vision'],
  isLocal: false
};

const sampleFreeLocalOffering: ModelOffering = {
  id: 'ollama:llama3.3:70b',
  canonicalId: 'llama-3.3-70b',
  providerId: 'ollama',
  connectionId: 'conn-ollama-1',
  providerModelId: 'llama3.3:70b',
  costClass: 'free',
  inputPricePerM: 0,
  outputPricePerM: 0,
  contextWindow: 128000,
  capabilities: ['chat', 'streaming'],
  isLocal: true
};

test('PolicyEngine enforces Free mode gate strictly', () => {
  const engine = new PolicyEngine();
  engine.setMode('Free');

  const paidResult = engine.evaluateGate(samplePaidOffering);
  assert.strictEqual(paidResult.allowed, false);
  assert.ok(paidResult.reasons[0].includes('free offerings only'));

  const freeResult = engine.evaluateGate(sampleFreeLocalOffering);
  assert.strictEqual(freeResult.allowed, true);
});

test('PolicyEngine enforces Local mode gate strictly', () => {
  const engine = new PolicyEngine();
  engine.setMode('Local');

  const cloudResult = engine.evaluateGate(samplePaidOffering);
  assert.strictEqual(cloudResult.allowed, false);
  assert.ok(cloudResult.reasons[0].includes('local machine/LAN'));

  const localResult = engine.evaluateGate(sampleFreeLocalOffering);
  assert.strictEqual(localResult.allowed, true);
});

test('PolicyEngine verifies capability requirements', () => {
  const engine = new PolicyEngine();
  engine.setMode('Balanced');

  // Offering lacks vision
  const result = engine.evaluateGate(sampleFreeLocalOffering, engine.getActivePolicy(), {
    requiredCapabilities: ['vision']
  });

  assert.strictEqual(result.allowed, false);
  assert.ok(result.reasons[0].includes('lacks required capability "vision"'));
});
