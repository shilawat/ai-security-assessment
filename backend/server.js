require('dotenv').config();
const express = require('express');
const cors = require('cors');

const attackRoutes = require('./routes/attack');
const judgeRoutes = require('./routes/judge');
const sessionRoutes = require('./routes/session');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Routes
app.use('/api/attack', attackRoutes);
app.use('/api/judge', judgeRoutes);
app.use('/api/session', sessionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Red Team Backend running on http://localhost:${PORT}`);
});
