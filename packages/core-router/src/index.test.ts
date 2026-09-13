import test from 'node:test';
import assert from 'node:assert';
import { CoreRouter } from './index.ts';
import { ModelRegistry, type ModelOffering } from '@modelmesh/model-registry';
import { PolicyEngine } from '@modelmesh/policy-engine';
import { HealthEngine } from '@modelmesh/health-engine';
import { QuotaEngine } from '@modelmesh/quota-engine';

test('CoreRouter selects high-scoring candidate and builds explainable fallback chain', () => {
  const modelRegistry = new ModelRegistry();
  const policyEngine = new PolicyEngine();
  const healthEngine = new HealthEngine();
  const quotaEngine = new QuotaEngine();

  const groqOffering: ModelOffering = {
    id: 'groq:llama-3.3-70b-versatile',
    canonicalId: 'llama-3.3-70b',
    providerId: 'groq',
    connectionId: 'conn-groq',
    providerModelId: 'llama-3.3-70b-versatile',
    costClass: 'free',
    inputPricePerM: 0.59,
    outputPricePerM: 0.79,
    contextWindow: 128000,
    capabilities: ['chat', 'tools', 'streaming'],
    isLocal: false
  };

  const ollamaOffering: ModelOffering = {
    id: 'ollama:llama3.3:70b',
    canonicalId: 'llama-3.3-70b',
    providerId: 'ollama',
    connectionId: 'conn-ollama',
    providerModelId: 'llama3.3:70b',
    costClass: 'free',
    inputPricePerM: 0,
    outputPricePerM: 0,
    contextWindow: 128000,
    capabilities: ['chat', 'streaming'],
    isLocal: true
  };

  modelRegistry.registerOffering(groqOffering);
  modelRegistry.registerOffering(ollamaOffering);

  // Setup mock health: Groq has 150ms latency, Ollama has 800ms latency
  healthEngine.recordSuccess('conn-groq', 150);
  healthEngine.recordSuccess('conn-ollama', 800);

  const router = new CoreRouter(modelRegistry, policyEngine, healthEngine, quotaEngine);

  // 1. In Balanced mode, Groq should win on lower latency
  policyEngine.setMode('Balanced');
  const decisionBalanced = router.route('llama-3.3-70b');

  assert.ok(decisionBalanced.selectedCandidate);
  assert.strictEqual(decisionBalanced.selectedCandidate.providerId, 'groq');
  assert.strictEqual(decisionBalanced.fallbackChain.length, 1);
  assert.strictEqual(decisionBalanced.fallbackChain[0].providerId, 'ollama');
  assert.ok(decisionBalanced.rationale.includes('Selected groq'));

  // 2. In Local mode, Ollama should win and Groq is rejected
  policyEngine.setMode('Local');
  const decisionLocal = router.route('llama-3.3-70b');

  assert.ok(decisionLocal.selectedCandidate);
  assert.strictEqual(decisionLocal.selectedCandidate.providerId, 'ollama');
  assert.strictEqual(decisionLocal.fallbackChain.length, 0); // Groq rejected by policy gate
});
