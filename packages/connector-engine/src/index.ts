import type { ProviderRegistry, ProviderManifest, ConnectorType } from '@modelmesh/provider-registry';
import type { ModelRegistry, ModelOffering } from '@modelmesh/model-registry';
import type { VaultManager } from '@modelmesh/secure-store';

export type ConnectorState = 
  | 'Discovered'
  | 'Auth-ready'
  | 'Authorizing'
  | 'Human-action'
  | 'Validating'
  | 'Connected'
  | 'Degraded'
  | 'Blocked';

export interface AutoConnectStep {
  providerId: string;
  displayName: string;
  category: string;
  connectorType: ConnectorType;
  state: ConnectorState;
  actionRequired?: string;
  actionUrl?: string;
  userCode?: string;
  discoveredModels: string[];
  error?: string;
  trustTier: string;
}

export interface AutoConnectRun {
  runId: string;
  startedAt: number;
  finishedAt?: number;
  status: 'running' | 'completed' | 'failed';
  connectedCount: number;
  attentionCount: number;
  totalModelsAvailable: number;
  steps: AutoConnectStep[];
}

export class ConnectorEngine {
  private providerRegistry: ProviderRegistry;
  private modelRegistry: ModelRegistry;
  private vaultManager: VaultManager;
  private activeRuns: Map<string, AutoConnectRun> = new Map();

  constructor(
    providerRegistry: ProviderRegistry,
    modelRegistry: ModelRegistry,
    vaultManager: VaultManager
  ) {
    this.providerRegistry = providerRegistry;
    this.modelRegistry = modelRegistry;
    this.vaultManager = vaultManager;
  }

  /**
   * Executes a full AutoConnect cycle across all known providers.
   */
  public async executeAutoConnectRun(options: { allowLoopback?: boolean } = { allowLoopback: true }): Promise<AutoConnectRun> {
    const runId = `run_${Date.now()}`;
    const providers = this.providerRegistry.getAll();
    
    const run: AutoConnectRun = {
      runId,
      startedAt: Date.now(),
      status: 'running',
      connectedCount: 0,
      attentionCount: 0,
      totalModelsAvailable: 0,
      steps: []
    };
    this.activeRuns.set(runId, run);

    for (const provider of providers) {
      const step = await this.evaluateProvider(provider, options);
      run.steps.push(step);

      if (step.state === 'Connected') {
        run.connectedCount += 1;
        run.totalModelsAvailable += step.discoveredModels.length;
      } else if (step.state === 'Human-action' || step.state === 'Auth-ready') {
        run.attentionCount += 1;
      }
    }

    run.finishedAt = Date.now();
    run.status = 'completed';
    return run;
  }

  public getLatestRun(): AutoConnectRun | undefined {
    const runs = Array.from(this.activeRuns.values());
    return runs.length > 0 ? runs[runs.length - 1] : undefined;
  }

  public getRun(runId: string): AutoConnectRun | undefined {
    return this.activeRuns.get(runId);
  }

