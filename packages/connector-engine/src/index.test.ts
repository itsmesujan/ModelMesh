import test from 'node:test';
import assert from 'node:assert';
import { ConnectorEngine } from './index.ts';
import { ProviderRegistry } from '@modelmesh/provider-registry';
import { ModelRegistry } from '@modelmesh/model-registry';
import { VaultManager } from '@modelmesh/secure-store';

test('ConnectorEngine runs AutoConnect, connects keyless, queues human action and api keys', async () => {
  const providerRegistry = new ProviderRegistry();
  const modelRegistry = new ModelRegistry();
  const vaultManager = new VaultManager('test-key');

  const connectorEngine = new ConnectorEngine(providerRegistry, modelRegistry, vaultManager);
  
  // Execute AutoConnect run (with loopback scan disabled for determinism in unit tests)
  const run = await connectorEngine.executeAutoConnectRun({ allowLoopback: false });

  assert.strictEqual(run.status, 'completed');
  assert.ok(run.steps.length >= 10);
  assert.ok(run.connectedCount >= 2); // Pollinations and DuckDuckGo keyless connect automatically
  assert.ok(run.totalModelsAvailable >= 4);

  // Check keyless provider step
  const pollinationsStep = run.steps.find(s => s.providerId === 'pollinations');
  assert.ok(pollinationsStep);
  assert.strictEqual(pollinationsStep.state, 'Connected');

  // Check human action step
  const humanStep = run.steps.find(s => s.connectorType === 'human_action');
  assert.ok(humanStep);
  assert.strictEqual(humanStep.state, 'Human-action');

  // Check uncredentialed API key provider step
  const groqStep = run.steps.find(s => s.providerId === 'groq');
  assert.ok(groqStep);
  assert.strictEqual(groqStep.state, 'Auth-ready');
});
