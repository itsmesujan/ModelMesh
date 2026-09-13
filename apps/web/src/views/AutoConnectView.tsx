import React, { useState } from 'react';
import { AutoConnectIcon, CheckIcon, AlertCircleIcon, RefreshIcon } from '../components/Icons';

interface AutoConnectViewProps {
  tasks: any;
  onTriggerAutoConnect: () => Promise<void>;
  onConnectKey: (providerId: string, apiKey: string) => Promise<void>;
}

export const AutoConnectView: React.FC<AutoConnectViewProps> = ({ tasks, onTriggerAutoConnect, onConnectKey }) => {
  const [running, setRunning] = useState(false);
  const [activeKeyProvider, setActiveKeyProvider] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState<string>('');

  const handleTrigger = async () => {
    setRunning(true);
    try {
      await onTriggerAutoConnect();
    } finally {
      setRunning(false);
    }
  };

  const handleSaveKey = async (providerId: string) => {
    if (!keyInput.trim()) return;
    await onConnectKey(providerId, keyInput.trim());
    setActiveKeyProvider(null);
    setKeyInput('');
    await onTriggerAutoConnect();
  };

  const steps = tasks?.steps || [];
  const connectedCount = tasks?.connectedCount || 0;
  const attentionCount = tasks?.attentionCount || 0;
  const totalModels = tasks?.totalModelsAvailable || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Signature AutoConnect Header */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AutoConnectIcon size={22} className="" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>AutoConnect Orchestrator</h2>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Scans keyless endpoints, probes local loopback servers, handles OAuth device grants, and queues exception checkpoints.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleTrigger} disabled={running}>
          <RefreshIcon size={14} className={running ? 'spin' : ''} />
          {running ? 'Running AutoConnect...' : 'Run AutoConnect Scan'}
        </button>
      </div>

      {/* Global Status Banner */}
      <div style={{
        padding: '12px 20px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--surface-hover)',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
          <span style={{ color: 'var(--status-success)' }}>{connectedCount} connected</span> &bull;{' '}
          <span style={{ color: 'var(--status-warning)' }}>{attentionCount} need attention</span> &bull;{' '}
          <span style={{ color: 'var(--accent)' }}>{totalModels} models available in routing pool</span>
        </div>
        <span className="code-badge">Durable Engine v1</span>
      </div>

      {/* Live Checklist Grid */}
      <div className="card" style={{ padding: '0' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '0.9rem' }}>
          Provider Connection State Machine
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {steps.map((step: any) => {
            const isConnected = step.state === 'Connected';
            const isHumanAction = step.state === 'Human-action';
            const isAuthReady = step.state === 'Auth-ready';

            return (
              <div
                key={step.providerId}
                style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: isConnected ? 'transparent' : 'var(--surface)'
                }}
              >
                {/* Left: Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: isConnected ? 'var(--status-success-bg)' : isHumanAction ? 'var(--status-warning-bg)' : 'var(--surface-hover)',
                    color: isConnected ? 'var(--status-success)' : isHumanAction ? 'var(--status-warning)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {isConnected ? <CheckIcon size={14} /> : <AlertCircleIcon size={14} />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{step.displayName}</span>
                      <span className="code-badge">{step.connectorType}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({step.trustTier})</span>
                    </div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {step.actionRequired || (isConnected ? `${step.discoveredModels.length} models discovered and healthy` : 'Ready to connect')}
                    </div>
                  </div>
                </div>

                {/* Right: State & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={`status-pill ${isConnected ? 'success' : isHumanAction ? 'warning' : 'neutral'}`}>
                    <span className="dot" />
                    {step.state}
                  </span>

                  {isAuthReady && step.connectorType === 'api_key' && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setActiveKeyProvider(activeKeyProvider === step.providerId ? null : step.providerId)}
                    >
                      Enter Key
                    </button>
                  )}

                  {isAuthReady && step.connectorType === 'device_flow' && (
                    <a
                      href={step.actionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{ textDecoration: 'none' }}
                    >
                      Authorize ({step.userCode})
                    </a>
                  )}

                  {isHumanAction && step.actionUrl && (
                    <a
                      href={step.actionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ textDecoration: 'none' }}
                    >
                      Open Action Portal
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inline Key Entry Modal / Flyout if open */}
      {activeKeyProvider && (
        <div className="card" style={{ border: '1px solid var(--accent)', backgroundColor: 'var(--surface-hover)' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
            Enter API Key for <span style={{ color: 'var(--accent)' }}>{activeKeyProvider}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="password"
              placeholder="Enter API key..."
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              style={{
                flex: 1,
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)'
              }}
            />
            <button className="btn btn-primary btn-sm" onClick={() => handleSaveKey(activeKeyProvider)}>
              Save & Authorize
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveKeyProvider(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
