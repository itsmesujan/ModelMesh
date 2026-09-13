import { OMNIROUTE_CATALOG } from './omniroute-catalog.ts';

export type ProviderCategory = 'cloud' | 'local' | 'keyless' | 'aggregator' | 'custom';

export type TrustTier = 
  | 'verified_official' 
  | 'community_adapter' 
  | 'generic_compatible' 
  | 'local_trusted' 
  | 'unverified';

export type ConnectorType = 
  | 'keyless' 
  | 'api_key' 
  | 'oauth' 
  | 'device_flow' 
  | 'openai_compatible'
  | 'human_action';

export interface ConnectorSpec {
  type: ConnectorType;
  baseUrl?: string;
  defaultPort?: number;
  authUrl?: string;
  tokenUrl?: string;
  deviceCodeUrl?: string;
  helpUrl?: string;
  keyPrefix?: string;
  headers?: Record<string, string>;
  instructions?: string;
}

export interface ProviderManifest {
  providerId: string;
  displayName: string;
  category: ProviderCategory;
  trustTier: TrustTier;
  description: string;
  website: string;
  connectors: ConnectorSpec[];
  modelDiscovery: {
    strategy: 'openai_models' | 'static_catalog' | 'custom';
    path?: string;
  };
  healthStrategy: {
    strategy: 'models_endpoint' | 'ping' | 'completion_probe';
    path?: string;
  };
  capabilities: string[];
  policy: {
    automation: 'allowed' | 'user_action' | 'unsupported';
    requiresHumanAction?: boolean;
    supportsStreaming: boolean;
    supportsTools: boolean;
    supportsVision: boolean;
  };
  staticModels?: Array<{
    id: string;
    name: string;
    canonicalId: string;
    contextWindow: number;
    modalities: string[];
    costClass: 'free' | 'low' | 'medium' | 'high';
    inputPricePerM?: number;
    outputPricePerM?: number;
  }>;
}

