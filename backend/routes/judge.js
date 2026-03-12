const express = require('express');
const router = express.Router();
const { judgeResponse, generateSessionSummary } = require('../services/evaluator');

/**
 * POST /api/judge/evaluate
 * Evaluates a single (goal, response) pair.
 *
 * Body: { goal, response, attackPrompt? }
 */
router.post('/evaluate', async (req, res) => {
  const { goal, response, attackPrompt } = req.body;
  if (!goal || !response) {
    return res.status(400).json({ error: 'goal and response are required.' });
  }
  try {
    const judgment = await judgeResponse(goal, response, attackPrompt || '');
    res.json(judgment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/judge/summary
 * Generates a summary report for an array of attack results.
 *
 * Body: { results: [...] }
 */
router.post('/summary', async (req, res) => {
  const { results } = req.body;
  if (!results || !Array.isArray(results)) {
    return res.status(400).json({ error: 'results array is required.' });
  }
  try {
    const summary = await generateSessionSummary(results);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
