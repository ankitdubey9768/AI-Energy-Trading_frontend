import { useState, useEffect } from 'react';

const PendingBidsModal = ({ isOpen, onClose, onImportBids }: { isOpen: boolean, onClose: () => void, onImportBids: (bids: any[]) => void }) => {
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
      const res = await fetch('https://ai-energy-trading-backend.onrender.com/api/bids/drafts');
      if (res.ok) {
        const data = await res.json();
        // filter out only pending if needed, or by status
        setDrafts(data.filter((d: any) => d.status === 'PENDING_APPROVAL'));
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const url = action === 'approve' 
        ? `https://ai-energy-trading-backend.onrender.com/api/bids/approve?draftId=${id}` 
        : `https://ai-energy-trading-backend.onrender.com/api/bids/reject?draftId=${id}&reason=Rejected by manager`;
      
      const res = await fetch(url, { method: 'POST' });
      if (res.ok) {
        fetchDrafts(); // refresh
      }
    } catch (e) {
      console.error(e);
    }
  };

  const parseBids = (payload: string) => {
    try {
      const data = JSON.parse(payload);
      return data.bids || [];
    } catch (e) {
      return [];
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
    }}>
      <div className="glass-panel" style={{ width: '80%', maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Pending Bid Approvals</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>
        
        {loading ? <p>Loading submissions...</p> : drafts.length === 0 ? <p>No pending bids.</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {drafts.map((draft) => {
              const bids = parseBids(draft.payloadData);
              const totalMv = bids.reduce((acc: number, b: any) => acc + (b.volume_mw || 0), 0);
              return (
              <div key={draft.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div>
                    <strong>Draft ID:</strong> {draft.id.split('-')[0]}
                    <span style={{ marginLeft: '1rem', color: 'var(--text-secondary)' }}>
                      Total MWh: {totalMv}
                    </span>
                  </div>
                  <div>
                    <span className="badge warning">Pending</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button 
                    onClick={() => handleAction(draft.id, 'approve')}
                    style={{ background: 'var(--success)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                    Approve & Submit
                  </button>
                  <button 
                    onClick={() => handleAction(draft.id, 'reject')}
                    style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                    Reject
                  </button>
                  <button 
                    onClick={() => {
                      onImportBids(bids);
                      onClose();
                    }}
                    style={{ background: 'var(--accent-purple)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                    Import & Edit Workspace
                  </button>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingBidsModal;
