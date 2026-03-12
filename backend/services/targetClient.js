const axios = require('axios');

/**
 * Sarvam AI Target Client
 *
 * Sarvam AI exposes an OpenAI-compatible Chat Completions endpoint.
 * Docs: https://docs.sarvam.ai
 */

const SARVAM_BASE_URL = process.env.SARVAM_BASE_URL || 'https://api.sarvam.ai';
const SARVAM_API_KEY = process.env.SARVAM_API_KEY;

// Available Sarvam models
const SARVAM_MODELS = {
  SAARIKA: 'sarvam-m',   // Sarvam's general-purpose model
};

/**
 * Sends a prompt to the Sarvam AI target model and returns the text response.
 *
 * @param {string} prompt              - The adversarial prompt to send
 * @param {string} [model]             - Model ID (default: sarvam-m)
 * @param {string} [systemPrompt]      - Optional system prompt for the target
 * @param {Array}  [conversationHistory] - Prior turns for multi-turn attacks
 * @returns {Promise<{ response: string, usage: Object, model: string }>}
 */
async function queryTarget(prompt, model = SARVAM_MODELS.SAARIKA, systemPrompt = null, conversationHistory = []) {
  if (!SARVAM_API_KEY) {
    throw new Error('SARVAM_API_KEY is not set in environment variables.');
  }

  const messages = [];

  // Add prior conversation turns (for multi-turn/escalation attacks)
  if (conversationHistory.length > 0) {
    messages.push(...conversationHistory);
  }

  // Add the adversarial user message
  messages.push({ role: 'user', content: prompt });

  const requestBody = {
    model,
    messages,
    max_tokens: 1024,
    temperature: 0.7
  };

  // Add system prompt if provided
  if (systemPrompt) {
    requestBody.system = systemPrompt;
  }

  try {
    const response = await axios.post(
      `${SARVAM_BASE_URL}/chat/completions`,
      requestBody,
      {
        headers: {
          'api-subscription-key': SARVAM_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const choice = response.data.choices?.[0];
    const text = choice?.message?.content || '';
    const usage = response.data.usage || {};

    return {
      response: text,
      usage,
      model: response.data.model || model,
      finishReason: choice?.finish_reason || 'unknown'
    };
  } catch (err) {
    if (err.response) {
      const { status, data } = err.response;
      throw new Error(`Sarvam API error ${status}: ${JSON.stringify(data)}`);
    }
    throw err;
  }
}

/**
 * Convenience wrapper that returns just the response text.
 * Used by the attack engine as the queryTarget callback.
 *
 * @param {string} prompt
 * @param {Array}  [history]
 * @returns {Promise<string>}
 */
async function queryTargetText(prompt, history = []) {
  const result = await queryTarget(prompt, SARVAM_MODELS.SAARIKA, null, history);
  return result.response;
}

/**
 * Validates that the Sarvam API key is working by sending a trivial request.
 * @returns {Promise<boolean>}
 */
async function validateConnection() {
  try {
    await queryTarget('Hello, respond with one word: OK');
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = {
  queryTarget,
  queryTargetText,
  validateConnection,
  SARVAM_MODELS
};
