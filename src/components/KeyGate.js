import React, { useState } from 'react';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export default function KeyGate({ onUnlock }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!key.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/auth/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: key.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid key');
      localStorage.setItem('access_key', key.trim());
      onUnlock(key.trim(), data.customer);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="key-gate">
      <div className="key-gate-card">
        <div className="key-gate-logo">🛡️</div>
        <h1>LLM Security Assessment</h1>
        <p className="key-gate-subtitle">Enter your access key to continue</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            className="key-gate-input"
            placeholder="Paste your access key here"
            value={key}
            onChange={e => setKey(e.target.value)}
            autoFocus
          />
          {error && <div className="key-gate-error">{error}</div>}
          <button type="submit" className="key-gate-btn" disabled={loading || !key.trim()}>
            {loading ? 'Verifying…' : 'Unlock →'}
          </button>
        </form>
        <p className="key-gate-footer">Don't have a key? Contact the administrator.</p>
      </div>
    </div>
  );
}
