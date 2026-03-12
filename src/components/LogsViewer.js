import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function LogsViewer() {
  const [logs, setLogs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getLogs()
      .then(data => setLogs(data.files || []))
      .catch(() => setLogs([]));
  }, []);

  const loadLog = async (filename) => {
    setLoading(true);
    setSelected(filename);
    try {
      const data = await api.getLog(filename);
      setEntries(data.entries || []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="logs-viewer">
      <h2>Session Logs</h2>
      {logs.length === 0 ? (
        <p>No logs yet. Run an attack session to generate logs.</p>
      ) : (
        <div className="logs-layout">
          <div className="logs-sidebar">
            {logs.map(f => (
              <div
                key={f}
                className={`log-file ${selected === f ? 'active' : ''}`}
                onClick={() => loadLog(f)}
              >
                📄 {f}
              </div>
            ))}
          </div>
          <div className="log-content">
            {loading && <p>Loading...</p>}
            {!loading && entries.map((entry, i) => (
              <div key={i} className="log-entry">
                <div className="log-entry-header">
                  <span>{entry.timestamp || entry.id}</span>
                  {entry.summary && (
                    <span className={`risk-badge risk-${entry.summary.overallRisk?.toLowerCase()}`}>
                      {entry.summary.overallRisk} RISK
                    </span>
                  )}
                </div>
                <pre>{JSON.stringify(entry, null, 2)}</pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
