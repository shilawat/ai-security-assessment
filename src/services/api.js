const BASE_URL = 'http://localhost:3001/api';

async function request(method, path, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Strategies
  getStrategies: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return request('GET', `/attack/strategies${params ? '?' + params : ''}`);
  },

  // Single attack
  runSingleAttack: (payload) => request('POST', '/attack/single', payload),

  // Full session
  runSession: (payload) => request('POST', '/attack/session', payload),

  // Escalation
  runEscalation: (payload) => request('POST', '/attack/escalation', payload),

  // Judge
  evaluate: (payload) => request('POST', '/judge/evaluate', payload),

  // Session logs
  getLogs: () => request('GET', '/session/logs'),
  getLog: (filename) => request('GET', `/session/logs/${filename}`),

  // Health
  health: () => request('GET', '/health')
};
