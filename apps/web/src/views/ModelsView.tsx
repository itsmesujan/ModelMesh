import React, { useState } from 'react';

interface ModelsViewProps {
  catalog: any;
}

export const ModelsView: React.FC<ModelsViewProps> = ({ catalog }) => {
  const canonicals = catalog?.canonicals || [];
  const offerings = catalog?.offerings || [];
  const [selectedCanonical, setSelectedCanonical] = useState<any>(canonicals[0] || null);

  const offeringsForSelected = offerings.filter((o: any) => o.canonicalId === selectedCanonical?.id);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
      {/* Table of Canonical Models */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Normalized Model Catalog</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Logical model graph decoupling client requests from specific upstream providers.
            </p>
          </div>
          <span className="code-badge">{canonicals.length} Canonical Models</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Canonical Model</th>
                <th>Family</th>
                <th>Context</th>
                <th>Benchmark</th>
                <th>Offerings</th>
              </tr>
            </thead>
            <tbody>
              {canonicals.map((model: any) => {
                const count = offerings.filter((o: any) => o.canonicalId === model.id).length;
                const isSelected = selectedCanonical?.id === model.id;

                return (
                  <tr
                    key={model.id}
                    onClick={() => setSelectedCanonical(model)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'var(--accent-subtle)' : undefined
                    }}
                  >
                    <td>
                      <div style={{ fontWeight: 600, color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}>
                        {model.name}
                      </div>
                      <div style={{ fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                        {model.id}
                      </div>
                    </td>
                    <td>
                      <span className="code-badge" style={{ textTransform: 'capitalize' }}>{model.family}</span>
                    </td>
                    <td>{model.contextWindow.toLocaleString()} tok</td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{model.benchmarkScore}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/100</span>
                    </td>
                    <td>
                      <span className={`status-pill ${count > 0 ? 'success' : 'neutral'}`}>
                        {count} available
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Panel: Offerings for selected canonical model */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'fit-content' }}>
        {selectedCanonical ? (
          <>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Canonical Model Details
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '2px' }}>{selectedCanonical.name}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {selectedCanonical.description}
              </p>
            </div>

            <div>
              <div style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Capabilities
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {selectedCanonical.capabilities?.map((cap: string) => (
                  <span key={cap} className="code-badge" style={{ textTransform: 'capitalize' }}>
                    {cap}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Active Provider Offerings ({offeringsForSelected.length})
              </div>

              {offeringsForSelected.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '12px', backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-md)' }}>
                  No active provider offerings connected for this model yet. AutoConnect or enter an API key to enable.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {offeringsForSelected.map((off: any) => (
                    <div
                      key={off.id}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: 'var(--surface-hover)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{off.providerId}</span>
                        <span className={`status-pill ${off.costClass === 'free' ? 'success' : 'neutral'}`}>
                          {off.costClass}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                        Upstream ID: {off.providerModelId}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        {off.isLocal ? 'Local Server (0ms egress)' : `$${off.inputPricePerM}/M in &bull; $${off.outputPricePerM}/M out`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Select a model to view offerings</div>
        )}
      </div>
    </div>
  );
};
