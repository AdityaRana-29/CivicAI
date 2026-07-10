const Report = require('../models/Report');

const DUPLICATE_THRESHOLD = parseFloat(process.env.DUPLICATE_THRESHOLD) || 0.85;
const DUPLICATE_RADIUS = parseInt(process.env.DUPLICATE_RADIUS_METERS) || 100;

/**
 * Cosine similarity between two vectors
 */
const cosineSimilarity = (a, b) => {
  if (!a.length || !b.length || a.length !== b.length) return 0;
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
};

/**
 * Check if a new report is a duplicate
 * @param {object} newReport - the newly created report document
 * @returns {Promise<string|null>} - original report _id if duplicate, else null
 */
const detectDuplicate = async (newReport) => {
  if (!newReport.photoEmbedding || newReport.photoEmbedding.length === 0) return null;

  const [longitude, latitude] = newReport.location.coordinates;

  // Find nearby open reports
  const candidates = await Report.find({
    _id: { $ne: newReport._id },
    isDuplicate: false,
    status: { $nin: ['resolved', 'closed'] },
    location: {
      $nearSphere: {
        $geometry: { type: 'Point', coordinates: [longitude, latitude] },
        $maxDistance: DUPLICATE_RADIUS,
      },
    },
  }).limit(20);

  for (const candidate of candidates) {
    if (!candidate.photoEmbedding || candidate.photoEmbedding.length === 0) continue;
    const similarity = cosineSimilarity(newReport.photoEmbedding, candidate.photoEmbedding);
    if (similarity >= DUPLICATE_THRESHOLD) {
      return candidate._id.toString();
    }
  }

  return null;
};

module.exports = { detectDuplicate };
