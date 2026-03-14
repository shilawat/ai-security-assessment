const axios = require('axios');
const OpenAI = require('openai');

// ─── Generic OpenAI-compatible query ─────────────────────────────────────────

async function queryOpenAICompat(prompt, systemPrompt, history, { apiKey, baseURL, model, authHeader, authPrefix }) {
  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push(...(history || []), { role: 'user', content: prompt });

  // Use the OpenAI SDK for native OpenAI, axios for everything else
  if (!authHeader) {
    const client = new OpenAI({ apiKey, baseURL });
    const res = await client.chat.completions.create({ model, messages, max_tokens: 1024, temperature: 0.7 });
    return { response: res.choices[0].message.content || '', usage: res.usage || {}, model: res.model };
  }

  // Custom auth header (Anthropic, Sarvam, etc.)
  const headers = { 'Content-Type': 'application/json' };
  headers[authHeader] = authPrefix ? `${authPrefix} ${apiKey}`.trim() : apiKey;
  const res = await axios.post(`${baseURL}/chat/completions`,
    { model, messages, max_tokens: 1024, temperature: 0.7 },
    { headers, timeout: 30000 }
  );
  const choice = res.data.choices?.[0];
  return { response: choice?.message?.content || '', usage: res.data.usage || {}, model: res.data.model || model };
}

// Special handler for Sarvam (uses api-subscription-key header)
async function querySarvam(prompt, systemPrompt, history, model) {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) throw new Error('SARVAM_API_KEY is not set.');
  const baseUrl = process.env.SARVAM_BASE_URL || 'https://api.sarvam.ai';
  const messages = [...(history || []), { role: 'user', content: prompt }];
  const body = { model, messages, max_tokens: 1024, temperature: 0.7 };
  const res = await axios.post(`${baseUrl}/chat/completions`, body, {
    headers: { 'api-subscription-key': apiKey, 'Content-Type': 'application/json' },
    timeout: 30000
  });
  const choice = res.data.choices?.[0];
  return { response: choice?.message?.content || '', usage: res.data.usage || {}, model: res.data.model || model };
}

// ─── Target definitions ───────────────────────────────────────────────────────

