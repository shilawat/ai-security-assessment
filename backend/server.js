require('dotenv').config();
const express = require('express');
const cors = require('cors');

const attackRoutes = require('./routes/attack');
const judgeRoutes = require('./routes/judge');
const sessionRoutes = require('./routes/session');
const authRoutes = require('./routes/auth');
const requireKey = require('./middleware/requireKey');

const app = express();
const PORT = process.env.PORT || 3001;

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,          // e.g. https://your-site.netlify.app
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, Postman, same-origin)
    if (!origin || ALLOWED_ORIGINS.some(o => origin.startsWith(o))) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  }
}));
app.use(express.json());

// Auth (unprotected)
app.use('/api/auth', authRoutes);

// Protected routes — require a valid access key
app.use('/api/attack', requireKey, attackRoutes);
app.use('/api/judge', requireKey, judgeRoutes);
app.use('/api/session', requireKey, sessionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Red Team Backend running on http://localhost:${PORT}`);
});
