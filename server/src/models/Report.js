const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    photoUrl: { type: String, required: true },
    photoPublicId: { type: String }, // Cloudinary public_id for deletion
    photoEmbedding: [{ type: Number }], // vector for duplicate detection

    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    address: { type: String, default: '' },

    issueType: {
      type: String,
      enum: ['pothole', 'broken_streetlight', 'overflowing_garbage',
        'fallen_tree', 'water_leakage', 'damaged_road', 'other'],
      default: 'other',
    },
    classificationConfidence: { type: Number, default: 0 },
    pendingConfirmation: { type: Boolean, default: false },

    severityLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
    },

    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    needsManualReview: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ['submitted', 'under_review', 'in_progress', 'resolved', 'closed'],
      default: 'submitted',
    },
    statusHistory: [statusHistorySchema],

    aiSummary: { type: String, default: '' },

    isDuplicate: { type: Boolean, default: false },
    duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', default: null },
    duplicateCount: { type: Number, default: 0 },

    resolvedAt: { type: Date, default: null },
    resolutionNotes: { type: String, default: '' },

    lowPriority: { type: Boolean, default: false }, // set when reputationScore < 10
  },
  { timestamps: true }
);

// 2dsphere index for geo queries
reportSchema.index({ location: '2dsphere' });
reportSchema.index({ submittedBy: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ department: 1 });
reportSchema.index({ severityLevel: 1 });

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
