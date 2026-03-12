import React, { useState } from 'react';

const LABEL_COLORS = {
  SAFE: '#22c55e',
  PARTIAL_BREACH: '#f59e0b',
  JAILBROKEN: '#ef4444',
  CRITICAL: '#7c3aed',
  ERROR: '#6b7280'
};

const SEVERITY_COLORS = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#ef4444',
  critical: '#7c3aed'
};

function ScoreBar({ score }) {
  const pct = (score / 10) * 100;
  const color = score <= 3 ? '#22c55e' : score <= 6 ? '#f59e0b' : score <= 9 ? '#ef4444' : '#7c3aed';
  return (
    <div className="score-bar-container">
      <div className="score-bar" style={{ width: `${pct}%`, backgroundColor: color }} />
      <span className="score-label">{score}/10</span>
    </div>
  );
}

function SummaryCard({ summary }) {
  if (!summary) return null;
  const riskColors = { LOW: '#22c55e', MEDIUM: '#f59e0b', HIGH: '#ef4444' };

  return (
    <div className="summary-card">
      <h3>Session Summary</h3>
      <div className="summary-grid">
        <div className="summary-stat">
          <span className="stat-value">{summary.totalAttacks}</span>
          <span className="stat-label">Total Attacks</span>
        </div>
        <div className="summary-stat">
          <span className="stat-value">{summary.averageScore}</span>
          <span className="stat-label">Avg Score</span>
        </div>
        <div className="summary-stat">
          <span className="stat-value">{summary.jailbreakSuccessRate}%</span>
          <span className="stat-label">Success Rate</span>
        </div>
        <div className="summary-stat">
          <span className="stat-value" style={{ color: riskColors[summary.overallRisk] }}>
            {summary.overallRisk}
          </span>
          <span className="stat-label">Overall Risk</span>
        </div>
      </div>

      {/* Label breakdown */}
      <div className="label-breakdown">
        {Object.entries(summary.byLabel || {}).map(([label, count]) => (
          <span key={label} className="label-chip" style={{ backgroundColor: LABEL_COLORS[label] }}>
            {label}: {count}
          </span>
        ))}
      </div>

      {/* Category breakdown */}
      {Object.keys(summary.byCategory || {}).length > 0 && (
        <div className="category-breakdown">
          <strong>Violation Categories:</strong>
          {Object.entries(summary.byCategory).map(([cat, count]) => (
            <span key={cat} className="cat-chip">{cat} ({count})</span>
          ))}
        </div>
      )}
    </div>
  );
}

function ResultRow({ result, index }) {
  const [expanded, setExpanded] = useState(false);
  const j = result.judgment || {};

  return (
    <div className="result-row">
      <div className="result-header" onClick={() => setExpanded(!expanded)}>
        <span className="result-index">#{index + 1}</span>
        <span className="result-strategy">{result.strategy?.name || 'Unknown'}</span>
        <span className="result-category">{result.strategy?.category || ''}</span>
        <span
          className="result-severity"
          style={{ color: SEVERITY_COLORS[result.strategy?.severity] }}
        >
          {result.strategy?.severity}
        </span>
        <span
          className="result-label"
          style={{ backgroundColor: LABEL_COLORS[j.label] }}
        >
          {j.label || 'N/A'}
        </span>
        <ScoreBar score={j.score || 0} />
        <span className="expand-icon">{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div className="result-detail">
          {result.error && <div className="error-msg">Error: {result.error}</div>}

          <div className="detail-section">
            <strong>Judge Reasoning:</strong>
            <p>{j.reason}</p>
            {j.categories?.length > 0 && (
              <div>
                <strong>Violation Categories:</strong>{' '}
                {j.categories.map(c => <span key={c} className="cat-chip">{c}</span>)}
              </div>
            )}
          </div>

          {result.attackPrompt && (
            <div className="detail-section">
              <strong>Attack Prompt:</strong>
              <pre>{result.attackPrompt}</pre>
            </div>
          )}

          {result.targetResponse && (
            <div className="detail-section">
              <strong>Target Response:</strong>
              <pre>{result.targetResponse}</pre>
            </div>
          )}

          {/* PAIR iterations */}
          {result.iterations && (
            <div className="detail-section">
              <strong>PAIR Iterations ({result.iterations.length}):</strong>
              {result.iterations.map((iter, i) => (
                <div key={i} className="iteration">
                  <span className="iter-label">Iteration {iter.iteration}</span>
                  <span className="iter-score">Score: {iter.judgment?.score}/10</span>
                  <span className="iter-label-badge"
                    style={{ backgroundColor: LABEL_COLORS[iter.judgment?.label] }}>
                    {iter.judgment?.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Escalation turns */}
          {result.turns && (
            <div className="detail-section">
              <strong>Escalation Turns:</strong>
              {result.turns.map((turn, i) => (
                <div key={i} className="turn-block">
                  <div className="turn-label">{turn.turnLabel}</div>
                  <div><strong>Prompt:</strong> {turn.prompt}</div>
                  <div><strong>Response:</strong> {turn.response}</div>
                  <div>
                    Score: {turn.judgment?.score}/10 —{' '}
                    <span style={{ color: LABEL_COLORS[turn.judgment?.label] }}>
                      {turn.judgment?.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ResultsViewer({ session, singleResult }) {
  if (!session && !singleResult) {
    return (
      <div className="results-empty">
        <p>No results yet. Configure and run an attack on the left.</p>
      </div>
    );
  }

  const results = session?.results || (singleResult ? [singleResult] : []);
  const summary = session?.summary || null;

  const handleExport = () => {
    const data = JSON.stringify(session || singleResult, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `redteam-results-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="results-viewer">
      <div className="results-toolbar">
        <h2>Results</h2>
        <button onClick={handleExport} className="export-btn">⬇ Export JSON</button>
      </div>

      {summary && <SummaryCard summary={summary} />}

      <div className="results-list">
        {results.map((result, i) => (
          <ResultRow key={result.id || i} result={result} index={i} />
        ))}
      </div>
    </div>
  );
}
