import React from 'react';


interface SettingsViewProps {
  overview: any;
  theme: string;
  onToggleTheme: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ overview, theme, onToggleTheme }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Gateway Settings & Environment</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Configuration, credential vault status, database persistence, and developer settings.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <div className="card-title">Daemon & Network Runtime</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Gateway Host</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Default loopback binding</div>
              </div>
              <span className="code-badge">{overview?.host || '127.0.0.1'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Gateway Port</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>OpenAI-compatible proxy port</div>
              </div>
              <span className="code-badge">{overview?.port || 4000}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Database Engine</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Zero-compilation native persistence</div>
              </div>
              <span className="code-badge">Node.js 26 node:sqlite (WAL)</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Security & Cryptographic Vault</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Vault Encryption</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Authenticated symmetric cipher</div>
              </div>
              <span className="status-pill success"><span className="dot" /> AES-256-GCM</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Key Derivation</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>100,000 SHA-256 iterations</div>
              </div>
              <span className="code-badge">PBKDF2-HMAC-SHA256</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Secret Redaction</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Masks keys in all logs & traces</div>
              </div>
              <span className="status-pill success"><span className="dot" /> Active</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Visual Theme</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Calm developer palette</div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={onToggleTheme}>
                Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
