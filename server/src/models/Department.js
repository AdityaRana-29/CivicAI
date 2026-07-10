const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    issueTypes: [{ type: String }],
    jurisdictionBounds: {
      type: { type: String, enum: ['Polygon'], default: 'Polygon' },
      coordinates: [[[ Number ]]], // GeoJSON polygon
    },
  },
  { timestamps: true }
);

const Department = mongoose.model('Department', departmentSchema);
module.exports = Department;
