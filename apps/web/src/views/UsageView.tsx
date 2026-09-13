import React from 'react';

interface UsageViewProps {
  telemetry: any;
}

export const UsageView: React.FC<UsageViewProps> = ({ telemetry }) => {
  const summary = telemetry?.summary || {
    totalRequests: 0,
    totalErrors: 0,
    errorRate: 0,
    totalTokens: 0,
    estimatedCostUsd: 0,
    p50LatencyMs: 0,
    p95LatencyMs: 0
  };
  const events = telemetry?.events || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Telemetry & Observability</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          OpenTelemetry-compatible request traces, latency distributions, and local-only privacy telemetry.
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px' }}>
        <div className="card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Requests</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '4px' }}>{summary.totalRequests}</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Error Rate</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '4px', color: summary.errorRate > 0 ? 'var(--status-danger)' : 'var(--status-success)' }}>
            {(summary.errorRate * 100).toFixed(1)}%
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>p50 Latency</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '4px' }}>{summary.p50LatencyMs} ms</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>p95 Latency</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '4px' }}>{summary.p95LatencyMs} ms</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tokens Processed</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '4px' }}>{summary.totalTokens.toLocaleString()}</div>
        </div>
      </div>

      {/* Privacy Notice Card */}
      <div className="card" style={{ backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Zero Cloud Leakage & Redacted Logs</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              All request traces remain strictly on your local machine. API keys and authorization tokens are redacted before recording.
            </div>
          </div>
          <span className="status-pill success"><span className="dot" /> Local Telemetry Only</span>
        </div>
      </div>

      {/* Recent Traces Table */}
      <div className="card">
        <div className="card-title">Recent Request Traces</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Request ID</th>
                <th>Canonical Model</th>
                <th>Provider Offering</th>
                <th>Latency</th>
                <th>Status</th>
                <th>Tokens</th>
                <th>Rationale</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    No requests routed yet. Send a test query via the Simulator or OpenAI SDK.
                  </td>
                </tr>
              ) : (
                events.map((e: any) => (
                  <tr key={e.id}>
                    <td style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                      {new Date(e.timestamp).toLocaleTimeString()}
                    </td>
                    <td><code className="code-badge">{e.requestId}</code></td>
                    <td>{e.canonicalModel}</td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{e.providerId}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/{e.providerModelId}</span>
                    </td>
                    <td>{e.latencyMs} ms</td>
                    <td>
                      <span className={`status-pill ${e.statusCode === 200 ? 'success' : 'danger'}`}>
                        {e.statusCode}
                      </span>
                    </td>
                    <td>{e.totalTokens}</td>
                    <td style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', maxWidth: '300px' }}>
                      {e.traceRationale || 'Standard route'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
