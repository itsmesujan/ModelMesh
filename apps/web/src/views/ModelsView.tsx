import React, { useState, useMemo } from 'react';

interface ModelsViewProps {
  catalog: any;
}

export const ModelsView: React.FC<ModelsViewProps> = ({ catalog }) => {
  const canonicals = catalog?.canonicals || [];
  const offerings = catalog?.offerings || [];

  const [selectedCanonical, setSelectedCanonical] = useState<any>(canonicals[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('all');
  const [connectedOnly, setConnectedOnly] = useState(false);

  // Compute family counts
  const familyCounts = useMemo(() => {
    const counts: Record<string, number> = { all: canonicals.length };
    for (const model of canonicals) {
      const fam = model.family?.toLowerCase() || 'other';
      counts[fam] = (counts[fam] || 0) + 1;
    }
    return counts;
  }, [canonicals]);

  // Available families dynamically computed from catalog
  const availableFamilies = useMemo<string[]>(() => {
    const families = canonicals.map((m: any) => (m.family?.toLowerCase() || 'other') as string);
    const unique = Array.from(new Set<string>(families)).sort();
    return ['all', ...unique];
  }, [canonicals]);


  // Filtered models
  const filteredModels = useMemo(() => {
    return canonicals.filter((m: any) => {
      // Family filter
      if (selectedFamily !== 'all') {
        const fam = m.family?.toLowerCase() || 'other';
        if (fam !== selectedFamily) return false;
      }

      // Connected only filter
      const offeringCount = offerings.filter((o: any) => o.canonicalId === m.id).length;
      if (connectedOnly && offeringCount === 0) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = m.name?.toLowerCase().includes(q);
        const matchId = m.id?.toLowerCase().includes(q);
        const matchDesc = m.description?.toLowerCase().includes(q);
        const matchFamily = m.family?.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchDesc && !matchFamily) {
          return false;
        }
      }

      return true;
    });
  }, [canonicals, offerings, selectedFamily, connectedOnly, searchQuery]);

  const offeringsForSelected = offerings.filter((o: any) => o.canonicalId === selectedCanonical?.id);
  const activeOfferingsTotal = offerings.length;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
      {/* Table & Filter Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Normalized Model Catalog</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Decoupling client requests from specific providers. Every model backed by live provider offerings.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="code-badge" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}>
              {canonicals.length} Models
            </span>
            <span className="code-badge" style={{ backgroundColor: 'var(--status-success-bg)', color: 'var(--status-success)' }}>
              {activeOfferingsTotal} Active Offerings
            </span>
          </div>
        </div>

        {/* Search & Action Bar */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by model name, ID, or capability..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                padding: '8px 12px',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                &times;
              </button>
            )}
          </div>

          <button
            className={`btn ${connectedOnly ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setConnectedOnly(!connectedOnly)}
            style={{ fontSize: '0.8rem', padding: '7px 12px' }}
          >
            {connectedOnly ? '✓ Connected Only' : 'Show Connected Only'}
          </button>
        </div>

        {/* Family Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {availableFamilies.map((fam) => {
            const count = familyCounts[fam] || 0;
            const isSelected = selectedFamily === fam;
            return (
              <button
                key={fam}
                onClick={() => setSelectedFamily(fam)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                  backgroundColor: isSelected ? 'var(--accent)' : 'var(--surface)',
                  color: isSelected ? '#fff' : 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  textTransform: fam === 'all' ? 'capitalize' : 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{fam}</span>
                <span
                  style={{
                    fontSize: '0.675rem',
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--surface-active)',
                    padding: '1px 5px',
                    borderRadius: '999px',
                    color: isSelected ? '#fff' : 'var(--text-muted)'
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Models Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Canonical Model</th>
                <th>Family</th>
                <th>Context</th>
                <th>Benchmark</th>
                <th>Capabilities</th>
                <th>Offerings</th>
              </tr>
            </thead>
            <tbody>
              {filteredModels.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No models match the current search query or family filter.
                  </td>
                </tr>
              ) : (
                filteredModels.map((model: any) => {
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
                      <td>
                        {model.contextWindow >= 1000000
                          ? `${(model.contextWindow / 1000000).toFixed(1)}M tok`
                          : `${(model.contextWindow / 1000).toFixed(0)}k tok`}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{model.benchmarkScore || 85}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/100</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {model.capabilities?.slice(0, 3).map((cap: string) => (
                            <span key={cap} className="code-badge" style={{ fontSize: '0.7rem', padding: '1px 5px' }}>
                              {cap}
                            </span>
                          ))}
                          {(model.capabilities?.length || 0) > 3 && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              +{model.capabilities.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`status-pill ${count > 0 ? 'success' : 'neutral'}`}>
                          {count > 0 ? `${count} active` : 'catalog only'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
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
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '2px' }}>
                ID: {selectedCanonical.id}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                {selectedCanonical.description}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ padding: '8px 10px', backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Context Window</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{selectedCanonical.contextWindow?.toLocaleString()} tok</div>
              </div>
              <div style={{ padding: '8px 10px', backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Benchmark Elo</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--status-success)' }}>
                  {selectedCanonical.benchmarkScore || 85}/100
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Capabilities & Modalities
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {selectedCanonical.capabilities?.map((cap: string) => (
                  <span key={cap} className="code-badge" style={{ textTransform: 'capitalize' }}>
                    {cap}
                  </span>
                ))}
                {selectedCanonical.modalities?.map((mod: string) => (
                  <span key={mod} className="code-badge" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                    {mod}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Active Connected Offerings ({offeringsForSelected.length})
              </div>

              {offeringsForSelected.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '12px', backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-md)' }}>
                  No active provider offerings connected for this model yet. Connect a provider via AutoConnect or enter an API key to enable instant routing.
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
                        {off.isLocal ? 'Local Server (0ms egress)' : (off.costClass === 'free' ? 'Free Community Tier' : `$${off.inputPricePerM}/M in &bull; $${off.outputPricePerM}/M out`)}
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
