require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { startSimulator } = require('./src/services/dataSimulator');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',   require('./src/routes/auth'));
app.use('/api/tanks',  require('./src/routes/tanks'));
app.use('/api/alerts', require('./src/routes/alerts'));

// Health check (no auth required)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 API Server  →  http://localhost:${PORT}`);
  console.log(`   Health check →  http://localhost:${PORT}/api/health\n`);
  startSimulator(5000);
});
