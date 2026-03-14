const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

async function request(method, path, body = null) {
  const options = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  getTargets: () => request('GET', '/attack/targets'),
  getStrategies: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return request('GET', `/attack/strategies${params ? '?' + params : ''}`);
  },
  runSingleAttack: (payload) => request('POST', '/attack/single', payload),
  runSession: (payload) => request('POST', '/attack/session', payload),
  runEscalation: (payload) => request('POST', '/attack/escalation', payload),
  evaluate: (payload) => request('POST', '/judge/evaluate', payload),
  getLogs: () => request('GET', '/session/logs'),
  getLog: (filename) => request('GET', `/session/logs/${filename}`),
  health: () => request('GET', '/health')
};