export const CURATED_SEED_PROVIDERS: ProviderManifest[] = [
  {
    providerId: 'ollama',
    displayName: 'Ollama (Local)',
    category: 'local',
    trustTier: 'local_trusted',
    description: 'Local LLM runner running locally on loopback port 11434',
    website: 'https://ollama.com',
    connectors: [
      {
        type: 'openai_compatible',
        baseUrl: 'http://127.0.0.1:11434/v1',
        defaultPort: 11434
      }
    ],
    modelDiscovery: { strategy: 'openai_models', path: '/models' },
    healthStrategy: { strategy: 'models_endpoint', path: '/models' },
    capabilities: ['chat', 'streaming', 'tools', 'embeddings'],
    policy: { automation: 'allowed', supportsStreaming: true, supportsTools: true, supportsVision: true }
  },
  {
    providerId: 'lmstudio',
    displayName: 'LM Studio (Local)',
    category: 'local',
    trustTier: 'local_trusted',
    description: 'Local server running OpenAI-compatible endpoint on loopback port 1234',
    website: 'https://lmstudio.ai',
    connectors: [
      {
        type: 'openai_compatible',
        baseUrl: 'http://127.0.0.1:1234/v1',
        defaultPort: 1234
      }
    ],
    modelDiscovery: { strategy: 'openai_models', path: '/models' },
    healthStrategy: { strategy: 'models_endpoint', path: '/models' },
    capabilities: ['chat', 'streaming', 'tools', 'vision'],
    policy: { automation: 'allowed', supportsStreaming: true, supportsTools: true, supportsVision: true }
  },
  {
    providerId: 'vllm',
    displayName: 'vLLM (Local)',
    category: 'local',
    trustTier: 'local_trusted',
    description: 'High-throughput LLM serving engine on loopback port 8000',
    website: 'https://vllm.ai',
    connectors: [
      {
        type: 'openai_compatible',
        baseUrl: 'http://127.0.0.1:8000/v1',
        defaultPort: 8000
      }
    ],
    modelDiscovery: { strategy: 'openai_models', path: '/models' },
    healthStrategy: { strategy: 'models_endpoint', path: '/models' },
    capabilities: ['chat', 'streaming', 'tools'],
    policy: { automation: 'allowed', supportsStreaming: true, supportsTools: true, supportsVision: false }
  },
  {
    providerId: 'llamacpp',
    displayName: 'llama.cpp (Local)',
    category: 'local',
    trustTier: 'local_trusted',
    description: 'llama.cpp server running on loopback port 8080',
    website: 'https://github.com/ggml-org/llama.cpp',
    connectors: [
      {
        type: 'openai_compatible',
        baseUrl: 'http://127.0.0.1:8080/v1',
        defaultPort: 8080
      }
    ],
    modelDiscovery: { strategy: 'openai_models', path: '/models' },
    healthStrategy: { strategy: 'models_endpoint', path: '/models' },
    capabilities: ['chat', 'streaming', 'embeddings'],
    policy: { automation: 'allowed', supportsStreaming: true, supportsTools: false, supportsVision: false }
  },
  {
    providerId: 'pollinations',
    displayName: 'Pollinations AI',
    category: 'keyless',
    trustTier: 'verified_official',
    description: 'Keyless, free public OpenAI-compatible text and image generation API',
    website: 'https://pollinations.ai',
    connectors: [
      {
        type: 'keyless',
        baseUrl: 'https://text.pollinations.ai/openai'
      }
    ],
    modelDiscovery: { strategy: 'static_catalog' },
    healthStrategy: { strategy: 'ping', path: '/models' },
    capabilities: ['chat', 'streaming', 'vision'],
    policy: { automation: 'allowed', supportsStreaming: true, supportsTools: false, supportsVision: true },
    staticModels: [
      {
        id: 'openai',
        name: 'Pollinations OpenAI (Default)',
        canonicalId: 'gpt-4o-mini',
        contextWindow: 16384,
        modalities: ['text'],
        costClass: 'free',
        inputPricePerM: 0,
        outputPricePerM: 0
      },
      {
        id: 'mistral',
        name: 'Pollinations Mistral',
        canonicalId: 'mistral-large',
        contextWindow: 32768,
        modalities: ['text'],
        costClass: 'free',
        inputPricePerM: 0,
        outputPricePerM: 0
      }
    ]
  },
  {
    providerId: 'duckduckgo',
    displayName: 'DuckDuckGo AI Chat',
    category: 'keyless',
    trustTier: 'verified_official',
    description: 'Privacy-first keyless access to popular LLMs with no account required',
    website: 'https://duckduckgo.com/aichat',
    connectors: [
      {
        type: 'keyless',
        baseUrl: 'https://duckduckgo.com/duckchat/v1'
      }
    ],
    modelDiscovery: { strategy: 'static_catalog' },
    healthStrategy: { strategy: 'ping', path: '/status' },
    capabilities: ['chat', 'streaming'],
    policy: { automation: 'allowed', supportsStreaming: true, supportsTools: false, supportsVision: false },
    staticModels: [
      {
        id: 'gpt-4o-mini',
        name: 'DuckDuckGo GPT-4o Mini',
        canonicalId: 'gpt-4o-mini',
        contextWindow: 128000,
        modalities: ['text'],
        costClass: 'free',
        inputPricePerM: 0,
        outputPricePerM: 0
      },
      {
        id: 'claude-3-haiku',
        name: 'DuckDuckGo Claude 3 Haiku',
        canonicalId: 'claude-3-haiku',
        contextWindow: 200000,
        modalities: ['text'],
        costClass: 'free',
        inputPricePerM: 0,
        outputPricePerM: 0
      }
    ]
  },
  {
    providerId: 'groq',
    displayName: 'Groq',
    category: 'cloud',
    trustTier: 'verified_official',
    description: 'Ultra-low latency LPU inference with generous recurring free tier',
    website: 'https://groq.com',
    connectors: [
      {
        type: 'api_key',
        baseUrl: 'https://api.groq.com/openai/v1',
        keyPrefix: 'gsk_',
        helpUrl: 'https://console.groq.com/keys'
      }
    ],
    modelDiscovery: { strategy: 'openai_models', path: '/models' },
    healthStrategy: { strategy: 'models_endpoint', path: '/models' },
    capabilities: ['chat', 'streaming', 'tools', 'structured_output'],
    policy: { automation: 'allowed', supportsStreaming: true, supportsTools: true, supportsVision: false },
    staticModels: [
      {
        id: 'llama-3.3-70b-versatile',
        name: 'Llama 3.3 70B Versatile',
        canonicalId: 'llama-3.3-70b',
        contextWindow: 128000,
        modalities: ['text'],
        costClass: 'free',
        inputPricePerM: 0.59,
        outputPricePerM: 0.79
      },
      {
        id: 'llama-3.1-8b-instant',
        name: 'Llama 3.1 8B Instant',
        canonicalId: 'llama-3.1-8b',
        contextWindow: 128000,
        modalities: ['text'],
        costClass: 'free',
        inputPricePerM: 0.05,
        outputPricePerM: 0.08
      }
    ]
  },
  {
    providerId: 'google-ai-studio',
    displayName: 'Google AI Studio (Gemini)',
    category: 'cloud',
    trustTier: 'verified_official',
    description: 'Official Gemini developer API offering free tier rate limits (15 RPM)',
    website: 'https://aistudio.google.com',
    connectors: [
      {
        type: 'api_key',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
        keyPrefix: 'AIzaSy',
        helpUrl: 'https://aistudio.google.com/app/apikey'
      }
    ],
    modelDiscovery: { strategy: 'openai_models', path: '/models' },
    healthStrategy: { strategy: 'models_endpoint', path: '/models' },
    capabilities: ['chat', 'streaming', 'tools', 'structured_output', 'vision'],
    policy: { automation: 'allowed', supportsStreaming: true, supportsTools: true, supportsVision: true },
    staticModels: [
      {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        canonicalId: 'gemini-2.0-flash',
        contextWindow: 1048576,
        modalities: ['text', 'vision'],
        costClass: 'free',
        inputPricePerM: 0.10,
        outputPricePerM: 0.40
      }
    ]
  },
  {
    providerId: 'openrouter',
    displayName: 'OpenRouter',
    category: 'aggregator',
    trustTier: 'verified_official',
    description: 'Unified AI gateway aggregating 200+ models with free and paid tiers',
    website: 'https://openrouter.ai',
    connectors: [
      {
        type: 'api_key',
        baseUrl: 'https://openrouter.ai/api/v1',
        keyPrefix: 'sk-or-',
        helpUrl: 'https://openrouter.ai/keys'
      }
    ],
    modelDiscovery: { strategy: 'openai_models', path: '/models' },
    healthStrategy: { strategy: 'models_endpoint', path: '/models' },
    capabilities: ['chat', 'streaming', 'tools', 'vision'],
    policy: { automation: 'allowed', supportsStreaming: true, supportsTools: true, supportsVision: true }
  },
  {
    providerId: 'cerebras',
    displayName: 'Cerebras Inference',
    category: 'cloud',
    trustTier: 'verified_official',
    description: 'Ultra-fast wafer-scale Llama 3.3 70B inference engine',
    website: 'https://cerebras.ai',
    connectors: [
      {
        type: 'api_key',
        baseUrl: 'https://api.cerebras.ai/v1',
        keyPrefix: 'csk-',
        helpUrl: 'https://cloud.cerebras.ai'
      }
    ],
    modelDiscovery: { strategy: 'openai_models', path: '/models' },
    healthStrategy: { strategy: 'models_endpoint', path: '/models' },
    capabilities: ['chat', 'streaming', 'tools'],
    policy: { automation: 'allowed', supportsStreaming: true, supportsTools: true, supportsVision: false }
  },
  {
    providerId: 'anthropic',
    displayName: 'Anthropic Claude',
    category: 'cloud',
    trustTier: 'verified_official',
    description: 'Frontier AI models: Claude 3.7 Sonnet, Claude 3.5 Haiku',
    website: 'https://anthropic.com',
    connectors: [
      {
        type: 'api_key',
        baseUrl: 'https://api.anthropic.com/v1',
        keyPrefix: 'sk-ant-',
        helpUrl: 'https://console.anthropic.com/settings/keys'
      }
    ],
    modelDiscovery: { strategy: 'static_catalog' },
    healthStrategy: { strategy: 'ping', path: '/health' },
    capabilities: ['chat', 'streaming', 'tools', 'vision', 'reasoning'],
    policy: { automation: 'allowed', supportsStreaming: true, supportsTools: true, supportsVision: true },
    staticModels: [
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        canonicalId: 'claude-3.5-sonnet',
        contextWindow: 200000,
        modalities: ['text', 'vision'],
        costClass: 'high',
        inputPricePerM: 3.0,
        outputPricePerM: 15.0
      },
      {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude 3.5 Haiku',
        canonicalId: 'claude-3.5-haiku',
        contextWindow: 200000,
        modalities: ['text'],
        costClass: 'low',
        inputPricePerM: 0.80,
        outputPricePerM: 4.0
      }
    ]
  },
  {
    providerId: 'github-models',
    displayName: 'GitHub Models',
    category: 'cloud',
    trustTier: 'verified_official',
    description: 'Free prototyping playground via GitHub OAuth/Personal Access Token',
    website: 'https://github.com/marketplace/models',
    connectors: [
      {
        type: 'device_flow',
        authUrl: 'https://github.com/login/device/code',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        baseUrl: 'https://models.inference.ai.azure.com'
      },
      {
        type: 'api_key',
        baseUrl: 'https://models.inference.ai.azure.com',
        keyPrefix: 'ghp_',
        helpUrl: 'https://github.com/settings/tokens'
      }
    ],
    modelDiscovery: { strategy: 'openai_models', path: '/models' },
    healthStrategy: { strategy: 'models_endpoint', path: '/models' },
    capabilities: ['chat', 'streaming', 'tools', 'structured_output'],
    policy: { automation: 'allowed', supportsStreaming: true, supportsTools: true, supportsVision: true }
  },
  {
    providerId: 'enterprise-custom-human',
    displayName: 'Enterprise Corporate AI Portal',
    category: 'custom',
    trustTier: 'unverified',
    description: 'Requires internal SSO and human phone verification action',
    website: 'https://internal.example.com',
    connectors: [
      {
        type: 'human_action',
        baseUrl: 'https://internal.example.com/v1',
        instructions: 'Please complete corporate SSO verification and copy session token.'
      }
    ],
    modelDiscovery: { strategy: 'static_catalog' },
    healthStrategy: { strategy: 'ping' },
    capabilities: ['chat'],
    policy: { automation: 'user_action', requiresHumanAction: true, supportsStreaming: false, supportsTools: false, supportsVision: false }
  }
];