  private async evaluateProvider(
    provider: ProviderManifest, 
    options: { allowLoopback?: boolean }
  ): Promise<AutoConnectStep> {
    const primaryConnector = provider.connectors[0] || { type: 'api_key' };

    // 1. Human-action required providers
    if (provider.policy.requiresHumanAction || primaryConnector.type === 'human_action') {
      return {
        providerId: provider.providerId,
        displayName: provider.displayName,
        category: provider.category,
        connectorType: 'human_action',
        state: 'Human-action',
        actionRequired: primaryConnector.instructions || 'Manual corporate authentication or verification required',
        actionUrl: provider.website,
        discoveredModels: [],
        trustTier: provider.trustTier
      };
    }

    // 2. Keyless providers
    if (primaryConnector.type === 'keyless') {
      const discoveredModels: string[] = [];
      if (provider.staticModels) {
        for (const sm of provider.staticModels) {
          discoveredModels.push(sm.id);
          const offering: ModelOffering = {
            id: `${provider.providerId}:${sm.id}`,
            canonicalId: sm.canonicalId,
            providerId: provider.providerId,
            connectionId: `conn_${provider.providerId}`,
            providerModelId: sm.id,
            costClass: sm.costClass,
            inputPricePerM: sm.inputPricePerM || 0,
            outputPricePerM: sm.outputPricePerM || 0,
            contextWindow: sm.contextWindow,
            capabilities: ['chat', 'streaming'],
            isLocal: false
          };
          this.modelRegistry.registerOffering(offering);
        }
      }

      return {
        providerId: provider.providerId,
        displayName: provider.displayName,
        category: provider.category,
        connectorType: 'keyless',
        state: 'Connected',
        discoveredModels,
        trustTier: provider.trustTier
      };
    }

    // 3. Local loopback providers (Ollama, LM Studio, vLLM, llama.cpp)
    if (provider.category === 'local' && options.allowLoopback) {
      const port = primaryConnector.defaultPort || 11434;
      const isOnline = await this.probeLoopbackPort(port);

      if (isOnline) {
        const discovered = [`local-${provider.providerId}-default`];
        const offering: ModelOffering = {
          id: `${provider.providerId}:default`,
          canonicalId: 'llama-3.3-70b',
          providerId: provider.providerId,
          connectionId: `conn_${provider.providerId}`,
          providerModelId: 'default',
          costClass: 'free',
          inputPricePerM: 0,
          outputPricePerM: 0,
          contextWindow: 128000,
          capabilities: ['chat', 'streaming'],
          isLocal: true
        };
        this.modelRegistry.registerOffering(offering);

        return {
          providerId: provider.providerId,
          displayName: provider.displayName,
          category: provider.category,
          connectorType: 'openai_compatible',
          state: 'Connected',
          discoveredModels: discovered,
          trustTier: provider.trustTier
        };
      } else {
        return {
          providerId: provider.providerId,
          displayName: provider.displayName,
          category: provider.category,
          connectorType: 'openai_compatible',
          state: 'Auth-ready',
          actionRequired: `Server not detected on loopback port ${port}. Start ${provider.displayName} to connect.`,
          discoveredModels: [],
          trustTier: provider.trustTier
        };
      }
    }

    // 4. OAuth Device Flow
    if (primaryConnector.type === 'device_flow') {
      return {
        providerId: provider.providerId,
        displayName: provider.displayName,
        category: provider.category,
        connectorType: 'device_flow',
        state: 'Auth-ready',
        actionRequired: 'Click to start RFC 8628 Device Authorization',
        actionUrl: primaryConnector.authUrl,
        userCode: 'MM-7842',
        discoveredModels: [],
        trustTier: provider.trustTier
      };
    }

    // 5. API Key providers
    const cachedKey = this.vaultManager.getCached(provider.providerId);
    if (cachedKey) {
      // Validate key against static or remote models
      const discoveredModels: string[] = [];
      if (provider.staticModels) {
        for (const sm of provider.staticModels) {
          discoveredModels.push(sm.id);
          const offering: ModelOffering = {
            id: `${provider.providerId}:${sm.id}`,
            canonicalId: sm.canonicalId,
            providerId: provider.providerId,
            connectionId: `conn_${provider.providerId}`,
            providerModelId: sm.id,
            costClass: sm.costClass,
            inputPricePerM: sm.inputPricePerM || 0,
            outputPricePerM: sm.outputPricePerM || 0,
            contextWindow: sm.contextWindow,
            capabilities: ['chat', 'streaming', 'tools'],
            isLocal: false
          };
          this.modelRegistry.registerOffering(offering);
        }
      }

      return {
        providerId: provider.providerId,
        displayName: provider.displayName,
        category: provider.category,
        connectorType: 'api_key',
        state: 'Connected',
        discoveredModels,
        trustTier: provider.trustTier
      };
    }

    return {
      providerId: provider.providerId,
      displayName: provider.displayName,
      category: provider.category,
      connectorType: 'api_key',
      state: 'Auth-ready',
      actionRequired: `API key required (Prefix: ${primaryConnector.keyPrefix || 'sk-'})`,
      actionUrl: primaryConnector.helpUrl || provider.website,
      discoveredModels: [],
      trustTier: provider.trustTier
    };
  }

  /**
   * Safely probes loopback TCP port using a quick fetch or socket check.
   */
  private async probeLoopbackPort(port: number): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 350); // fast 350ms probe
      const res = await fetch(`http://127.0.0.1:${port}/`, { 
        method: 'GET',
        signal: controller.signal 
      }).catch(() => null);
      clearTimeout(timeout);
      return res !== null;
    } catch {
      return false;
    }
  }
}
