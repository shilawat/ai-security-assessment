const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.join(__dirname, '../logs');

/**
 * GET /api/session/logs
 * Lists all session log files.
 */
router.get('/logs', (req, res) => {
  if (!fs.existsSync(LOGS_DIR)) return res.json({ files: [] });
  const files = fs.readdirSync(LOGS_DIR).filter(f => f.endsWith('.jsonl'));
  res.json({ files });
});

/**
 * GET /api/session/logs/:filename
 * Returns parsed entries from a log file.
 */
router.get('/logs/:filename', (req, res) => {
  const filePath = path.join(LOGS_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Log file not found.' });

  const lines = fs.readFileSync(filePath, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(line => {
      try { return JSON.parse(line); } catch { return null; }
    })
    .filter(Boolean);

  res.json({ entries: lines, count: lines.length });
});

module.exports = router;