// Combined exhaustive provider list: Curated seeds (with explicit models and verified ports)
// merged with all 363+ OmniRoute ecosystem providers.
export const SEED_PROVIDERS: ProviderManifest[] = [
  ...CURATED_SEED_PROVIDERS,
  ...OMNIROUTE_CATALOG.filter(p => !CURATED_SEED_PROVIDERS.some(c => c.providerId === p.providerId))
];

export { OMNIROUTE_CATALOG };

export class ProviderRegistry {
  private providers: Map<string, ProviderManifest> = new Map();
  private aliasMap: Map<string, ProviderManifest> = new Map();

  constructor(initialProviders: ProviderManifest[] = SEED_PROVIDERS) {
    for (const provider of initialProviders) {
      this.register(provider);
    }
  }

  public register(manifest: ProviderManifest): void {
    this.providers.set(manifest.providerId, manifest);
    
    // Index standard aliases
    const lowerId = manifest.providerId.toLowerCase();
    if (lowerId.endsWith('-local')) {
      this.aliasMap.set(lowerId.replace(/-local$/, ''), manifest);
    }
    if (lowerId.endsWith('-web')) {
      this.aliasMap.set(lowerId.replace(/-web$/, ''), manifest);
    }
    if (lowerId.endsWith('-search')) {
      this.aliasMap.set(lowerId.replace(/-search$/, ''), manifest);
    }
    if (lowerId.endsWith('-cli')) {
      this.aliasMap.set(lowerId.replace(/-cli$/, ''), manifest);
    }
    if (lowerId.includes('-')) {
      this.aliasMap.set(lowerId.replace(/-/g, ''), manifest);
    }
  }