const TARGETS = [
  // Sarvam AI
  { id: 'sarvam-m', provider: 'Sarvam AI', name: 'Sarvam-M', description: 'Multilingual model for Indian languages', requiresKey: 'SARVAM_API_KEY',
    query: (p, s, h) => querySarvam(p, s, h, 'sarvam-m') },

  // OpenAI
  { id: 'gpt-4o',        provider: 'OpenAI', name: 'GPT-4o',        description: 'Flagship multimodal model',   requiresKey: 'OPENAI_API_KEY',
    query: (p, s, h) => queryOpenAICompat(p, s, h, { apiKey: process.env.OPENAI_API_KEY, baseURL: 'https://api.openai.com/v1', model: 'gpt-4o' }) },
  { id: 'gpt-4o-mini',   provider: 'OpenAI', name: 'GPT-4o Mini',   description: 'Faster, cheaper GPT-4o',      requiresKey: 'OPENAI_API_KEY',
    query: (p, s, h) => queryOpenAICompat(p, s, h, { apiKey: process.env.OPENAI_API_KEY, baseURL: 'https://api.openai.com/v1', model: 'gpt-4o-mini' }) },
  { id: 'gpt-4-turbo',   provider: 'OpenAI', name: 'GPT-4 Turbo',   description: 'Previous flagship model',     requiresKey: 'OPENAI_API_KEY',
    query: (p, s, h) => queryOpenAICompat(p, s, h, { apiKey: process.env.OPENAI_API_KEY, baseURL: 'https://api.openai.com/v1', model: 'gpt-4-turbo' }) },
  { id: 'gpt-3.5-turbo', provider: 'OpenAI', name: 'GPT-3.5 Turbo', description: 'Legacy chat model',           requiresKey: 'OPENAI_API_KEY',
    query: (p, s, h) => queryOpenAICompat(p, s, h, { apiKey: process.env.OPENAI_API_KEY, baseURL: 'https://api.openai.com/v1', model: 'gpt-3.5-turbo' }) },
  { id: 'o1-mini',       provider: 'OpenAI', name: 'o1 Mini',       description: 'Compact reasoning model',     requiresKey: 'OPENAI_API_KEY',
    query: (p, s, h) => queryOpenAICompat(p, s, h, { apiKey: process.env.OPENAI_API_KEY, baseURL: 'https://api.openai.com/v1', model: 'o1-mini' }) },
  { id: 'o3-mini',       provider: 'OpenAI', name: 'o3 Mini',       description: 'Latest reasoning model',      requiresKey: 'OPENAI_API_KEY',
    query: (p, s, h) => queryOpenAICompat(p, s, h, { apiKey: process.env.OPENAI_API_KEY, baseURL: 'https://api.openai.com/v1', model: 'o3-mini' }) },

  // Anthropic (OpenAI-compatible endpoint)
  { id: 'claude-opus-4-6',    provider: 'Anthropic', name: 'Claude Opus 4.6',    description: 'Most capable Claude model',  requiresKey: 'ANTHROPIC_API_KEY',
    query: (p, s, h) => queryOpenAICompat(p, s, h, { apiKey: process.env.ANTHROPIC_API_KEY, baseURL: 'https://api.anthropic.com/v1', model: 'claude-opus-4-6', authHeader: 'x-api-key', authPrefix: '' }) },
  { id: 'claude-sonnet-4-6',  provider: 'Anthropic', name: 'Claude Sonnet 4.6',  description: 'Balanced Claude model',      requiresKey: 'ANTHROPIC_API_KEY',
    query: (p, s, h) => queryOpenAICompat(p, s, h, { apiKey: process.env.ANTHROPIC_API_KEY, baseURL: 'https://api.anthropic.com/v1', model: 'claude-sonnet-4-6', authHeader: 'x-api-key', authPrefix: '' }) },
  { id: 'claude-haiku-4-5',   provider: 'Anthropic', name: 'Claude Haiku 4.5',   description: 'Fast, affordable Claude',    requiresKey: 'ANTHROPIC_API_KEY',
    query: (p, s, h) => queryOpenAICompat(p, s, h, { apiKey: process.env.ANTHROPIC_API_KEY, baseURL: 'https://api.anthropic.com/v1', model: 'claude-haiku-4-5-20251001', authHeader: 'x-api-key', authPrefix: '' }) },

  // Google Gemini (via OpenAI-compatible endpoint)
  { id: 'gemini-2.0-flash',   provider: 'Google', name: 'Gemini 2.0 Flash',   description: 'Fast multimodal model',      requiresKey: 'GOOGLE_API_KEY',
    query: (p, s, h) => queryOpenAICompat(p, s, h, { apiKey: process.env.GOOGLE_API_KEY, baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-2.0-flash' }) },
  { id: 'gemini-1.5-pro',     provider: 'Google', name: 'Gemini 1.5 Pro',     description: 'Long context model',         requiresKey: 'GOOGLE_API_KEY',
    query: (p, s, h) => queryOpenAICompat(p, s, h, { apiKey: process.env.GOOGLE_API_KEY, baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-1.5-pro' }) },

  // Groq (fast open-source models)
  { id: 'llama-3.3-70b',      provider: 'Groq', name: 'Llama 3.3 70B',      description: 'Meta\'s Llama 3.3 via Groq', requiresKey: 'GROQ_API_KEY',
    query: (p, s, h) => queryOpenAICompat(p, s, h, { apiKey: process.env.GROQ_API_KEY, baseURL: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile' }) },
  { id: 'mixtral-8x7b',       provider: 'Groq', name: 'Mixtral 8x7B',       description: 'Mistral MoE via Groq',       requiresKey: 'GROQ_API_KEY',
    query: (p, s, h) => queryOpenAICompat(p, s, h, { apiKey: process.env.GROQ_API_KEY, baseURL: 'https://api.groq.com/openai/v1', model: 'mixtral-8x7b-32768' }) },
  { id: 'gemma2-9b',          provider: 'Groq', name: 'Gemma 2 9B',          description: 'Google\'s Gemma 2 via Groq', requiresKey: 'GROQ_API_KEY',
    query: (p, s, h) => queryOpenAICompat(p, s, h, { apiKey: process.env.GROQ_API_KEY, baseURL: 'https://api.groq.com/openai/v1', model: 'gemma2-9b-it' }) },

  // Custom
  { id: 'custom', provider: 'Custom', name: 'Custom Endpoint', description: 'Any OpenAI-compatible API', requiresKey: null,
    query: (p, s, h, opts = {}) => queryOpenAICompat(p, s, h, { apiKey: opts.apiKey, baseURL: opts.baseUrl, model: opts.model || 'default', authHeader: opts.authHeader, authPrefix: opts.authPrefix }) }
];

function getTargets() {
  return TARGETS.map(t => ({
    id: t.id, name: t.name, provider: t.provider, description: t.description,
    configured: t.requiresKey ? !!process.env[t.requiresKey] : true
  }));
}

function getTargetQuery(targetId, customOptions = {}) {
  const target = TARGETS.find(t => t.id === targetId);
  if (!target) throw new Error(`Unknown target: "${targetId}"`);
  return (prompt, systemPrompt, history) => target.query(prompt, systemPrompt, history, customOptions);
}

module.exports = { getTargets, getTargetQuery };
