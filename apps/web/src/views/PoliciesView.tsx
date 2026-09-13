import React from 'react';


interface PoliciesViewProps {
  policies: any;
}

export const PoliciesView: React.FC<PoliciesViewProps> = ({ policies }) => {
  const activePolicy = policies?.activePolicy || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Compliance & Data Governance</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Policy gates eliminate candidates before scoring. Models violating active policy are strictly excluded.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <div className="card-title">Active Policy Constraints</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Policy Mode</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Defines multi-signal weighting priority</div>
              </div>
              <span className="code-badge">{activePolicy.mode || 'Balanced'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Free-Only Constraint</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Strictly rejects all paid providers</div>
              </div>
              <span className={`status-pill ${activePolicy.requireFreeOnly ? 'success' : 'neutral'}`}>
                {activePolicy.requireFreeOnly ? 'Enforced' : 'Disabled'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Local-Only Constraint</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Strictly rejects cloud endpoints</div>
              </div>
              <span className={`status-pill ${activePolicy.requireLocalOnly ? 'success' : 'neutral'}`}>
                {activePolicy.requireLocalOnly ? 'Enforced' : 'Disabled'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>No-Training Guarantee</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Excludes providers retaining data for training</div>
              </div>
              <span className={`status-pill ${activePolicy.noTrainingRequired ? 'success' : 'neutral'}`}>
                {activePolicy.noTrainingRequired ? 'Enforced' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Policy Enforcement Architecture</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Unlike ordinary AI routers that purely optimize for lowest cost or latency, ModelMesh evaluates policy gates <strong>first</strong>. A low-cost provider that violates your privacy or local-only policy is completely eliminated before scoring begins.
          </p>
          <div style={{ padding: '14px', backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)', fontSize: '0.775rem' }}>
            candidate score = policy_gate<br />
            &nbsp;&nbsp;* (w_health * health<br />
            &nbsp;&nbsp;+ w_cap * capability<br />
            &nbsp;&nbsp;+ w_quota * quota<br />
            &nbsp;&nbsp;+ w_lat * latency<br />
            &nbsp;&nbsp;+ w_qual * quality<br />
            &nbsp;&nbsp;+ w_cost * cost<br />
            &nbsp;&nbsp;+ w_stab * stability)
          </div>
        </div>
      </div>
    </div>
  );
};
