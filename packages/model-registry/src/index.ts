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
  // --- Meta Llama Family ---
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
    id: 'llama-3.2-90b-vision',
    name: 'Llama 3.2 90B Vision Instruct',
    description: 'Multimodal open weight 90B model with high-resolution visual analysis',
    family: 'llama',
    benchmarkScore: 90,
    contextWindow: 128000,
    modalities: ['text', 'vision'],
    capabilities: ['chat', 'tools', 'streaming', 'vision']
  },
  {
    id: 'llama-3.2-11b-vision',
    name: 'Llama 3.2 11B Vision Instruct',
    description: 'Efficient multimodal model for edge and visual reasoning tasks',
    family: 'llama',
    benchmarkScore: 82,
    contextWindow: 128000,
    modalities: ['text', 'vision'],
    capabilities: ['chat', 'tools', 'streaming', 'vision']
  },
  {
    id: 'llama-3.2-3b',
    name: 'Llama 3.2 3B Compact',
    description: 'Lightweight on-device instruction model for summarization and rewrite',
    family: 'llama',
    benchmarkScore: 72,
    contextWindow: 128000,
    modalities: ['text'],
    capabilities: ['chat', 'streaming']
  },
  {
    id: 'llama-3.2-1b',
    name: 'Llama 3.2 1B Edge',
    description: 'Ultra-compact edge language model with sub-50ms token latency',
    family: 'llama',
    benchmarkScore: 65,
    contextWindow: 128000,
    modalities: ['text'],
    capabilities: ['chat', 'streaming']
  },
  {
    id: 'llama-3.1-405b',
    name: 'Llama 3.1 405B Frontier',
    description: 'Flagship 405B parameter open model competitive with frontier cloud labs',
    family: 'llama',
    benchmarkScore: 94,
    contextWindow: 128000,
    modalities: ['text'],
    capabilities: ['chat', 'tools', 'structured_output', 'streaming', 'reasoning']
  },
  {
    id: 'llama-3.1-70b',
    name: 'Llama 3.1 70B Instruct',
    description: 'High-capability 70B open weight instruction model',
    family: 'llama',
    benchmarkScore: 86,
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

  // --- OpenAI GPT Family ---
  {
    id: 'gpt-4o',
    name: 'GPT-4o Omnimodal Flagship',
    description: 'High-intelligence multimodal flagship for complex text, vision, and logic',
    family: 'gpt',
    benchmarkScore: 94,
    contextWindow: 128000,
    modalities: ['text', 'vision'],
    capabilities: ['chat', 'tools', 'structured_output', 'streaming', 'vision']
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
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo with Vision',
    description: 'Previous-generation frontier workhorse with 128K context window',
    family: 'gpt',
    benchmarkScore: 92,
    contextWindow: 128000,
    modalities: ['text', 'vision'],
    capabilities: ['chat', 'tools', 'structured_output', 'streaming', 'vision']
  },
  {
    id: 'gpt-4',
    name: 'GPT-4 Original',
    description: 'Original high-precision reasoning model',
    family: 'gpt',
    benchmarkScore: 86,
    contextWindow: 8192,
    modalities: ['text'],
    capabilities: ['chat', 'tools', 'streaming']
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Legacy fast and economical chat model',
    family: 'gpt',
    benchmarkScore: 76,
    contextWindow: 16385,
    modalities: ['text'],
    capabilities: ['chat', 'tools', 'streaming']
  },
  {
    id: 'o1',
    name: 'OpenAI o1 Advanced Reasoning',
    description: 'Frontier reasoning model trained with reinforcement learning for math and STEM',
    family: 'gpt',
    benchmarkScore: 98,
    contextWindow: 200000,
    modalities: ['text', 'vision'],
    capabilities: ['chat', 'reasoning', 'streaming', 'vision']
  },
  {
    id: 'o1-mini',
    name: 'OpenAI o1 Mini Fast Reasoning',
    description: 'Faster, cost-efficient reasoning model optimized for STEM and code',
    family: 'gpt',
    benchmarkScore: 91,
    contextWindow: 128000,
    modalities: ['text'],
    capabilities: ['chat', 'reasoning', 'streaming']
  },
  {
    id: 'o3-mini',
    name: 'OpenAI o3 Mini STEM Reasoning',
    description: 'Latest generation ultra-fast reasoning model with configurable effort',
    family: 'gpt',
    benchmarkScore: 96,
    contextWindow: 200000,
    modalities: ['text'],
    capabilities: ['chat', 'reasoning', 'streaming', 'tools']
  },

  // --- Anthropic Claude Family ---
  {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet Hybrid Reasoning',
    description: 'State-of-the-art hybrid architecture supporting instant and extended thinking',
    family: 'claude',
    benchmarkScore: 97,
    contextWindow: 200000,
    modalities: ['text', 'vision'],
    capabilities: ['chat', 'tools', 'structured_output', 'streaming', 'vision', 'reasoning']
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
    id: 'claude-3-5-haiku',
    name: 'Claude 3.5 Haiku Ultra Fast',
    description: 'Blazing fast intelligence matching prior flagship speeds at low cost',
    family: 'claude',
    benchmarkScore: 88,
    contextWindow: 200000,
    modalities: ['text'],
    capabilities: ['chat', 'tools', 'streaming']
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus Deep Analysis',
    description: 'Deep contextual analysis and nuanced prose generation',
    family: 'claude',
    benchmarkScore: 93,
    contextWindow: 200000,
    modalities: ['text', 'vision'],
    capabilities: ['chat', 'tools', 'vision', 'streaming']
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet Balanced',
    description: 'Balanced enterprise workhorse for scale and throughput',
    family: 'claude',
    benchmarkScore: 86,
    contextWindow: 200000,
    modalities: ['text', 'vision'],
    capabilities: ['chat', 'tools', 'vision', 'streaming']
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku Fast',
    description: 'Compact instant response model',
    family: 'claude',
    benchmarkScore: 80,
    contextWindow: 200000,
    modalities: ['text', 'vision'],
    capabilities: ['chat', 'tools', 'streaming']
  },

  // --- Google Gemini Family ---
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro Multimodal Frontier',
    description: 'Google frontier multimodal model with 2M context window and deep reasoning',
    family: 'gemini',
    benchmarkScore: 96,
    contextWindow: 2000000,
    modalities: ['text', 'vision', 'audio'],
    capabilities: ['chat', 'tools', 'structured_output', 'streaming', 'vision', 'reasoning']
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash Speed & Scale',
    description: 'Ultra-fast low-latency multimodal intelligence with 1M context',
    family: 'gemini',
    benchmarkScore: 92,
    contextWindow: 1048576,
    modalities: ['text', 'vision', 'audio'],
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
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash Lite',
    description: 'High-throughput low-cost model optimized for massive agent loops',
    family: 'gemini',
    benchmarkScore: 86,
    contextWindow: 1048576,
    modalities: ['text'],
    capabilities: ['chat', 'tools', 'streaming']
  },
  {
    id: 'gemini-2.0-flash-thinking',
    name: 'Gemini 2.0 Flash Thinking Experimental',
    description: 'Experimental chain-of-thought thinking model from Google DeepMind',
    family: 'gemini',
    benchmarkScore: 94,
    contextWindow: 1048576,
    modalities: ['text', 'vision'],
    capabilities: ['chat', 'reasoning', 'streaming', 'vision']
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro Deep Context',
    description: 'Pioneering 2M token context window model for massive codebase analysis',
    family: 'gemini',
    benchmarkScore: 92,
    contextWindow: 2000000,
    modalities: ['text', 'vision', 'audio'],
    capabilities: ['chat', 'tools', 'structured_output', 'streaming', 'vision']
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash Lightweight',
    description: 'High-frequency multimodal model for everyday chat and vision',
    family: 'gemini',
    benchmarkScore: 87,
    contextWindow: 1048576,
    modalities: ['text', 'vision'],
    capabilities: ['chat', 'tools', 'structured_output', 'streaming', 'vision']
  },

  // --- DeepSeek Family ---
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1 Reasoning',
    description: 'Open reasoning model with extensive chain-of-thought capabilities',
    family: 'deepseek',
    benchmarkScore: 95,
    contextWindow: 64000,
    modalities: ['text'],
    capabilities: ['chat', 'reasoning', 'streaming']
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3 671B MoE',
    description: 'State-of-the-art 671B parameter Mixture-of-Experts general intelligence',
    family: 'deepseek',
    benchmarkScore: 92,
    contextWindow: 64000,
    modalities: ['text'],
    capabilities: ['chat', 'tools', 'structured_output', 'streaming']
  },
  {
    id: 'deepseek-coder-v2',
    name: 'DeepSeek Coder V2 236B',
    description: 'Open code specialist benchmarked across 300+ programming languages',
    family: 'deepseek',
    benchmarkScore: 89,
    contextWindow: 128000,
    modalities: ['text'],
    capabilities: ['chat', 'tools', 'streaming']
  },

  // --- Mistral AI Family ---
  {
    id: 'mistral-large',
    name: 'Mistral Large 2',
    description: 'Top-tier multilingual open reasoning model with 128K context',
    family: 'mistral',
    benchmarkScore: 90,
    contextWindow: 128000,
    modalities: ['text'],
    capabilities: ['chat', 'tools', 'structured_output', 'streaming']
  },
  {
    id: 'mistral-small',
    name: 'Mistral Small 3',
    description: 'Fast, compact 24B parameter reasoning model with low latency',
    family: 'mistral',
    benchmarkScore: 84,
    contextWindow: 32000,
    modalities: ['text'],
    capabilities: ['chat', 'tools', 'streaming']
  },
  {
    id: 'mistral-nemo',
    name: 'Mistral NeMo 12B',
    description: 'Multilingual 12B model built in collaboration with NVIDIA',
    family: 'mistral',
    benchmarkScore: 81,
    contextWindow: 128000,
    modalities: ['text'],
    capabilities: ['chat', 'streaming']
  },
  {
    id: 'codestral',
    name: 'Codestral 22B',
    description: 'Dedicated code generation and fill-in-the-middle model',
    family: 'mistral',
    benchmarkScore: 88,
    contextWindow: 256000,
    modalities: ['text'],
    capabilities: ['chat', 'tools', 'streaming']
  },
  {
    id: 'pixtral-large',
    name: 'Pixtral Large 124B',
    description: 'Multimodal flagship with advanced visual understanding and OCR',
    family: 'mistral',
    benchmarkScore: 90,
    contextWindow: 128000,
    modalities: ['text', 'vision'],
    capabilities: ['chat', 'tools', 'vision', 'streaming']
  },
  {
    id: 'pixtral-12b',
    name: 'Pixtral 12B Vision',
    description: 'Compact 12B multimodal model for edge and document analysis',
    family: 'mistral',
    benchmarkScore: 83,
    contextWindow: 128000,
    modalities: ['text', 'vision'],
    capabilities: ['chat', 'tools', 'vision', 'streaming']
  },

  // --- Alibaba Qwen Family ---
  {
    id: 'qwen-2.5-72b',
    name: 'Qwen 2.5 72B Instruct Flagship',
    description: 'Alibaba leading open weights 72B model excelling at coding, math, and tools',
    family: 'qwen',
    benchmarkScore: 91,
    contextWindow: 128000,
    modalities: ['text'],
    capabilities: ['chat', 'tools', 'structured_output', 'streaming']
  },
  {
    id: 'qwen-2.5-32b',
    name: 'Qwen 2.5 32B Instruct',
    description: 'Optimal balance of parameter efficiency and reasoning accuracy',
    family: 'qwen',
    benchmarkScore: 86,
    contextWindow: 128000,
    modalities: ['text'],
    capabilities: ['chat', 'tools', 'streaming']
  },
  {
    id: 'qwen-2.5-14b',
    name: 'Qwen 2.5 14B Instruct',
    description: 'Medium-weight model suited for single-GPU inference',
    family: 'qwen',
    benchmarkScore: 82,
    contextWindow: 128000,
    modalities: ['text'],
    capabilities: ['chat', 'tools', 'streaming']
  },
  {
    id: 'qwen-2.5-7b',
    name: 'Qwen 2.5 7B Fast',
    description: 'Lightweight high-speed model for local and consumer hardware',
    family: 'qwen',
    benchmarkScore: 78,
    contextWindow: 128000,
    modalities: ['text'],
    capabilities: ['chat', 'tools', 'streaming']
  },
  {
    id: 'qwen-2.5-coder-32b',
    name: 'Qwen 2.5 Coder 32B',
    description: 'Specialized coding model ranking among top open-source coding benchmarks',
    family: 'qwen',
    benchmarkScore: 90,
    contextWindow: 128000,
    modalities: ['text'],
    capabilities: ['chat', 'tools', 'streaming']
  },
  {
    id: 'qwq-32b',
    name: 'QwQ 32B Preview Reasoning',
    description: 'Deep reasoning model competing with leading frontier chain-of-thought systems',
    family: 'qwen',
    benchmarkScore: 91,
    contextWindow: 32768,
    modalities: ['text'],
    capabilities: ['chat', 'reasoning', 'streaming']
  },

  // --- xAI Grok Family ---
  {
    id: 'grok-3',
    name: 'Grok 3 Reasoning Engine',
    description: 'xAI flagship model with deep mathematical and scientific reasoning',
    family: 'grok',
    benchmarkScore: 96,
    contextWindow: 131072,
    modalities: ['text'],
    capabilities: ['chat', 'tools', 'reasoning', 'streaming']
  },
  {
    id: 'grok-3-mini',
    name: 'Grok 3 Mini Fast Reasoning',
    description: 'Fast, cost-efficient reasoning engine from xAI',
    family: 'grok',
    benchmarkScore: 90,
    contextWindow: 131072,
    modalities: ['text'],
    capabilities: ['chat', 'reasoning', 'streaming']
  },
  {
    id: 'grok-2',
    name: 'Grok 2 Multimodal',
    description: 'xAI flagship multimodal model with live knowledge retrieval',
    family: 'grok',
    benchmarkScore: 91,
    contextWindow: 131072,
    modalities: ['text', 'vision'],
    capabilities: ['chat', 'tools', 'vision', 'streaming']
  },
  {
    id: 'grok-2-vision',
    name: 'Grok 2 Vision',
    description: 'High-fidelity visual understanding and document comprehension',
    family: 'grok',
    benchmarkScore: 91,
    contextWindow: 131072,
    modalities: ['text', 'vision'],
    capabilities: ['chat', 'vision', 'streaming']
  },

  // --- Cohere Family ---
  {
    id: 'command-r-plus',
    name: 'Cohere Command R+ Enterprise',
    description: 'Enterprise RAG specialist with citations and multilingual tool use',
    family: 'cohere',
    benchmarkScore: 88,
    contextWindow: 128000,
    modalities: ['text'],
    capabilities: ['chat', 'tools', 'structured_output', 'streaming']
  },
  {
    id: 'command-r',
    name: 'Cohere Command R',
    description: 'Optimized enterprise RAG model with strong multilingual accuracy',
    family: 'cohere',
    benchmarkScore: 82,
    contextWindow: 128000,
    modalities: ['text'],
    capabilities: ['chat', 'tools', 'streaming']
  },

  // --- Moonshot Kimi Family ---
  {
    id: 'kimi-k2',
    name: 'Kimi K2 Long Context',
    description: 'Moonshot AI 256K long-context model for document and book synthesis',
    family: 'kimi',
    benchmarkScore: 89,
    contextWindow: 256000,
    modalities: ['text'],
    capabilities: ['chat', 'streaming']
  },
  {
    id: 'moonshot-v1-128k',
    name: 'Moonshot V1 128K',
    description: 'High-fidelity Chinese and English long-context model',
    family: 'kimi',
    benchmarkScore: 84,
    contextWindow: 128000,
    modalities: ['text'],
    capabilities: ['chat', 'streaming']
  },

  // --- Zhipu GLM Family ---
  {
    id: 'glm-4-plus',
    name: 'GLM 4 Plus Multimodal Reasoning',
    description: 'Zhipu AI flagship model with multilingual and visual capabilities',
    family: 'glm',
    benchmarkScore: 90,
    contextWindow: 128000,
    modalities: ['text', 'vision'],
    capabilities: ['chat', 'tools', 'vision', 'streaming']
  },
  {
    id: 'glm-4-flash',
    name: 'GLM 4 Flash High Speed',
    description: 'Free public high-throughput model with rapid generation times',
    family: 'glm',
    benchmarkScore: 83,
    contextWindow: 128000,
    modalities: ['text'],
    capabilities: ['chat', 'streaming']
  },

  // --- Microsoft Phi Family ---
  {
    id: 'phi-4',
    name: 'Microsoft Phi-4 14B Reasoning',
    description: 'Small language model trained with high-quality synthetic data, excelling in math',
    family: 'phi',
    benchmarkScore: 84,
    contextWindow: 16384,
    modalities: ['text'],
    capabilities: ['chat', 'reasoning', 'streaming']
  },
  {
    id: 'phi-3.5-mini',
    name: 'Phi 3.5 Mini Lightweight',
    description: 'Ultra-compact 3.8B model with 128K context for edge devices',
    family: 'phi',
    benchmarkScore: 77,
    contextWindow: 128000,
    modalities: ['text'],
    capabilities: ['chat', 'streaming']
  },

  // --- Google Gemma Family ---
  {
    id: 'gemma-2-27b',
    name: 'Gemma 2 27B Open Weights',
    description: 'Google DeepMind open weights 27B model designed for high-end reasoning',
    family: 'gemma',
    benchmarkScore: 83,
    contextWindow: 8192,
    modalities: ['text'],
    capabilities: ['chat', 'streaming']
  },
  {
    id: 'gemma-2-9b',
    name: 'Gemma 2 9B High Performance',
    description: 'Compact 9B parameter model outperforming models twice its size',
    family: 'gemma',
    benchmarkScore: 78,
    contextWindow: 8192,
    modalities: ['text'],
    capabilities: ['chat', 'streaming']
  },

  // --- Audio & Multimodal Specialists ---
  {
    id: 'whisper-large-v3',
    name: 'Whisper Large V3 Speech Recognition',
    description: 'OpenAI state-of-the-art automatic speech recognition (ASR) and translation',
    family: 'audio',
    benchmarkScore: 92,
    contextWindow: 448,
    modalities: ['audio'],
    capabilities: ['streaming']
  },
  {
    id: 'eleven-multilingual-v2',
    name: 'ElevenLabs Multilingual V2 TTS',
    description: 'Industry-leading text-to-speech engine with 29 languages and voice cloning',
    family: 'audio',
    benchmarkScore: 94,
    contextWindow: 1000,
    modalities: ['audio'],
    capabilities: ['streaming']
  },
  {
    id: 'bge-large-en-v1.5',
    name: 'BGE Large English Embedding',
    description: 'Top-ranking open embedding model for semantic search and retrieval',
    family: 'embeddings',
    benchmarkScore: 88,
    contextWindow: 512,
    modalities: ['embedding'],
    capabilities: ['embeddings']
  },
  {
    id: 'text-embedding-3-small',
    name: 'OpenAI Text Embedding 3 Small',
    description: 'Highly efficient embedding model for vector databases',
    family: 'embeddings',
    benchmarkScore: 86,
    contextWindow: 8191,
    modalities: ['embedding'],
    capabilities: ['embeddings']
  },
  {
    id: 'text-embedding-3-large',
    name: 'OpenAI Text Embedding 3 Large',
    description: 'High-dimension embedding model for complex enterprise semantic retrieval',
    family: 'embeddings',
    benchmarkScore: 92,
    contextWindow: 8191,
    modalities: ['embedding'],
    capabilities: ['embeddings']
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
   * Finds an existing canonical model for a raw model identifier or dynamically synthesizes
   * and registers one so that real upstream models from connected providers are always first-class.
   */
  public ensureCanonicalForModel(rawModelId: string): CanonicalModel {
    if (!rawModelId) return CANONICAL_MODELS[0];
    const norm = rawModelId.toLowerCase().trim();

    // 1. Direct ID match
    const direct = this.canonicalModels.get(rawModelId) || this.canonicalModels.get(norm);
    if (direct) return direct;

    // 2. Existing canonical prefix/alias match
    for (const [id, canonical] of this.canonicalModels.entries()) {
      if (norm === id || norm.includes(id) || id.includes(norm)) {
        return canonical;
      }
    }

    // 3. Synthesize canonical model for new/custom live models
    const synthesized = inferCanonicalModel(rawModelId);
    this.canonicalModels.set(synthesized.id, synthesized);
    return synthesized;
  }

  public getOfferingsForCanonical(canonicalId: string): ModelOffering[] {
    return this.getAllOfferings().filter(o => o.canonicalId === canonicalId);
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

/**
 * Dynamically synthesizes a complete CanonicalModel specification for any live model ID
 * discovered from connected upstream providers.
 */
export function inferCanonicalModel(modelId: string): CanonicalModel {
  const norm = modelId.toLowerCase().trim();

  // Family inference
  let family = 'other';
  if (norm.includes('llama') || norm.includes('stheno')) family = 'llama';
  else if (norm.includes('claude') || norm.includes('opus') || norm.includes('sonnet') || norm.includes('haiku') || norm.includes('fable')) family = 'claude';
  else if (norm.includes('gemini')) family = 'gemini';
  else if (norm.includes('gpt') || norm.includes('o1') || norm.includes('o3') || norm.includes('codex') || norm.includes('chatgpt') || norm.includes('davinci')) family = 'gpt';
  else if (norm.includes('deepseek')) family = 'deepseek';
  else if (norm.includes('mistral') || norm.includes('mixtral') || norm.includes('codestral') || norm.includes('ministral')) family = 'mistral';
  else if (norm.includes('qwen')) family = 'qwen';
  else if (norm.includes('grok')) family = 'grok';
  else if (norm.includes('kimi')) family = 'kimi';
  else if (norm.includes('glm') || norm.includes('zcode')) family = 'glm';
  else if (norm.includes('minimax')) family = 'minimax';
  else if (norm.includes('phi')) family = 'phi';
  else if (norm.includes('gemma')) family = 'gemma';
  else if (norm.includes('command') || norm.includes('cohere')) family = 'cohere';
  else if (norm.includes('whisper') || norm.includes('audio') || norm.includes('tts')) family = 'audio';
  else if (norm.includes('embed') || norm.includes('bge')) family = 'embeddings';

  // Capabilities inference
  const isEmbed = family === 'embeddings';
  const isAudio = family === 'audio';
  const capabilities: Capability[] = isEmbed
    ? ['embeddings']
    : ['chat', 'streaming'];

  if (!isEmbed && !isAudio) capabilities.push('tools', 'structured_output');
  if (norm.includes('vision') || norm.includes('vl') || norm.includes('4o') || norm.includes('flash') || norm.includes('multimodal')) {
    capabilities.push('vision');
  }
  if (norm.includes('reasoning') || norm.includes('r1') || norm.includes('o1') || norm.includes('o3') || norm.includes('thought') || norm.includes('pro')) {
    capabilities.push('reasoning');
  }

  // Modalities
  const modalities: Modality[] = isEmbed
    ? ['embedding']
    : (capabilities.includes('vision') ? ['text', 'vision'] : ['text']);

  // Context window inference
  let contextWindow = 32768;
  if (family === 'gemini') contextWindow = 1048576;
  else if (family === 'claude') contextWindow = 200000;
  else if (family === 'llama' || family === 'gpt' || family === 'mistral' || family === 'qwen') contextWindow = 128000;
  else if (family === 'deepseek') contextWindow = 64000;
  else if (isEmbed) contextWindow = 8192;

  // Benchmark score inference
  let benchmarkScore = 84;
  if (norm.includes('r1') || norm.includes('opus') || norm.includes('o1') || norm.includes('o3') || norm.includes('5')) {
    benchmarkScore = 94;
  } else if (norm.includes('sonnet') || norm.includes('pro') || norm.includes('70b') || norm.includes('plus')) {
    benchmarkScore = 90;
  } else if (norm.includes('mini') || norm.includes('lite') || norm.includes('nano') || norm.includes('8b') || norm.includes('7b')) {
    benchmarkScore = 79;
  }

  // Human-readable title
  const cleanName = modelId
    .replace(/^models\//, '')
    .split(/[-_:]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    id: modelId,
    name: cleanName,
    description: `Live ${family.toUpperCase()} model dynamically resolved from connected upstream provider`,
    family,
    benchmarkScore,
    contextWindow,
    modalities,
    capabilities
  };
}

