import test from 'node:test';
import assert from 'node:assert';
import { ModelRegistry, type ModelOffering } from './index.ts';

test('ModelRegistry resolves canonical models and offerings', () => {
  const registry = new ModelRegistry();
  
  const offeringGroq: ModelOffering = {
    id: 'groq:llama-3.3-70b-versatile',
    canonicalId: 'llama-3.3-70b',
    providerId: 'groq',
    connectionId: 'conn-groq-1',
    providerModelId: 'llama-3.3-70b-versatile',
    costClass: 'free',
    inputPricePerM: 0.59,
    outputPricePerM: 0.79,
    contextWindow: 128000,
    capabilities: ['chat', 'tools', 'streaming'],
    isLocal: false
  };

  const offeringOllama: ModelOffering = {
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

  registry.registerOffering(offeringGroq);
  registry.registerOffering(offeringOllama);

  // Resolution via canonical ID
  const resolvedCanonical = registry.resolveOfferings('llama-3.3-70b');
  assert.strictEqual(resolvedCanonical.length, 2);

  // Resolution via exact provider model ID
  const resolvedGroq = registry.resolveOfferings('llama-3.3-70b-versatile');
  assert.strictEqual(resolvedGroq.length, 1);
  assert.strictEqual(resolvedGroq[0].providerId, 'groq');

  // Resolution via "auto"
  const resolvedAuto = registry.resolveOfferings('auto');
  assert.strictEqual(resolvedAuto.length, 2);
});
