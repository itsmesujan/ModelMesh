export type Modality = 'text' | 'vision' | 'audio' | 'embedding';

export type Capability = 'chat' | 'tools' | 'structured_output' | 'streaming' | 'reasoning' | 'vision' | 'embeddings';

export type CostClass = 'free' | 'low' | 'medium' | 'high';

export interface CanonicalModel {
  id: string; // e.g. "llama-3.3-70b"
  name: string; // e.g. "Llama 3.3 70B Instruct"
  description: string;
  family: string; // e.g. "llama"
  benchmarkScore: number; // Arena Elo or quality score 0-100 (e.g. 88)
  contextWindow: number;
  modalities: Modality[];
  capabilities: Capability[];
}

export interface ModelOffering {
  id: string; // Unique offering ID (e.g. "groq:llama-3.3-70b-versatile")
  canonicalId: string;
  providerId: string;
  connectionId: string;
  providerModelId: string; // Upstream identifier
  costClass: CostClass;
  inputPricePerM: number;
  outputPricePerM: number;
  contextWindow: number;
  capabilities: Capability[];
  isLocal: boolean;
}

export const CANONICAL_MODELS: CanonicalModel[] = [
  {
    id: 'llama-3.3-70b',
    name: 'Llama 3.3 70B Instruct',
    description: 'Meta state-of-the-art open weight 70B model with GPT-4-class reasoning',
    family: 'llama',
    benchmarkScore: 89,
    contextWindow: 128000,
    modalities: ['text'],
    capabilities: ['chat', 'tools', 'structured_output', 'streaming']
  },
  {
    id: 'llama-3.1-8b',
    name: 'Llama 3.1 8B Instant',
    description: 'Ultra-fast lightweight 8B model suited for low latency agents',
    family: 'llama',
    benchmarkScore: 78,
    contextWindow: 128000,
    modalities: ['text'],
    capabilities: ['chat', 'tools', 'streaming']
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Fast, cost-efficient multimodal intelligence model',
    family: 'gpt',
    benchmarkScore: 88,
    contextWindow: 128000,
    modalities: ['text', 'vision'],
    capabilities: ['chat', 'tools', 'structured_output', 'streaming', 'vision']
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    description: 'Next-gen multimodal workhorse with 1M context and native tools',
    family: 'gemini',
    benchmarkScore: 91,
    contextWindow: 1048576,
    modalities: ['text', 'vision'],
    capabilities: ['chat', 'tools', 'structured_output', 'streaming', 'vision']
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Industry benchmark for coding, reasoning, and visual analysis',
    family: 'claude',
    benchmarkScore: 95,
    contextWindow: 200000,
    modalities: ['text', 'vision'],
    capabilities: ['chat', 'tools', 'structured_output', 'streaming', 'vision', 'reasoning']
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1 Reasoning',
    description: 'Open reasoning model with extensive chain-of-thought capabilities',
    family: 'deepseek',
    benchmarkScore: 93,
    contextWindow: 64000,
    modalities: ['text'],
    capabilities: ['chat', 'reasoning', 'streaming']
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large 2',
    description: 'Top-tier multilingual open reasoning model',
    family: 'mistral',
    benchmarkScore: 87,
    contextWindow: 128000,
    modalities: ['text'],
    capabilities: ['chat', 'tools', 'structured_output', 'streaming']
  }
];

export class ModelRegistry {
  private canonicalModels: Map<string, CanonicalModel> = new Map();
  private offerings: Map<string, ModelOffering> = new Map();

  constructor(initialCanonicals: CanonicalModel[] = CANONICAL_MODELS) {
    for (const model of initialCanonicals) {
      this.canonicalModels.set(model.id, model);
    }
  }

  public registerCanonical(model: CanonicalModel): void {
    this.canonicalModels.set(model.id, model);
  }

  public registerOffering(offering: ModelOffering): void {
    this.offerings.set(offering.id, offering);
  }

  public removeOfferingsForConnection(connectionId: string): void {
    for (const [id, offering] of this.offerings.entries()) {
      if (offering.connectionId === connectionId) {
        this.offerings.delete(id);
      }
    }
  }

  public getCanonical(canonicalId: string): CanonicalModel | undefined {
    return this.canonicalModels.get(canonicalId);
  }

  public getAllCanonicals(): CanonicalModel[] {
    return Array.from(this.canonicalModels.values());
  }

  public getAllOfferings(): ModelOffering[] {
    return Array.from(this.offerings.values());
  }

  /**
   * Resolves a requested model name (which might be "auto", a canonical ID like "llama-3.3-70b",
   * or a specific upstream providerModelId like "llama-3.3-70b-versatile") into eligible offerings.
   */
  public resolveOfferings(requestedModel: string): ModelOffering[] {
    const all = this.getAllOfferings();
    if (!requestedModel || requestedModel.toLowerCase() === 'auto') {
      return all;
    }

    const norm = requestedModel.toLowerCase().trim();

    // 1. Direct canonical match
    const byCanonical = all.filter(o => o.canonicalId.toLowerCase() === norm);
    if (byCanonical.length > 0) return byCanonical;

    // 2. Direct providerModelId match
    const byProviderModel = all.filter(o => o.providerModelId.toLowerCase() === norm);
    if (byProviderModel.length > 0) return byProviderModel;

    // 3. Partial or family match (e.g. "llama-3.3" or "gpt-4o")
    const byFuzzy = all.filter(o => 
      o.canonicalId.toLowerCase().includes(norm) || 
      o.providerModelId.toLowerCase().includes(norm)
    );
    if (byFuzzy.length > 0) return byFuzzy;

    // Fallback: return all offerings if no match, router will evaluate
    return all;
  }
}
