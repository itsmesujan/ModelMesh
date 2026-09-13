import React from 'react';
import { RefreshIcon } from '../components/Icons';

interface HealthViewProps {
  health: any;
  onRefresh: () => void;
}

export const HealthView: React.FC<HealthViewProps> = ({ health, onRefresh }) => {
  const profiles = health?.profiles || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Provider Health & Circuit Matrix</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Continuous latency profiling, error taxonomy classification, and circuit breaker trip detection.
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={onRefresh}>
          <RefreshIcon size={14} /> Probe Health
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Connection ID</th>
              <th>Provider</th>
              <th>Circuit State</th>
              <th>Health Score</th>
              <th>p50 Latency</th>
              <th>p95 Latency</th>
              <th>Failures</th>
              <th>Total Requests</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                  No connection profiles active yet. Connect a provider or run AutoConnect.
                </td>
              </tr>
            ) : (
              profiles.map((p: any) => {
                const isHealthy = p.circuitState === 'CLOSED' && p.healthScore >= 0.7;
                return (
                  <tr key={p.connectionId}>
                    <td><code className="code-badge">{p.connectionId}</code></td>
                    <td style={{ fontWeight: 600 }}>{p.providerId}</td>
                    <td>
                      <span className={`status-pill ${p.circuitState === 'CLOSED' ? 'success' : p.circuitState === 'HALF_OPEN' ? 'warning' : 'danger'}`}>
                        <span className="dot" />
                        {p.circuitState}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '40px',
                          height: '6px',
                          borderRadius: '3px',
                          backgroundColor: 'var(--border)',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${Math.round(p.healthScore * 100)}%`,
                            height: '100%',
                            backgroundColor: isHealthy ? 'var(--status-success)' : 'var(--status-danger)'
                          }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{Math.round(p.healthScore * 100)}%</span>
                      </div>
                    </td>
                    <td>{p.p50LatencyMs} ms</td>
                    <td>{p.p95LatencyMs} ms</td>
                    <td>
                      <span style={{ color: p.consecutiveFailures > 0 ? 'var(--status-danger)' : 'var(--text-secondary)' }}>
                        {p.consecutiveFailures} consecutive ({p.totalFailures} total)
                      </span>
                    </td>
                    <td>{p.totalRequests}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
