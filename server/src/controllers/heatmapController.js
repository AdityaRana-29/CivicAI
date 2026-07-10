const Report = require('../models/Report');

// GET /api/heatmap/data
const getHeatmapData = async (req, res) => {
  const { issueType, severityLevel, startDate, endDate, department } = req.query;

  const filter = { status: { $nin: ['closed'] }, isDuplicate: false };
  if (issueType) filter.issueType = issueType;
  if (severityLevel) filter.severityLevel = severityLevel;
  if (department) filter.department = department;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const reports = await Report.find(filter).select('location severityLevel');

  const weightMap = { low: 0.2, medium: 0.5, high: 0.8, critical: 1.0 };
  const data = reports.map((r) => {
    const [lon, lat] = r.location.coordinates;
    const weight = weightMap[r.severityLevel] || 0.5;
    return [lat, lon, weight];
  });

  res.json({ success: true, data });
};

module.exports = { getHeatmapData };
