const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const { getStrategies, getStrategyById, getCategories } = require('../services/attackStrategies');
const { generateAttackPrompt, runPAIRLoop } = require('../services/attackEngine');
const { judgeResponse, generateSessionSummary } = require('../services/evaluator');
const { getTargets, getTargetQuery } = require('../services/targetRegistry');

const LOGS_DIR = path.join(__dirname, '../logs');
if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });

/**
 * GET /api/attack/targets
 * Returns all available target models with their configured status.
 */
router.get('/targets', (req, res) => {
  res.json({ targets: getTargets() });
});

/**
 * GET /api/attack/strategies
 * Returns the attack strategy library, filterable by category/severity.
 */
router.get('/strategies', (req, res) => {
  const { category, severity } = req.query;
  const filters = {};
  if (category) filters.category = category;
  if (severity) filters.severity = severity.split(',');
  res.json({ strategies: getStrategies(filters), categories: getCategories() });
});

/**
 * POST /api/attack/single
 * Runs a single attack against a chosen target.
 *
 * Body: { strategyId, goal, targetId?, refine?, systemPrompt?, customTarget? }
 */
router.post('/single', async (req, res) => {
  const {
    strategyId, goal,
    targetId = 'sarvam-m',
    refine = false,
    systemPrompt = null,
    customTarget = {},
    apiKeys = {}
  } = req.body;

  if (!strategyId || !goal) {
    return res.status(400).json({ error: 'strategyId and goal are required.' });
  }
  const strategy = getStrategyById(strategyId);
  if (!strategy) return res.status(404).json({ error: `Strategy "${strategyId}" not found.` });

  try {
    const queryFn = getTargetQuery(targetId, customTarget, apiKeys);
    const { prompt, reasoning } = await generateAttackPrompt(strategy, goal, refine);
    const targetResult = await queryFn(prompt, systemPrompt, []);
    const judgment = await judgeResponse(goal, targetResult.response, prompt);

    const result = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      target: targetId,
      strategy: { id: strategy.id, name: strategy.name, category: strategy.category, severity: strategy.severity },
      goal, attackPrompt: prompt, attackReasoning: reasoning,
      targetResponse: targetResult.response, usage: targetResult.usage, judgment
    };

    appendToLog('single', result);
    res.json(result);
  } catch (err) {
    console.error('Single attack error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/attack/session
 * Runs multiple strategies against a chosen target.
 *
 * Body: { goal, targetId?, strategyIds?, testType?, usePAIR?, maxIterations?, systemPrompt?, customTarget? }
 */
router.post('/session', async (req, res) => {
  const {
    goal,
    targetId = 'sarvam-m',
    strategyIds,
    testType,           // maps to category filter
    usePAIR = false,
    maxIterations = 3,
    systemPrompt = null,
    customTarget = {},
    apiKeys = {}
  } = req.body;

  if (!goal) return res.status(400).json({ error: 'goal is required.' });

  // Resolve strategies: explicit ids > testType category > all
  let strategies;
  if (strategyIds && strategyIds.length > 0) {
    strategies = strategyIds.map(id => getStrategyById(id)).filter(Boolean);
  } else if (testType && testType !== 'all') {
    strategies = getStrategies({ category: testType });
  } else {
    strategies = getStrategies();
  }

  const queryFn = getTargetQuery(targetId, customTarget, apiKeys);
  const sessionId = uuidv4();
  const results = [];

  for (const strategy of strategies) {
    try {
      if (usePAIR) {
        const iterations = await runPAIRLoop({
          strategy, goal,
          queryTarget: (p) => queryFn(p, systemPrompt, []).then(r => r.response),
          judgeResponse: (g, r) => judgeResponse(g, r),
          maxIterations
        });
        const best = iterations.reduce((b, c) => c.judgment.score > b.judgment.score ? c : b, iterations[0]);
        results.push({
          id: uuidv4(), sessionId, target: targetId,
          strategy: { id: strategy.id, name: strategy.name, category: strategy.category, severity: strategy.severity },
          goal, mode: 'PAIR', iterations, bestResult: best, judgment: best.judgment
        });
      } else {
        const { prompt, reasoning } = await generateAttackPrompt(strategy, goal, false);
        const targetResult = await queryFn(prompt, systemPrompt, []);
        const judgment = await judgeResponse(goal, targetResult.response, prompt);
        results.push({
          id: uuidv4(), sessionId, target: targetId,
          strategy: { id: strategy.id, name: strategy.name, category: strategy.category, severity: strategy.severity },
          goal, mode: 'SINGLE', attackPrompt: prompt, attackReasoning: reasoning,
          targetResponse: targetResult.response, usage: targetResult.usage, judgment
        });
      }
    } catch (err) {
      results.push({
        id: uuidv4(), sessionId, target: targetId,
        strategy: { id: strategy.id, name: strategy.name, category: strategy.category },
        goal, error: err.message,
        judgment: { score: 0, label: 'ERROR', reason: err.message, categories: [] }
      });
    }
  }

  const summary = await generateSessionSummary(results);
  const session = { sessionId, goal, target: targetId, testType: testType || 'all', timestamp: new Date().toISOString(), summary, results };
  appendToLog('session', session);
  res.json(session);
});

/**
 * POST /api/attack/escalation
 * Multi-turn crescendo attack against a chosen target.
 *
 * Body: { turns, goal, targetId?, customTarget? }
 */
router.post('/escalation', async (req, res) => {
  const { turns, goal, targetId = 'sarvam-m', customTarget = {}, apiKeys = {} } = req.body;
  if (!turns || !Array.isArray(turns) || turns.length === 0) {
    return res.status(400).json({ error: 'turns array is required.' });
  }

  try {
    const queryFn = getTargetQuery(targetId, customTarget, apiKeys);
    const history = [];
    const results = [];

    for (const turn of turns) {
      const targetResult = await queryFn(turn.content, null, history);
      const judgment = await judgeResponse(goal, targetResult.response, turn.content);
      history.push({ role: 'user', content: turn.content });
      history.push({ role: 'assistant', content: targetResult.response });
      results.push({
        turnLabel: turn.label || `Turn ${results.length + 1}`,
        prompt: turn.content, response: targetResult.response, judgment
      });
    }

    const session = {
      id: uuidv4(), type: 'escalation', goal, target: targetId,
      timestamp: new Date().toISOString(),
      turns: results, finalJudgment: results[results.length - 1].judgment
    };
    appendToLog('escalation', session);
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function appendToLog(type, data) {
  const logFile = path.join(LOGS_DIR, `${type}_${new Date().toISOString().split('T')[0]}.jsonl`);
  fs.appendFileSync(logFile, JSON.stringify(data) + '\n');
}

module.exports = router;
