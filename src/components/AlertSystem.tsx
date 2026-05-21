import React, { useState, useEffect } from 'react';

const AlertSystem = () => {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    // Fetch initial alerts from Spring Boot Backend
    fetch('http://localhost:8081/api/alerts')
      .then(res => res.json())
      .then(data => {
        // Tag with a unique ID for local component mapping
        const loadedAlerts = data.alerts.map((a: any, index: number) => ({ ...a, id: Date.now() + index }));
        setAlerts(loadedAlerts);
        
        // Auto-remove alerts gracefully after 6 seconds
        setTimeout(() => {
          setAlerts([]);
        }, 6000);
      })
      .catch(err => console.error("Alerts error:", err));
  }, []);

  const removeAlert = (id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  if (alerts.length === 0) return null;

  return (
    <div style={{ position: 'fixed', top: '100px', right: '24px', display: 'flex', flexDirection: 'column', gap: '14px', zIndex: 9999 }}>
      {alerts.map(a => (
        <div 
          key={a.id} 
          className="glass-panel" 
          style={{ 
            position: 'relative',
            padding: '1.2rem 1.5rem', 
            width: '380px', 
            borderLeft: `4px solid ${a.level === 'CRITICAL' ? 'var(--danger)' : a.level === 'WARNING' ? 'orange' : 'var(--accent-cyan)'}`, 
            background: 'rgba(15, 23, 42, 0.95)', 
            backdropFilter: 'blur(12px)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
            animation: 'slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            borderRadius: '8px'
        }}>
          <button 
            onClick={() => removeAlert(a.id)}
            style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.4rem' }}
          >
            ×
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            {a.level === 'CRITICAL' && <span style={{fontSize:'1.2rem'}}>🚨</span>}
            {a.level === 'WARNING' && <span style={{fontSize:'1.2rem'}}>⚡</span>}
            {a.level === 'INFO' && <span style={{fontSize:'1.2rem'}}>ℹ️</span>}
            <div style={{ fontWeight: 'bold', fontSize: '0.85rem', letterSpacing: '1px', color: a.level === 'CRITICAL' ? 'var(--danger)' : a.level === 'WARNING' ? 'orange' : 'var(--accent-cyan)' }}>
              {a.level} NOTIFICATION
            </div>
          </div>
          
          <div style={{ fontSize: '0.95rem', color: 'white', lineHeight: '1.5' }}>{a.message}</div>
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AlertSystem;
