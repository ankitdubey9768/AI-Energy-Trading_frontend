import { useState, useEffect } from 'react';

const TraderBidsStatusModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDrafts();
    }
  }, [isOpen]);

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8081/api/bids/drafts');
      if (res.ok) {
        const data = await res.json();
        // Sort descending by ID or createdAt if available to show newest first
        setDrafts(data.reverse());
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
    }}>
      <div className="glass-panel" style={{ width: '80%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>My Bid Submissions</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>
        
        {loading ? <p>Loading statuses...</p> : drafts.length === 0 ? <p>No bids submitted yet.</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {drafts.map((draft) => {
              let badgeClass = 'warning'; // pending
              let statusLabel = 'PENDING APPROVAL';
              if (draft.status === 'APPROVED_TO_MARKET' || draft.status === 'APPROVED') {
                  badgeClass = 'safe';
                  statusLabel = 'APPROVED';
              } else if (draft.status === 'REJECTED') {
                  badgeClass = 'danger';
                  statusLabel = 'REJECTED';
              }

              return (
              <div key={draft.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                   <strong>Draft ID:</strong>
                   <span style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>{draft.id.split('-')[0]}...</span>
                </div>
                <div>
                  <span className={`badge ${badgeClass}`}>{statusLabel}</span>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
};

export default TraderBidsStatusModal;
