import React from 'react';
import { CheckIcon, AlertCircleIcon, RefreshIcon, AutoConnectIcon, ModelsIcon, ProvidersIcon } from '../components/Icons';

interface OverviewViewProps {
  overview: any;
  onNavigate: (tab: string) => void;
  onRefresh: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ overview, onNavigate, onRefresh }) => {
  const isHealthy = overview?.gatewayStatus === 'healthy';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Primary Health Canvas: Answers "Is ModelMesh working?" in < 5 seconds */}
      <div className="card" style={{ borderLeft: `4px solid ${isHealthy ? 'var(--status-success)' : 'var(--status-danger)'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: isHealthy ? 'var(--status-success-bg)' : 'var(--status-danger-bg)',
              color: isHealthy ? 'var(--status-success)' : 'var(--status-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isHealthy ? <CheckIcon size={20} /> : <AlertCircleIcon size={20} />}
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                {isHealthy ? 'Gateway Operational & Mesh Healthy' : 'Gateway Requires Attention'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Listening on <span className="code-badge">http://{overview?.host || '127.0.0.1'}:{overview?.port || 4000}</span> &bull; Active Policy Mode: <strong style={{ color: 'var(--accent)' }}>{overview?.activePolicyMode || 'Balanced'}</strong>
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm" onClick={onRefresh}>
              <RefreshIcon size={14} /> Refresh Health
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('autoconnect')}>
              <AutoConnectIcon size={14} /> AutoConnect Status
            </button>
          </div>
        </div>
      </div>

      {/* Metric Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="card" onClick={() => onNavigate('providers')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Connected Providers</span>
            <ProvidersIcon size={16} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>
            {overview?.connectedProviders || 0}
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}> / {overview?.totalProviders || 12}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {overview?.attentionRequiredCount || 0} need manual input
          </div>
        </div>

        <div className="card" onClick={() => onNavigate('models')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Available Model Offerings</span>
            <ModelsIcon size={16} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>
            {overview?.healthyModels || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--status-success)', marginTop: '4px' }}>
            Normalized cross-provider mesh
          </div>
        </div>

        <div className="card" onClick={() => onNavigate('usage')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>p95 Latency</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>EMA</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>
            {overview?.p95LatencyMs || 0} <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>ms</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {overview?.requestCount || 0} total requests routed
          </div>
        </div>

        <div className="card" onClick={() => onNavigate('routing')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Routing Mode</span>
            <span className="status-pill success"><span className="dot" /> Active</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent)' }}>
            {overview?.activePolicyName || 'Balanced'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Multi-signal 9-factor scoring
          </div>
        </div>
      </div>

      {/* Quick Integration & Instructions */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div className="card">
          <div className="card-title">
            <span>Drop-In OpenAI SDK Integration</span>
            <span className="code-badge">v1/chat/completions</span>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Point any OpenAI-compatible tool, agent, or IDE to ModelMesh with <code className="code-badge">baseURL</code> and <code className="code-badge">model="auto"</code>:
          </p>
          <pre style={{
            backgroundColor: 'var(--surface-hover)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            fontSize: '0.775rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-primary)',
            overflowX: 'auto'
          }}>
{`import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'http://127.0.0.1:4000/v1',
  apiKey: 'modelmesh-local' // Opaque token
});

const response = await client.chat.completions.create({
  model: 'auto', // Or 'llama-3.3-70b', 'gpt-4o-mini', 'gemini-2.0-flash'
  messages: [{ role: 'user', content: 'Explain quantum computing simply' }]
});

console.log(response.choices[0].message.content);`}
          </pre>
        </div>

        <div className="card">
          <div className="card-title">AutoConnect Queue</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 600 }}>Keyless Providers</div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Pollinations & DuckDuckGo</div>
              </div>
              <span className="status-pill success"><span className="dot" /> Connected</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 600 }}>Local Backends</div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Ollama, LM Studio, vLLM</div>
              </div>
              <span className="status-pill neutral"><span className="dot" /> Auto-scan</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 600 }}>API Key Providers</div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Groq, Gemini, Anthropic</div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('autoconnect')}>
                Manage Keys
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
