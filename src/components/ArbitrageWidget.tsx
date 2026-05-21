import React, { useState, useEffect } from 'react';

const ArbitrageWidget = () => {
  const [opps, setOpps] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/arbitrage/opportunities')
      .then(res => res.json())
      .then(data => setOpps(data.opportunities))
      .catch(err => console.log(err));
  }, []);

  if (opps.length === 0) return null;

  return (
    <div className="glass-panel" style={{ marginTop: '1.5rem', background: 'linear-gradient(145deg, rgba(34, 211, 238, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', marginBottom: '1rem' }}>
        ⚡ Arbitrage Engine Signals
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {opps.map((o, i) => (
          <div 
             key={i} 
             onClick={() => {
                const el = document.getElementById(`block-row-${o.block}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
             }}
             style={{ padding: '0.8rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', borderLeft: '3px solid var(--accent-purple)', cursor: 'pointer', transition: 'background 0.2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span style={{ fontWeight: 'bold' }}>Block {o.block}</span>
              <span style={{ color: 'var(--success)' }}>+₹{o.expected_profit_per_mwh}/MWh Profit</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{o.action}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
              <span>Buy: ₹{o.buy_price} | Sell: ₹{o.sell_price}</span>
              <span>AI Confidence: {o.confidence}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArbitrageWidget;
