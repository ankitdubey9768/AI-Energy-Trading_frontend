import React, { useState } from 'react';

const Login = ({ setRole, setIsLoggedIn }: { setRole: (role: 'Trader' | 'Manager') => void, setIsLoggedIn: (status: boolean) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'trader' && password === 'pass') {
      setRole('Trader');
      setIsLoggedIn(true);
    } else if (username === 'manager' && password === 'pass') {
      setRole('Manager');
      setIsLoggedIn(true);
    } else {
      setError('Invalid username or password. (Hint: Use trader/pass or manager/pass)');
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--accent-cyan)' }}>AI Power Hub Login</h2>
        
        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.8rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.3)' }}>{error}</div>}
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'white' }}
              placeholder="trader or manager"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'white' }}
              placeholder="pass"
              required
            />
          </div>
          
          <button type="submit" style={{ marginTop: '1rem', padding: '1rem', background: 'var(--accent-cyan)', color: 'black', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
            Secure Login
          </button>
        </form>
        
        <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          <strong>Prototype Credentials:</strong>
          <br/>Trader: <code>trader</code> / <code>pass</code>
          <br/>Manager: <code>manager</code> / <code>pass</code>
        </div>
      </div>
    </div>
  );
};

export default Login;
