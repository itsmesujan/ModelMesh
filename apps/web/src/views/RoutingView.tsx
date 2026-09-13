import React, { useState } from 'react';


interface RoutingViewProps {
  policies: any;
  onSelectMode: (mode: string) => Promise<void>;
}

export const RoutingView: React.FC<RoutingViewProps> = ({ policies, onSelectMode }) => {
  const activePolicy = policies?.activePolicy || { mode: 'Balanced', weights: {} };
  const presets = policies?.presets || ['Balanced', 'Free', 'Local', 'Fast', 'Cheap', 'Best', 'Resilient', 'Private'];

  const [simModel, setSimModel] = useState<string>('auto');
  const [simPrompt, setSimPrompt] = useState<string>('Explain quantum computing');
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<any>(null);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await fetch('/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: simModel,
          messages: [{ role: 'user', content: simPrompt }]
        })
      });
      const data = await res.json();
      setSimResult(data);
    } catch (err: any) {
      setSimResult({ error: err.message });
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Policy Mode Selector Cards */}
      <div>
        <div style={{ marginBottom: '12px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Routing Policy Engine</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Requests are gated by compliance policy, then scored using multi-signal 9-factor evaluation.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {presets.map((mode: string) => {
            const isActive = activePolicy.mode === mode;
            return (
              <div
                key={mode}
                onClick={() => onSelectMode(mode)}
                className="card"
                style={{
                  cursor: 'pointer',
                  padding: '14px 16px',
                  border: isActive ? '2px solid var(--accent)' : '1px solid var(--border)',
                  backgroundColor: isActive ? 'var(--accent-subtle)' : 'var(--surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem', color: isActive ? 'var(--accent)' : 'var(--text-primary)' }}>
                    {mode}
                  </span>
                  {isActive && <span className="status-pill success"><span className="dot" /> Active</span>}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {mode === 'Balanced' && 'Optimizes quality, latency, and success.'}
                  {mode === 'Free' && 'Strict free-only gate; zero cost spend.'}
                  {mode === 'Local' && 'Strict loopback/LAN gate; 100% private.'}
                  {mode === 'Fast' && 'Minimizes TTFT and p95 latency.'}
                  {mode === 'Cheap' && 'Minimizes cost per 1M tokens.'}
                  {mode === 'Best' && 'Maximizes quality benchmark score.'}
                  {mode === 'Resilient' && 'Deep fallback chain & fault tolerance.'}
                  {mode === 'Private' && 'Data residency & no-training policy.'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Mode Signal Weights */}
      <div className="card">
        <div className="card-title">Active 9-Factor Signal Weights ({activePolicy.mode})</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
          {Object.entries(activePolicy.weights || {}).map(([signal, weight]) => (
            <div key={signal} style={{ textAlign: 'center', padding: '10px', backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                {signal}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)', marginTop: '2px' }}>
                {Math.round((weight as number) * 100)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Routing Simulator */}
      <div className="card">
        <div className="card-title">
          <span>Live Interactive Routing Simulator</span>
          <span className="code-badge">Real-Time Evaluation</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
          Simulate how ModelMesh scores candidates and executes fallbacks for a given model and prompt.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '10px', alignItems: 'flex-end', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Target Model
            </label>
            <input
              type="text"
              value={simModel}
              onChange={e => setSimModel(e.target.value)}
              placeholder="auto, llama-3.3-70b, gpt-4o-mini"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--surface-hover)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Prompt
            </label>
            <input
              type="text"
              value={simPrompt}
              onChange={e => setSimPrompt(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--surface-hover)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          <button className="btn btn-primary" onClick={handleSimulate} disabled={simulating}>
            {simulating ? 'Routing...' : 'Dispatch Request'}
          </button>
        </div>

        {simResult && (
          <div style={{
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--surface-hover)',
            border: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              {simResult.error ? (
                <span style={{ color: 'var(--status-danger)' }}>Error: {simResult.error.message || JSON.stringify(simResult.error)}</span>
              ) : (
                <span style={{ color: 'var(--status-success)' }}>Completed via Model: {simResult.model}</span>
              )}
            </div>
            {simResult.choices?.[0]?.message?.content && (
              <p style={{ fontSize: '0.825rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                {simResult.choices[0].message.content}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
