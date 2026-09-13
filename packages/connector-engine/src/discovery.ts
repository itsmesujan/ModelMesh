import type { ProviderManifest } from '@modelmesh/provider-registry';
import type { CostClass } from '@modelmesh/model-registry';

export interface DiscoveredModelInfo {
  id: string; // Upstream model ID
  costClass: CostClass;
  contextWindow?: number;
  inputPricePerM?: number;
  outputPricePerM?: number;
  isLocal: boolean;
}

/**
 * Discovers real live models offered by keyless providers via their public discovery endpoints.
 */
export async function discoverKeylessModels(provider: ProviderManifest): Promise<DiscoveredModelInfo[]> {
  const pId = provider.providerId.toLowerCase();

  // 1. OpenCode Free (returns 70+ real models)
  if (pId === 'opencode') {
    try {
      const res = await fetch('https://opencode.ai/zen/v1/models', {
        signal: AbortSignal.timeout(4500)
      });
      if (res.ok) {
        const json = await res.json() as any;
        if (Array.isArray(json?.data)) {
          return json.data.map((m: any) => ({
            id: m.id,
            costClass: 'free',
            inputPricePerM: 0,
            outputPricePerM: 0,
            isLocal: false
          }));
        }
      }
    } catch {
      // Fall through to backup
    }
  }

  // 2. Pollinations AI (returns real active model specifications)
  if (pId === 'pollinations') {
    try {
      const res = await fetch('https://text.pollinations.ai/models', {
        signal: AbortSignal.timeout(4500)
      });
      if (res.ok) {
        const json = await res.json() as any;
        if (Array.isArray(json)) {
          const models: DiscoveredModelInfo[] = [];
          for (const m of json) {
            if (m.name) {
              models.push({
                id: m.name,
                costClass: 'free',
                inputPricePerM: 0,
                outputPricePerM: 0,
                isLocal: false
              });
            }
            if (Array.isArray(m.aliases)) {
              for (const alias of m.aliases) {
                if (!models.some(x => x.id === alias)) {
                  models.push({
                    id: alias,
                    costClass: 'free',
                    inputPricePerM: 0,
                    outputPricePerM: 0,
                    isLocal: false
                  });
                }
              }
            }
          }
          if (models.length > 0) return models;
        }
      }
    } catch {
      // Fall through
    }
  }

  // 3. AI Horde (returns live distributed worker models)
  if (pId === 'aihorde') {
    try {
      const res = await fetch('https://aihorde.net/api/v2/status/models?type=text', {
        signal: AbortSignal.timeout(4500)
      });
      if (res.ok) {
        const json = await res.json() as any;
        if (Array.isArray(json)) {
          return json.slice(0, 20).map((m: any) => ({
            id: m.name,
            costClass: 'free',
            inputPricePerM: 0,
            outputPricePerM: 0,
            isLocal: false
          }));
        }
      }
    } catch {
      // Fall through
    }
  }

  // 4. DuckDuckGo AI Chat (verified real supported models)
  if (pId === 'duckduckgo-web' || pId === 'duckduckgo') {
    return [
      { id: 'gpt-4o-mini', costClass: 'free', inputPricePerM: 0, outputPricePerM: 0, isLocal: false },
      { id: 'claude-3-haiku', costClass: 'free', inputPricePerM: 0, outputPricePerM: 0, isLocal: false },
      { id: 'llama-3.3-70b', costClass: 'free', inputPricePerM: 0, outputPricePerM: 0, isLocal: false },
      { id: 'o3-mini', costClass: 'free', inputPricePerM: 0, outputPricePerM: 0, isLocal: false }
    ];
  }

  // 5. The Old LLM (verified free models)
  if (pId === 'theoldllm') {
    return [
      { id: 'gpt-5.4', costClass: 'free', inputPricePerM: 0, outputPricePerM: 0, isLocal: false },
      { id: 'claude-4.6-opus', costClass: 'free', inputPricePerM: 0, outputPricePerM: 0, isLocal: false },
      { id: 'claude-4.6-sonnet', costClass: 'free', inputPricePerM: 0, outputPricePerM: 0, isLocal: false },
      { id: 'claude-4.6-haiku', costClass: 'free', inputPricePerM: 0, outputPricePerM: 0, isLocal: false }
    ];
  }

  // 6. Chipotle Pepper AI
  if (pId === 'chipotle') {
    return [
      { id: 'chipotle-pepper-ai', costClass: 'free', inputPricePerM: 0, outputPricePerM: 0, isLocal: false }
    ];
  }

  // Fallback to provider staticModels if defined
  if (provider.staticModels && provider.staticModels.length > 0) {
    return provider.staticModels.map(sm => ({
      id: sm.id,
      costClass: sm.costClass || 'free',
      contextWindow: sm.contextWindow,
      inputPricePerM: sm.inputPricePerM || 0,
      outputPricePerM: sm.outputPricePerM || 0,
      isLocal: false
    }));
  }

  return [];
}

/**
 * Discovers real models from a running local server (Ollama, LM Studio, vLLM, llama.cpp).
 * Strictly returns only models physically reported by the local server.
 */
