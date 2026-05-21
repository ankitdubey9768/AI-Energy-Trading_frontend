import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import AlertSystem from './components/AlertSystem';
import Login from './components/Login';

function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [role, setRole] = useState<'Trader' | 'Manager'>('Trader');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [notificationCount, setNotificationCount] = useState(0);
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Global Notification WebSocket
  useEffect(() => {
    let ws = new WebSocket('https://ai-energy-trading-ml-service.onrender.com/ws/notifications');
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setSystemAlerts(prev => {
          if (prev.find(p => p.id === payload.id)) return prev;
          return [payload, ...prev].slice(0, 50); // limit memory to 50 alerts
        });
      } catch (e) {}
    };
    return () => ws.close();
  }, []);

  useEffect(() => {
    setNotificationCount(systemAlerts.filter(a => !a.read).length);
  }, [systemAlerts]);

  const markAsRead = (id: string, e: any) => {
    e.stopPropagation();
    setSystemAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isLoggedIn) {
    return <Login setRole={setRole} setIsLoggedIn={setIsLoggedIn} />;
  }

  return (
    <div className="app-container">
      <AlertSystem />
      <header className="header" style={{ alignItems: 'flex-start' }}>
        <div>
          <h1>AI Power Trading Hub</h1>
          <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
             {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} | 
             <strong style={{ color: 'white' }}>{currentTime.toLocaleTimeString()}</strong>
          </div>
        </div>
        <div className="user-profile" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
            title="Toggle Light/Dark Mode"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <div 
            style={{ position: 'relative', cursor: 'pointer', marginRight: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <span style={{ fontSize: '1.2rem' }}>🔔</span>
            {notificationCount > 0 && (
              <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--danger)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
                {notificationCount}
              </span>
            )}
            
            {showNotifications && (
              <div style={{ position: 'absolute', top: '50px', right: '0', width: '380px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', zIndex: 9999 }}>
                <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>System Alerts</h4>
                
                {systemAlerts.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No active system alerts.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '400px', overflowY: 'auto' }}>
                     
                     {systemAlerts.map((a, _i) => (
                        <div key={a.id} 
                             onClick={(e) => markAsRead(a.id, e)}
                             style={{ padding: '0.8rem', background: a.read ? 'rgba(0,0,0,0.3)' : (a.level === 'CRITICAL' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)'), borderLeft: `3px solid ${a.level === 'CRITICAL' ? 'var(--danger)' : (a.level === 'INFO' ? 'var(--accent-blue)' : 'var(--warning)')}`, borderRadius: '4px', textAlign: 'left', opacity: a.read ? 0.5 : 1, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: a.read ? 'var(--text-secondary)' : (a.level === 'CRITICAL' ? 'var(--danger)' : (a.level === 'INFO' ? 'var(--accent-blue)' : 'var(--warning)')), display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                               {a.level === 'CRITICAL' ? '🚨' : (a.level === 'INFO' ? 'ℹ️' : '⚠️')} {a.level} NOTIFICATION
                             </div>
                             {!a.read && <span style={{ fontSize: '0.65rem', background: 'var(--accent-cyan)', color: 'black', padding: '0.1rem 0.4rem', borderRadius: '10px', fontWeight: 'bold' }}>NEW</span>}
                           </div>
                           <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textDecoration: a.read ? 'line-through' : 'none' }}>{a.message}</div>
                           <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textAlign: 'right', marginTop: '0.2rem' }}>{new Date(a.timestamp).toLocaleTimeString()}</div>
                        </div>
                     ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.4rem 0.8rem', borderRadius: '4px', border: `1px solid ${role === 'Manager' ? 'var(--accent-purple)' : 'var(--accent-cyan)'}` }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Role:</span>
            <strong style={{ color: role === 'Manager' ? 'var(--accent-purple)' : 'var(--accent-cyan)' }}>{role.toUpperCase()}</strong>
          </div>
          
          <button 
            onClick={() => setIsLoggedIn(false)}
            style={{ background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
          >
            Logout
          </button>
          
          <span className="badge safe">Live Environment</span>
        </div>
      </header>
      
      <main>
        <Dashboard role={role} />
      </main>
    </div>
  );
}

export default App;
