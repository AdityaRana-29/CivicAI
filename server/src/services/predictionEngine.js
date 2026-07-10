const Report = require('../models/Report');
const Prediction = require('../models/Prediction');

const MIN_CLUSTER_SIZE = parseInt(process.env.PREDICTION_MIN_CLUSTER_SIZE) || 5;
const CLUSTER_RADIUS_METERS = 500;

/**
 * Run the prediction engine — clusters recent reports and writes Prediction documents
 */
const runPredictions = async () => {
  console.log('[PredictionEngine] Running...');
  const windowEnd = new Date();
  const windowStart = new Date(windowEnd - 90 * 24 * 60 * 60 * 1000); // 90 days ago

  const issueTypes = [
    'pothole', 'broken_streetlight', 'overflowing_garbage',
    'fallen_tree', 'water_leakage', 'damaged_road', 'other',
  ];

  const newPredictions = [];

  for (const issueType of issueTypes) {
    const reports = await Report.find({
      issueType,
      createdAt: { $gte: windowStart, $lte: windowEnd },
      isDuplicate: false,
    }).select('location createdAt');

    if (reports.length < MIN_CLUSTER_SIZE) continue;

    // Simple clustering: bucket by 0.005 degree grid (~500m)
    const buckets = {};
    for (const report of reports) {
      const [lon, lat] = report.location.coordinates;
      const key = `${Math.round(lat / 0.005) * 0.005},${Math.round(lon / 0.005) * 0.005}`;
      if (!buckets[key]) buckets[key] = { count: 0, lats: [], lons: [] };
      buckets[key].count++;
      buckets[key].lats.push(lat);
      buckets[key].lons.push(lon);
    }

    for (const [, bucket] of Object.entries(buckets)) {
      if (bucket.count < MIN_CLUSTER_SIZE) continue;

      const centroidLat = bucket.lats.reduce((a, b) => a + b, 0) / bucket.lats.length;
      const centroidLon = bucket.lons.reduce((a, b) => a + b, 0) / bucket.lons.length;
      const riskRating = bucket.count >= MIN_CLUSTER_SIZE * 2 ? 'high' : 'medium';

      newPredictions.push({
        centroid: { type: 'Point', coordinates: [centroidLon, centroidLat] },
        dominantIssueType: issueType,
        recurrenceCount: bucket.count,
        riskRating,
        windowStart,
        windowEnd,
        generatedAt: new Date(),
      });
    }
  }

  // Replace all previous predictions
  await Prediction.deleteMany({});
  if (newPredictions.length > 0) {
    await Prediction.insertMany(newPredictions);
  }

  console.log(`[PredictionEngine] Generated ${newPredictions.length} prediction clusters.`);
};

module.exports = { runPredictions };
