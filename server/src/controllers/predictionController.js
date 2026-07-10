const Prediction = require('../models/Prediction');
const { runPredictions } = require('../services/predictionEngine');

// GET /api/predictions
const getPredictions = async (req, res) => {
  const predictions = await Prediction.find().sort({ riskRating: -1 });
  res.json({ success: true, data: predictions });
};

// POST /api/predictions/run (admin — manual trigger)
const triggerPredictions = async (req, res) => {
  await runPredictions();
  const predictions = await Prediction.find();
  res.json({ success: true, message: 'Prediction engine ran successfully', count: predictions.length });
};

module.exports = { getPredictions, triggerPredictions };
