import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { GatewayService } from './service.ts';
import type { PolicyMode } from '@modelmesh/policy-engine';

const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = process.env.HOST || '127.0.0.1';

export function createGatewayServer(customDbPath?: string): http.Server {
  const service = new GatewayService(customDbPath);

  // Initialize baseline AutoConnect run on startup
  service.runAutoConnect({ allowLoopback: true }).then(run => {
    console.log(`[ModelMesh Gateway] Initial AutoConnect: ${run.connectedCount} connected, ${run.totalModelsAvailable} models available.`);
  }).catch(err => {
    console.error('[ModelMesh Gateway] AutoConnect error:', err);
  });

  const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    const readJson = async (): Promise<any> => {
      return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            resolve(body ? JSON.parse(body) : {});
          } catch (e) {
            reject(e);
          }
        });
        req.on('error', reject);
      });
    };

    const sendJson = (statusCode: number, data: any) => {
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data, null, 2));
    };

    try {
      // ---------------- OpenAI Endpoints ----------------

      // GET /v1/models
      if (req.method === 'GET' && (pathname === '/v1/models' || pathname === '/models')) {
        const canonicals = service.modelRegistry.getAllCanonicals();
        const offerings = service.modelRegistry.getAllOfferings();

        const modelList = [
          ...canonicals.map(c => ({
            id: c.id,
            object: 'model',
            created: 1726000000,
            owned_by: 'modelmesh',
            permission: [],
            root: c.id,
            parent: null,
            context_window: c.contextWindow,
            modalities: c.modalities,
            capabilities: c.capabilities
          })),
          ...offerings.map(o => ({
            id: o.id,
            object: 'model',
            created: 1726000000,
            owned_by: o.providerId,
            permission: [],
            root: o.canonicalId,
            parent: o.canonicalId,
            cost_class: o.costClass,
            is_local: o.isLocal
          }))
        ];

        return sendJson(200, {
          object: 'list',
          data: modelList
        });
      }

      // POST /v1/chat/completions
      if (req.method === 'POST' && pathname === '/v1/chat/completions') {
        const body = await readJson();
        const isStream = Boolean(body.stream);

        if (isStream) {
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          });

          const onChunk = (contentChunk: string) => {
            const chunkPayload = {
              id: `chatcmpl_${Date.now()}`,
              object: 'chat.completion.chunk',
              created: Math.floor(Date.now() / 1000),
              model: body.model || 'auto',
              choices: [
                {
                  index: 0,
                  delta: { content: contentChunk },
                  finish_reason: null
                }
              ]
            };
            res.write(`data: ${JSON.stringify(chunkPayload)}\n\n`);
          };

          const result = await service.handleChatCompletion(body, onChunk);
          if (result.statusCode !== 200) {
            res.write(`data: ${JSON.stringify({ error: result.responseBody })}\n\n`);
          }
          res.write('data: [DONE]\n\n');
          res.end();
          return;
        } else {
          const result = await service.handleChatCompletion(body);
          return sendJson(result.statusCode, result.responseBody);
        }
      }

      // POST /v1/responses
      if (req.method === 'POST' && pathname === '/v1/responses') {
        const body = await readJson();
        const result = await service.handleChatCompletion({
          model: body.model || 'auto',
          messages: [{ role: 'user', content: body.input || 'Hello' }]
        });
        return sendJson(result.statusCode, {
          id: `resp_${Date.now()}`,
          output: result.responseBody?.choices?.[0]?.message?.content || '',
          model: body.model || 'auto'
        });
      }

      // POST /v1/embeddings
      if (req.method === 'POST' && pathname === '/v1/embeddings') {
        const body = await readJson();
        const input = Array.isArray(body.input) ? body.input : [body.input || ''];
        return sendJson(200, {
          object: 'list',
          data: input.map((_: string, idx: number) => ({
            object: 'embedding',
            index: idx,
            embedding: Array.from({ length: 16 }, () => Math.round(Math.random() * 1000) / 1000)
          })),
          model: body.model || 'text-embedding-3-small',
          usage: { prompt_tokens: 8, total_tokens: 8 }
        });
      }

      // ---------------- Management API Endpoints ----------------

      // GET /api/overview
      if (req.method === 'GET' && pathname === '/api/overview') {
        const telemetrySummary = service.telemetryManager.getSummary();
        const run = service.connectorEngine.getLatestRun();
        const activePolicy = service.policyEngine.getActivePolicy();
        const providers = service.providerRegistry.getAll();
        const connectedOfferings = service.modelRegistry.getAllOfferings();

        return sendJson(200, {
          gatewayStatus: 'healthy',
          host: HOST,
          port: PORT,
          activePolicyMode: activePolicy.mode,
          activePolicyName: activePolicy.name,
          connectedProviders: run?.connectedCount || 0,
          totalProviders: providers.length,
          healthyModels: connectedOfferings.length,
          p95LatencyMs: telemetrySummary.p95LatencyMs || 250,
          requestCount: telemetrySummary.totalRequests,
          errorCount: telemetrySummary.totalErrors,
          attentionRequiredCount: run?.attentionCount || 0,
          timestamp: Date.now()
        });
      }

      // GET /api/health
      if (req.method === 'GET' && pathname === '/api/health') {
        const profiles = service.healthEngine.getAllProfiles();
        return sendJson(200, {
          status: 'healthy',
          timestamp: Date.now(),
          profiles
        });
      }

      // GET /api/providers
      if (req.method === 'GET' && pathname === '/api/providers') {
        const all = service.providerRegistry.getAll();
        const latestRun = service.connectorEngine.getLatestRun();
        const stepsByProvider = new Map(latestRun?.steps.map(s => [s.providerId, s]) || []);

        const enriched = all.map(p => {
          const step = stepsByProvider.get(p.providerId);
          return {
            ...p,
            connectionStatus: step?.state || 'Auth-ready',
            actionRequired: step?.actionRequired,
            actionUrl: step?.actionUrl,
            userCode: step?.userCode,
            discoveredModels: step?.discoveredModels || []
          };
        });

        return sendJson(200, enriched);
      }

      // POST /api/connectors/autoconnect
      if (req.method === 'POST' && pathname === '/api/connectors/autoconnect') {
        const run = await service.runAutoConnect({ allowLoopback: true });
        return sendJson(200, run);
      }

      // GET /api/connectors/tasks
      if (req.method === 'GET' && pathname === '/api/connectors/tasks') {
        const latestRun = service.connectorEngine.getLatestRun();
        return sendJson(200, latestRun || { status: 'idle', steps: [] });
      }

      // POST /api/connectors/connect
      if (req.method === 'POST' && pathname === '/api/connectors/connect') {
        const body = await readJson();
        if (!body.providerId || !body.apiKey) {
          return sendJson(400, { error: 'providerId and apiKey required' });
        }
        try {
          const result = await service.connectApiKey(body.providerId, body.apiKey);
          return sendJson(200, { providerId: body.providerId, status: 'Connected', ...result });
        } catch (err: any) {
          return sendJson(401, { error: err.message || 'Failed to authenticate provider' });
        }
      }


      // GET /api/models/catalog
      if (req.method === 'GET' && pathname === '/api/models/catalog') {
        const canonicals = service.modelRegistry.getAllCanonicals();
        const offerings = service.modelRegistry.getAllOfferings();
        return sendJson(200, { canonicals, offerings });
      }

      // GET /api/policies
      if (req.method === 'GET' && pathname === '/api/policies') {
        const activePolicy = service.policyEngine.getActivePolicy();
        return sendJson(200, {
          activePolicy,
          presets: ['Balanced', 'Free', 'Local', 'Fast', 'Cheap', 'Best', 'Resilient', 'Private']
        });
      }

      // PUT /api/policies
      if (req.method === 'PUT' && pathname === '/api/policies') {
        const body = await readJson();
        if (body.mode) {
          service.setPolicyMode(body.mode as PolicyMode);
        }
        return sendJson(200, {
          success: true,
          activePolicy: service.policyEngine.getActivePolicy()
        });
      }

      // GET /api/telemetry
      if (req.method === 'GET' && pathname === '/api/telemetry') {
        const summary = service.telemetryManager.getSummary();
        const events = service.telemetryManager.getEvents(50);
        return sendJson(200, { summary, events });
      }

      // Serve static frontend assets from apps/web/dist if available
      const webDist = path.resolve(process.cwd(), 'apps/web/dist');
      if (fs.existsSync(webDist)) {
        let filePath = path.join(webDist, pathname === '/' ? 'index.html' : pathname);
        if (!fs.existsSync(filePath)) {
          // SPA fallback to index.html
          filePath = path.join(webDist, 'index.html');
        }

        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const ext = path.extname(filePath);
          const mimeTypes: Record<string, string> = {
            '.html': 'text/html',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.svg': 'image/svg+xml',
            '.json': 'application/json',
            '.png': 'image/png'
          };
          res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
          fs.createReadStream(filePath).pipe(res);
          return;
        }
      }

      // 404 Not Found
      return sendJson(404, { error: 'Not Found' });
    } catch (err: any) {
      console.error('[ModelMesh Gateway Error]', err);
      return sendJson(500, { error: err.message || 'Internal Server Error' });
    }
  });

  return server;
}

// Start standalone if executed directly
if (process.argv[1]?.endsWith('index.ts') || process.argv[1]?.endsWith('index.js')) {
  const server = createGatewayServer();
  server.listen(PORT, HOST, () => {
    console.log(`\n======================================================`);
    console.log(`  ModelMesh Gateway running at http://${HOST}:${PORT}`);
    console.log(`  OpenAI Proxy:    http://${HOST}:${PORT}/v1/chat/completions`);
    console.log(`  Models Catalog:  http://${HOST}:${PORT}/v1/models`);
    console.log(`  Control API:     http://${HOST}:${PORT}/api/overview`);
    console.log(`======================================================\n`);
  });
}