  public get(providerId: string): ProviderManifest | undefined {
    const direct = this.providers.get(providerId);
    if (direct) return direct;
    return this.aliasMap.get(providerId.toLowerCase());
  }

  public getAll(): ProviderManifest[] {
    return Array.from(this.providers.values());
  }

  public count(): number {
    return this.providers.size;
  }

  public getByCategory(category: ProviderCategory): ProviderManifest[] {
    return this.getAll().filter(p => p.category === category);
  }

  public getByTrustTier(tier: TrustTier): ProviderManifest[] {
    return this.getAll().filter(p => p.trustTier === tier);
  }

  public getLocalProviders(): ProviderManifest[] {
    return this.getByCategory('local');
  }

  public getKeylessProviders(): ProviderManifest[] {
    return this.getByCategory('keyless');
  }

  public getAggregators(): ProviderManifest[] {
    return this.getByCategory('aggregator');
  }

  public getOAuthProviders(): ProviderManifest[] {
    return this.getAll().filter(p => p.connectors.some(c => c.type === 'oauth' || c.type === 'device_flow'));
  }

  public getHumanActionProviders(): ProviderManifest[] {
    return this.getAll().filter(p => p.policy.requiresHumanAction || p.connectors.some(c => c.type === 'human_action'));
  }

  public search(query: string): ProviderManifest[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.getAll();
    return this.getAll().filter(p => 
      p.displayName.toLowerCase().includes(q) ||
      p.providerId.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }
}

