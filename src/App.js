import React, { useState } from 'react';
import './App.css';
import AttackConfig from './components/AttackConfig';
import ResultsViewer from './components/ResultsViewer';
import LogsViewer from './components/LogsViewer';
import { api } from './services/api';

const TABS = ['attack', 'logs'];

export default function App() {
  const [tab, setTab] = useState('attack');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [singleResult, setSingleResult] = useState(null);
  const [error, setError] = useState('');

  const handleRunAttack = async (payload) => {
    setLoading(true);
    setError('');
    setSingleResult(null);
    setSession(null);
    try {
      if (payload.type === 'escalation') {
        const result = await api.runEscalation({ turns: payload.turns, goal: payload.goal, targetId: payload.targetId, customTarget: payload.customTarget, apiKeys: payload.apiKeys });
        setSingleResult(result);
      } else {
        const result = await api.runSingleAttack(payload);
        setSingleResult(result);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunSession = async (payload) => {
    setLoading(true);
    setError('');
    setSingleResult(null);
    setSession(null);
    try {
      const result = await api.runSession(payload);
      setSession(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-brand">
          <span className="header-icon">🔴</span>
          <h1>LLM Red Team Agent</h1>
          <span className="header-target">Target: Sarvam AI (sarvam-m)</span>
        </div>
        <nav className="header-nav">
          {TABS.map(t => (
            <button
              key={t}
              className={`nav-btn ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'attack' ? '⚔️ Attack' : '📋 Logs'}
            </button>
          ))}
        </nav>
      </header>

      {error && (
        <div className="global-error">
          <strong>Error:</strong> {error}
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {/* Main content */}
      <main className="app-main">
        {tab === 'attack' && (
          <div className="attack-layout">
            <aside className="config-panel">
              <AttackConfig
                onRunAttack={handleRunAttack}
                onRunSession={handleRunSession}
                loading={loading}
              />
            </aside>
            <section className="results-panel">
              {loading && (
                <div className="loading-overlay">
                  <div className="spinner" />
                  <p>Running attack...</p>
                </div>
              )}
              <ResultsViewer session={session} singleResult={singleResult} />
            </section>
          </div>
        )}

        {tab === 'logs' && <LogsViewer />}
      </main>
    </div>
  );
}
