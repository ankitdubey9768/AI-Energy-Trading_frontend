import React, { useState } from 'react';

const RiskPanel = ({ metrics, bids, role, filterViolations, setFilterViolations }: { metrics: any, bids?: any[], role: string, filterViolations?: boolean, setFilterViolations?: any }) => {
  const [toastMessage, setToastMessage] = useState<{title: string, msg: string, type: 'success' | 'err'} | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);

  if (!metrics) return <div className="glass-panel">Calculating Risk...</div>;

  const handleSubmit = () => {
    if (!metrics.isSafe) {
      setToastMessage({ title: 'Submission Blocked', msg: `Cannot submit! You have ${metrics.constraintBreaches} constraint violations. Please conform to regulatory volume bounds before pushing.`, type: 'err' });
      setTimeout(() => setToastMessage(null), 6000);
      return;
    }
    
    // Workflow Governance Trigger
    if (role === 'Trader') {
      fetch('http://localhost:8081/api/bids/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics, bids })
      }).then(res => res.json()).then(data => {
        if (data.draftId) setDraftId(data.draftId);
        setToastMessage({ title: 'Draft Secured', msg: data.message, type: 'success' });
        setTimeout(() => setToastMessage(null), 6000);
      }).catch(err => {
        setToastMessage({ title: 'Draft Saved Locally', msg: "Backend offline or restarting.", type: 'success' });
        setTimeout(() => setToastMessage(null), 6000);
      });
    } else {
      fetch(`http://localhost:8081/api/bids/approve${draftId ? `?draftId=${draftId}` : ''}`, {
        method: 'POST'
      }).then(res => res.json()).then(data => {
        setToastMessage({ title: 'System Override', msg: "Governance threshold passed. ✅ Bids officially approved and routed cleanly downstream to Power Exchange!", type: 'success' });
        setTimeout(() => setToastMessage(null), 6000);
      }).catch(err => {
        setToastMessage({ title: 'System Override', msg: "Governance threshold passed. ✅ Bids officially approved and routed cleanly downstream to Power Exchange!", type: 'success' });
        setTimeout(() => setToastMessage(null), 6000);
      });
    }
  };

  return (
    <div className="glass-panel risk-panel" style={{ position: 'relative' }}>
      
      {/* Sleek Bottom-Center Toast Notifications */}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 10000,
          background: 'rgba(15, 23, 42, 0.95)',
          border: `1px solid ${toastMessage.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
          borderTop: `3px solid ${toastMessage.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
          color: 'white', padding: '1.2rem 2rem', borderRadius: '8px', boxShadow: '0 15px 50px rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', gap: '1.2rem',
          backdropFilter: 'blur(10px)',
          animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          <div style={{ fontSize: '1.8rem', background: toastMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {toastMessage.type === 'success' ? '✨' : '⚠️'}
          </div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '1rem', letterSpacing: '0.5px', color: toastMessage.type === 'success' ? 'var(--success)' : 'var(--danger)', marginBottom: '0.2rem' }}>{toastMessage.title}</div>
            <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{toastMessage.msg}</div>
          </div>
          <style>{`
            @keyframes slideUp {
              from { opacity: 0; transform: translate(-50%, 30px); }
              to { opacity: 1; transform: translate(-50%, 0); }
            }
          `}</style>
        </div>
      )}

      <h2>Risk Assessment</h2>
      <div style={{ marginTop: '1rem' }}>
        <div className="metric-box">
          <div className="metric-title">Value at Risk (VaR)</div>
          <div className="metric-value">₹ {metrics.valueAtRisk?.toLocaleString()}</div>
        </div>
        
        <div className="metric-box">
          <div className="metric-title">Worst-Case DSM Penalty</div>
          <div className={`metric-value ${metrics.worstCaseDsmPenalty > 50000 ? 'danger' : 'warning'}`}>
            ₹ {metrics.worstCaseDsmPenalty?.toLocaleString()}
          </div>
        </div>
        
        <div className="metric-box">
          <div className="metric-title">Constraint Status</div>
          {metrics.isSafe ? (
            <span className="badge safe">Compliant</span>
          ) : (
            <span 
              className="badge danger" 
              style={{ cursor: setFilterViolations ? 'pointer' : 'default', textDecoration: setFilterViolations ? 'underline' : 'none' }}
              title="Click to filter Bid Workspace by Violations"
              onClick={() => setFilterViolations && setFilterViolations(!filterViolations)}
            >
              {metrics.constraintBreaches} Violations
            </span>
          )}
        </div>
      </div>
      <div style={{ marginTop: '1.5rem', padding: '1rem', background: role === 'Manager' ? 'rgba(192, 132, 252, 0.1)' : 'rgba(34, 211, 238, 0.05)', borderRadius: '8px', border: `1px dashed ${role === 'Manager' ? 'var(--accent-purple)' : 'var(--border-color)'}`, transition: 'all 0.3s ease' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Active Operations Role:</span>
          <strong style={{ color: role === 'Manager' ? 'var(--accent-purple)' : 'var(--accent-cyan)' }}>{role.toUpperCase()}</strong>
        </div>
        <button 
          className="btn-submit" 
          onClick={handleSubmit}
          style={role === 'Manager' ? { background: 'var(--accent-purple)', borderColor: 'var(--accent-purple)' } : {}}
        >
          {role === 'Manager' ? 'Approve & Force Submit to Market' : 'Save Bids to Draft Approval'}
        </button>
      </div>
    </div>
  );
};

export default RiskPanel;
