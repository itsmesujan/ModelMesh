import React, { useState } from 'react';
import { SearchIcon, RefreshIcon } from '../components/Icons';

interface ProvidersViewProps {
  providers: any[];
  onConnectKey: (providerId: string, apiKey: string) => Promise<void>;
  onRefresh: () => void;
}

export const ProvidersView: React.FC<ProvidersViewProps> = ({ providers, onConnectKey, onRefresh }) => {
  const [selectedId, setSelectedId] = useState<string>(providers[0]?.providerId || 'groq');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [keyInput, setKeyInput] = useState<string>('');
  const [savingKey, setSavingKey] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const filtered = providers.filter(p => {
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesSearch = p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.providerId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const selected = providers.find(p => p.providerId === selectedId) || providers[0];

  const handleSaveKey = async () => {
    if (!keyInput.trim() || !selected) return;
    setSavingKey(true);
    setSaveMessage(null);
    try {
      await onConnectKey(selected.providerId, keyInput.trim());
      setKeyInput('');
      setSaveMessage('Key encrypted and saved to local vault successfully.');
      onRefresh();
    } catch (err: any) {
      setSaveMessage(`Error: ${err.message}`);
    } finally {
      setSavingKey(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '20px', height: 'calc(100vh - 120px)' }}>
      {/* Left Panel: Catalog & Filters */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '16px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <SearchIcon size={14} className="" />
            <input
              type="text"
              placeholder="Search providers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 28px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--surface-hover)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onRefresh} title="Refresh catalog">
            <RefreshIcon size={14} />
          </button>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '8px' }}>
          {['all', 'cloud', 'local', 'keyless', 'aggregator'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                padding: '3px 8px',
                borderRadius: '999px',
                fontSize: '0.725rem',
                border: '1px solid var(--border)',
                backgroundColor: categoryFilter === cat ? 'var(--accent)' : 'transparent',
                color: categoryFilter === cat ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Provider List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {filtered.map(p => {
            const isSelected = p.providerId === selected?.providerId;
            const isConnected = p.connectionStatus === 'Connected';
            return (
              <div
                key={p.providerId}
                onClick={() => setSelectedId(p.providerId)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelected ? 'var(--accent-subtle)' : 'var(--surface)',
                  border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}>
                    {p.displayName}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {p.providerId} &bull; {p.category}
                  </div>
                </div>
                <span className={`status-pill ${isConnected ? 'success' : 'neutral'}`}>
                  <span className="dot" />
                  {isConnected ? 'Connected' : 'Ready'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Panel: Connection Detail & Secure Input */}
      {selected && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{selected.displayName}</h2>
                <span className="code-badge">{selected.trustTier}</span>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {selected.description} &bull; <a href={selected.website} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Official Docs &rarr;</a>
              </p>
            </div>
            <span className={`status-pill ${selected.connectionStatus === 'Connected' ? 'success' : 'warning'}`}>
              <span className="dot" /> {selected.connectionStatus}
            </span>
          </div>

          {/* Capabilities Matrix */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Supported Capabilities</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {selected.capabilities?.map((cap: string) => (
                <span key={cap} className="code-badge" style={{ textTransform: 'capitalize' }}>
                  {cap}
                </span>
              ))}
            </div>
          </div>

          {/* Connection Mode Card */}
          <div style={{ backgroundColor: 'var(--surface-hover)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Connection Strategy: <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{selected.connectors?.[0]?.type || 'api_key'}</span>
            </div>
            {selected.connectors?.[0]?.baseUrl && (
              <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Base URL: <code className="code-badge">{selected.connectors[0].baseUrl}</code>
              </div>
            )}
            {selected.actionRequired && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                {selected.actionRequired}
              </div>
            )}

            {/* API Key Input Form for credentialed providers */}
            {selected.connectors?.[0]?.type === 'api_key' && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.775rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  Enter API Key (Encrypted in AES-256-GCM Vault)
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="password"
                    placeholder={`e.g. ${selected.connectors[0].keyPrefix || 'sk-'}...`}
                    value={keyInput}
                    onChange={e => setKeyInput(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                  <button
                    className="btn btn-primary"
                    disabled={savingKey || !keyInput.trim()}
                    onClick={handleSaveKey}
                  >
                    {savingKey ? 'Saving...' : 'Save & Connect'}
                  </button>
                </div>
                {saveMessage && (
                  <div style={{ fontSize: '0.75rem', color: saveMessage.startsWith('Error') ? 'var(--status-danger)' : 'var(--status-success)' }}>
                    {saveMessage}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Model Catalog Preview for this Provider */}
          {selected.staticModels && selected.staticModels.length > 0 && (
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Registered Models</div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Model ID</th>
                      <th>Canonical ID</th>
                      <th>Context</th>
                      <th>Cost Class</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.staticModels.map((m: any) => (
                      <tr key={m.id}>
                        <td><code className="code-badge">{m.id}</code></td>
                        <td>{m.canonicalId}</td>
                        <td>{m.contextWindow.toLocaleString()} tokens</td>
                        <td>
                          <span className={`status-pill ${m.costClass === 'free' ? 'success' : 'neutral'}`}>
                            {m.costClass}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