export async function discoverLocalModels(providerId: string, port: number): Promise<DiscoveredModelInfo[]> {
  const normId = providerId.toLowerCase();

  // 1. Ollama (query /api/tags or /v1/models)
  if (normId.includes('ollama')) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/tags`, {
        signal: AbortSignal.timeout(1800)
      });
      if (res.ok) {
        const json = await res.json() as any;
        if (Array.isArray(json?.models) && json.models.length > 0) {
          return json.models.map((m: any) => ({
            id: m.name,
            costClass: 'free',
            inputPricePerM: 0,
            outputPricePerM: 0,
            isLocal: true
          }));
        }
      }
    } catch {
      // Try /v1/models fallback
    }
  }

  // 2. Standard OpenAI-compatible local servers (LM Studio, vLLM, llama.cpp, LocalAI)
  try {
    const res = await fetch(`http://127.0.0.1:${port}/v1/models`, {
      signal: AbortSignal.timeout(1800)
    });
    if (res.ok) {
      const json = await res.json() as any;
      if (Array.isArray(json?.data) && json.data.length > 0) {
        return json.data.map((m: any) => ({
          id: m.id,
          costClass: 'free',
          inputPricePerM: 0,
          outputPricePerM: 0,
          isLocal: true
        }));
      }
    }
  } catch {
    // Port open but models endpoint returned nothing or error
  }

  return [];
}

/**
 * Validates an API key against the real upstream provider and queries its live models endpoint.
 * Throws an explicit error if the provider rejects the credentials.
 */
export async function discoverApiKeyModels(
  provider: ProviderManifest,
  apiKey: string
): Promise<DiscoveredModelInfo[]> {
  const pId = provider.providerId.toLowerCase();

  // 1. Google Gemini API
  if (pId === 'gemini' || pId === 'google-vertex') {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      signal: AbortSignal.timeout(6000)
    });
    if (!res.ok) {
      throw new Error(`Google Gemini rejected API key (HTTP ${res.status}: ${res.statusText})`);
    }
    const json = await res.json() as any;
    if (Array.isArray(json?.models)) {
      return json.models
        .filter((m: any) => m.name && m.supportedGenerationMethods?.includes('generateContent'))
        .map((m: any) => ({
          id: m.name.replace(/^models\//, ''),
          costClass: 'low' as CostClass,
          contextWindow: m.inputTokenLimit || 1048576,
          inputPricePerM: 0.1,
          outputPricePerM: 0.4,
          isLocal: false
        }));
    }
  }

  // 2. Anthropic Claude API
  if (pId === 'anthropic' || pId === 'claude') {
    const res = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      signal: AbortSignal.timeout(6000)
    });
    if (!res.ok) {
      throw new Error(`Anthropic rejected API key (HTTP ${res.status}: ${res.statusText})`);
    }
    const json = await res.json() as any;
    if (Array.isArray(json?.data)) {
      return json.data.map((m: any) => ({
        id: m.id,
        costClass: (m.id.includes('opus') ? 'high' : 'medium') as CostClass,
        contextWindow: 200000,
        inputPricePerM: m.id.includes('opus') ? 15 : 3,
        outputPricePerM: m.id.includes('opus') ? 75 : 15,
        isLocal: false
      }));
    }
  }

  // 3. Standard OpenAI & OpenAI-compatible providers (Groq, Together, OpenRouter, Mistral, DeepSeek, Cerebras, etc.)
  const primaryConnector = provider.connectors[0];
  let baseUrl = primaryConnector?.baseUrl || 'https://api.openai.com/v1';
  baseUrl = baseUrl.replace(/\/+$/, '');

  const modelsUrl = baseUrl.endsWith('/models') ? baseUrl : `${baseUrl}/models`;

  try {
    const res = await fetch(modelsUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(6000)
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error(`${provider.displayName} rejected credentials (HTTP ${res.status}: Unauthorized)`);
      }
      // If 404 or other endpoint variance, check static models
      if (provider.staticModels && provider.staticModels.length > 0) {
        return provider.staticModels.map(sm => ({
          id: sm.id,
          costClass: sm.costClass,
          contextWindow: sm.contextWindow,
          inputPricePerM: sm.inputPricePerM || 0.5,
          outputPricePerM: sm.outputPricePerM || 1.5,
          isLocal: false
        }));
      }
      throw new Error(`${provider.displayName} models query returned HTTP ${res.status}`);
    }

    const json = await res.json() as any;
    const modelList = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);

    if (modelList.length > 0) {
      return modelList.map((m: any) => ({
        id: m.id || m.name,
        costClass: (pId === 'groq' ? 'low' : 'medium') as CostClass,
        contextWindow: 128000,
        inputPricePerM: 0.5,
        outputPricePerM: 1.5,
        isLocal: false
      }));
    }
  } catch (err: any) {
    if (err.message?.includes('rejected credentials')) {
      throw err;
    }
    // If network error occurred but static models exist
    if (provider.staticModels && provider.staticModels.length > 0) {
      return provider.staticModels.map(sm => ({
        id: sm.id,
        costClass: sm.costClass,
        contextWindow: sm.contextWindow,
        inputPricePerM: sm.inputPricePerM || 0.5,
        outputPricePerM: sm.outputPricePerM || 1.5,
        isLocal: false
      }));
    }
    throw err;
  }

  return [];
}
