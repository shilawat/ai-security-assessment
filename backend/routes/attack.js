const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const { getStrategies, getStrategyById, getCategories } = require('../services/attackStrategies');
const { generateAttackPrompt, runPAIRLoop } = require('../services/attackEngine');
const { queryTarget, queryTargetText } = require('../services/targetClient');
const { judgeResponse, generateSessionSummary } = require('../services/evaluator');

const LOGS_DIR = path.join(__dirname, '../logs');
if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });

/**
 * GET /api/attack/strategies
 * Returns the full attack strategy library.
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
 * Runs a single attack (one strategy, one target query, one judgment).
 *
 * Body:
 *   { strategyId, goal, refine?, systemPrompt? }
 */
router.post('/single', async (req, res) => {
  const { strategyId, goal, refine = false, systemPrompt = null } = req.body;

  if (!strategyId || !goal) {
    return res.status(400).json({ error: 'strategyId and goal are required.' });
  }

  const strategy = getStrategyById(strategyId);
  if (!strategy) {
    return res.status(404).json({ error: `Strategy "${strategyId}" not found.` });
  }

  try {
    // 1. Generate attack prompt
    const { prompt, reasoning } = await generateAttackPrompt(strategy, goal, refine);

    // 2. Query target
    const targetResult = await queryTarget(prompt, undefined, systemPrompt);

    // 3. Judge
    const judgment = await judgeResponse(goal, targetResult.response, prompt);

    const result = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      strategy: { id: strategy.id, name: strategy.name, category: strategy.category, severity: strategy.severity },
      goal,
      attackPrompt: prompt,
      attackReasoning: reasoning,
      targetResponse: targetResult.response,
      usage: targetResult.usage,
      judgment
    };

    // Log to file
    appendToLog('single', result);

    res.json(result);
  } catch (err) {
    console.error('Single attack error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/attack/session
 * Runs a full red team session: multiple strategies against a goal.
 *
 * Body:
 *   { goal, strategyIds?, categories?, usePAIR?, maxIterations?, systemPrompt? }
 */
router.post('/session', async (req, res) => {
  const {
    goal,
    strategyIds,
    categories,
    usePAIR = false,
    maxIterations = 3,
    systemPrompt = null
  } = req.body;

  if (!goal) return res.status(400).json({ error: 'goal is required.' });

  // Determine which strategies to run
  let strategies;
  if (strategyIds && strategyIds.length > 0) {
    strategies = strategyIds.map(id => getStrategyById(id)).filter(Boolean);
  } else if (categories && categories.length > 0) {
    strategies = getStrategies({ category: categories[0] });
  } else {
    strategies = getStrategies();
  }

  const sessionId = uuidv4();
  const results = [];

  for (const strategy of strategies) {
    try {
      if (usePAIR) {
        // PAIR iterative loop
        const iterations = await runPAIRLoop({
          strategy,
          goal,
          queryTarget: (p) => queryTargetText(p),
          judgeResponse: (g, r) => judgeResponse(g, r),
          maxIterations
        });

        const bestIteration = iterations.reduce((best, cur) =>
          cur.judgment.score > best.judgment.score ? cur : best, iterations[0]);

        results.push({
          id: uuidv4(),
          sessionId,
          strategy: { id: strategy.id, name: strategy.name, category: strategy.category, severity: strategy.severity },
          goal,
          mode: 'PAIR',
          iterations,
          bestResult: bestIteration,
          judgment: bestIteration.judgment
        });
      } else {
        // Single-pass attack
        const { prompt, reasoning } = await generateAttackPrompt(strategy, goal, false);
        const targetResult = await queryTarget(prompt, undefined, systemPrompt);
        const judgment = await judgeResponse(goal, targetResult.response, prompt);

        results.push({
          id: uuidv4(),
          sessionId,
          strategy: { id: strategy.id, name: strategy.name, category: strategy.category, severity: strategy.severity },
          goal,
          mode: 'SINGLE',
          attackPrompt: prompt,
          attackReasoning: reasoning,
          targetResponse: targetResult.response,
          usage: targetResult.usage,
          judgment
        });
      }
    } catch (err) {
      results.push({
        id: uuidv4(),
        sessionId,
        strategy: { id: strategy.id, name: strategy.name, category: strategy.category },
        goal,
        error: err.message,
        judgment: { score: 0, label: 'ERROR', reason: err.message, categories: [] }
      });
    }
  }

  const summary = await generateSessionSummary(results);
  const session = { sessionId, goal, timestamp: new Date().toISOString(), summary, results };

  appendToLog('session', session);

  res.json(session);
});

/**
 * POST /api/attack/escalation
 * Runs a multi-turn crescendo escalation attack.
 *
 * Body:
 *   { turns: [{ role, content }], goal }
 */
router.post('/escalation', async (req, res) => {
  const { turns, goal } = req.body;

  if (!turns || !Array.isArray(turns) || turns.length === 0) {
    return res.status(400).json({ error: 'turns array is required.' });
  }

  try {
    const history = [];
    const results = [];

    for (const turn of turns) {
      // Send each turn to the target accumulating conversation history
      const targetResult = await queryTarget(turn.content, undefined, null, history);
      const judgment = await judgeResponse(goal, targetResult.response, turn.content);

      history.push({ role: 'user', content: turn.content });
      history.push({ role: 'assistant', content: targetResult.response });

      results.push({
        turnLabel: turn.label || `Turn ${results.length + 1}`,
        prompt: turn.content,
        response: targetResult.response,
        judgment
      });
    }

    const finalJudgment = results[results.length - 1].judgment;
    const session = {
      id: uuidv4(),
      type: 'escalation',
      goal,
      timestamp: new Date().toISOString(),
      turns: results,
      finalJudgment
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
