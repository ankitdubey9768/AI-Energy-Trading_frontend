import { useState } from 'react';

const BecknWidget = () => {
  const [providers, setProviders] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [orderState, setOrderState] = useState<any>(null);

  const handleSearch = () => {
    setSearching(true);
    setOrderState(null);
    fetch('https://ai-energy-trading-backend.onrender.com/api/beckn/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intent: "buy_power", volume: 50 })
    })
    .then(res => res.json())
    .then(data => {
      setProviders(data.message.catalog.providers);
      setSearching(false);
    })
    .catch(err => {
      console.error(err);
      setSearching(false);
    });
  };

  const handleOrder = (providerId: string) => {
    fetch('https://ai-energy-trading-backend.onrender.com/api/beckn/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider_id: providerId, volume: 50 })
    })
    .then(res => res.json())
    .then(data => {
      setOrderState(data.message.order);
    })
    .catch(err => console.error(err));
  };

  return (
    <div className="glass-panel" style={{ marginTop: '1.5rem', border: '1px solid var(--accent-blue)', background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.05) 0%, transparent 100%)' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-blue)', marginBottom: '0.8rem' }}>
        🌐 Beckn P2P Energy Network
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        Discover decentralized micro-grids for peer-to-peer power trading without central exchanges.
      </p>

      {orderState ? (
        <div style={{ padding: '1.2rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px dashed var(--success)', borderRadius: '8px' }}>
          <div style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>✅ Smart Contract Locked</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Beckn Transaction Hash:</div>
          <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--text-primary)' }}>{orderState.id}</div>
          <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>Fulfillment Provider:</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{orderState.provider.id}</div>
          <div style={{ fontSize: '0.85rem', marginTop: '0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>Contract Status: <span className="badge safe" style={{ border: '1px solid var(--success)' }}>{orderState.state}</span></div>
          <button className="strategy-btn" style={{ marginTop: '1rem', width: '100%', background: 'rgba(255,255,255,0.05)' }} onClick={() => { setOrderState(null); setProviders([]); }}>
            Reset Network Session
          </button>
        </div>
      ) : (
        <>
          <button className="btn-submit" onClick={handleSearch} style={{ background: 'var(--accent-blue)', padding: '0.8rem', marginTop: 0, marginBottom: '1rem' }}>
            {searching ? 'Scanning Decentralized Nodes...' : 'Query Beckn Network Nodes'}
          </button>

          {providers.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginBottom: '0.2rem' }}>2 Decentralized Nodes Responded:</div>
              {providers.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', borderLeft: '3px solid var(--accent-cyan)' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{p.descriptor.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Node Hash: {p.id}</div>
                  </div>
                  <button onClick={() => handleOrder(p.id)} style={{ background: 'var(--success)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', transition: 'transform 0.1s' }}>
                    Connect
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BecknWidget;
