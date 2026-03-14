const axios = require('axios');
const OpenAI = require('openai');

// ─── Provider query functions ─────────────────────────────────────────────────

async function querySarvam(prompt, systemPrompt, history, model) {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) throw new Error('SARVAM_API_KEY is not set.');
  const baseUrl = process.env.SARVAM_BASE_URL || 'https://api.sarvam.ai';
  const messages = [...(history || []), { role: 'user', content: prompt }];
  const body = { model, messages, max_tokens: 1024, temperature: 0.7 };
  if (systemPrompt) body.system = systemPrompt;
  const res = await axios.post(`${baseUrl}/chat/completions`, body, {
    headers: { 'api-subscription-key': apiKey, 'Content-Type': 'application/json' },
    timeout: 30000
  });
  const choice = res.data.choices?.[0];
  return { response: choice?.message?.content || '', usage: res.data.usage || {}, model: res.data.model || model };
}

async function queryOpenAI(prompt, systemPrompt, history, model) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set.');
  const openai = new OpenAI({ apiKey });
  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push(...(history || []), { role: 'user', content: prompt });
  const res = await openai.chat.completions.create({ model, messages, max_tokens: 1024, temperature: 0.7 });
  return { response: res.choices[0].message.content || '', usage: res.usage || {}, model: res.model };
}

async function queryCustom(prompt, systemPrompt, history, opts = {}) {
  const { baseUrl, apiKey, model = 'default', authHeader = 'Authorization', authPrefix = 'Bearer' } = opts;
  if (!baseUrl) throw new Error('Custom target requires baseUrl.');
  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push(...(history || []), { role: 'user', content: prompt });
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers[authHeader] = `${authPrefix} ${apiKey}`.trim();
  const res = await axios.post(`${baseUrl}/chat/completions`,
    { model, messages, max_tokens: 1024, temperature: 0.7 },
    { headers, timeout: 30000 }
  );
  const choice = res.data.choices?.[0];
  return { response: choice?.message?.content || '', usage: res.data.usage || {}, model: res.data.model || model };
}

// ─── Target definitions ───────────────────────────────────────────────────────

const TARGETS = [
  {
    id: 'sarvam-m',
    name: 'Sarvam AI',
    model: 'sarvam-m',
    provider: 'Sarvam',
    description: 'Multilingual model optimised for Indian languages',
    requiresKey: 'SARVAM_API_KEY',
    query: (p, s, h) => querySarvam(p, s, h, 'sarvam-m')
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    model: 'gpt-4o',
    provider: 'OpenAI',
    description: 'OpenAI flagship multimodal model',
    requiresKey: 'OPENAI_API_KEY',
    query: (p, s, h) => queryOpenAI(p, s, h, 'gpt-4o')
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    model: 'gpt-4o-mini',
    provider: 'OpenAI',
    description: 'Faster, cheaper GPT-4o variant',
    requiresKey: 'OPENAI_API_KEY',
    query: (p, s, h) => queryOpenAI(p, s, h, 'gpt-4o-mini')
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    model: 'gpt-3.5-turbo',
    provider: 'OpenAI',
    description: 'Legacy OpenAI chat model',
    requiresKey: 'OPENAI_API_KEY',
    query: (p, s, h) => queryOpenAI(p, s, h, 'gpt-3.5-turbo')
  },
  {
    id: 'custom',
    name: 'Custom Endpoint',
    model: null,
    provider: 'Custom',
    description: 'Any OpenAI-compatible API',
    requiresKey: null,
    query: (p, s, h, opts) => queryCustom(p, s, h, opts)
  }
];

function getTargets() {
  return TARGETS.map(t => ({
    id: t.id,
    name: t.name,
    provider: t.provider,
    description: t.description,
    configured: t.requiresKey ? !!process.env[t.requiresKey] : true
  }));
}

function getTargetQuery(targetId, customOptions = {}) {
  const target = TARGETS.find(t => t.id === targetId);
  if (!target) throw new Error(`Unknown target: "${targetId}"`);
  return (prompt, systemPrompt, history) => target.query(prompt, systemPrompt, history, customOptions);
}

module.exports = { getTargets, getTargetQuery };
