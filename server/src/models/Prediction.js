const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema(
  {
    centroid: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number], // [longitude, latitude]
    },
    dominantIssueType: { type: String, required: true },
    recurrenceCount: { type: Number, required: true },
    riskRating: { type: String, enum: ['medium', 'high'], required: true },
    windowStart: { type: Date, required: true },
    windowEnd: { type: Date, required: true },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

predictionSchema.index({ centroid: '2dsphere' });

const Prediction = mongoose.model('Prediction', predictionSchema);
module.exports = Prediction;
