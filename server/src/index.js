require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cron = require('node-cron');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const heatmapRoutes = require('./routes/heatmapRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const { runPredictions } = require('./services/predictionEngine');

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// Connect to MongoDB
connectDB();

// ── Security & Parsing ──────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: isProd ? undefined : false, // relax CSP in dev
  crossOriginEmbedderPolicy: false,
}));

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:4173', // Vite preview
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || !isProd) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/reports',       reportRoutes);
app.use('/api/heatmap',       heatmapRoutes);
app.use('/api/predictions',   predictionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics',     analyticsRoutes);

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CivicAI API is running',
    env: process.env.NODE_ENV,
    time: new Date().toISOString(),
  });
});

// ── Serve React frontend in production ────────────────────────────────────────
if (isProd) {
  const clientBuild = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientBuild));
  // All non-API routes → React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuild, 'index.html'));
  });
}

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Cron: Prediction Engine — daily at 02:00 ─────────────────────────────────
cron.schedule('0 2 * * *', async () => {
  console.log('[CRON] Prediction engine running…', new Date().toISOString());
  try { await runPredictions(); }
  catch (e) { console.error('[CRON] Prediction engine error:', e.message); }
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ CivicAI Server running on http://localhost:${PORT} [${process.env.NODE_ENV}]`);
});
