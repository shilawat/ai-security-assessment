const express = require('express');
const router = express.Router();

/**
 * POST /api/auth/validate
 * Body: { key: string }
 * Returns { valid: true, customer: string } or 401.
 */
router.post('/validate', (req, res) => {
  const { key } = req.body;
  let store;
  try {
    store = JSON.parse(process.env.ACCESS_KEYS || '{}');
  } catch {
    return res.status(500).json({ error: 'Server key store misconfigured.' });
  }
  const entry = key && store[key];
  if (!entry?.active) {
    return res.status(401).json({ error: 'Invalid access key.' });
  }
  res.json({ valid: true, customer: entry.customer });
});

module.exports = router;
