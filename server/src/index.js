require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cron = require('node-cron');

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

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/heatmap', heatmapRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'CivicAI API is running' });
});

// Error handler
app.use(errorHandler);

// Cron job for prediction engine — runs daily at 02:00
cron.schedule('0 2 * * *', async () => {
  console.log('[CRON] Running prediction engine at', new Date());
  await runPredictions();
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ CivicAI Server running on http://localhost:${PORT}`);
});
