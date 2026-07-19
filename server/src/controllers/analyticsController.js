const Report = require('../models/Report');
const { Parser } = require('@json2csv/plainjs');

// GET /api/analytics/summary
const getSummary = async (req, res) => {
  const { startDate, endDate } = req.query;
  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  const matchStage = {};
  if (Object.keys(dateFilter).length) matchStage.createdAt = dateFilter;

  const data = await Report.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { issueType: '$issueType', severityLevel: '$severityLevel' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.issueType': 1, '_id.severityLevel': 1 } },
  ]);

  res.json({ success: true, data });
};

// GET /api/analytics/performance
const getPerformance = async (req, res) => {
  const { startDate, endDate } = req.query;
  const matchStage = { status: 'resolved' };
  if (startDate || endDate) {
    matchStage.resolvedAt = {};
    if (startDate) matchStage.resolvedAt.$gte = new Date(startDate);
    if (endDate) matchStage.resolvedAt.$lte = new Date(endDate);
  }

  const data = await Report.aggregate([
    { $match: matchStage },
    {
      $project: {
        department: 1,
        resolutionTimeMs: { $subtract: ['$resolvedAt', '$createdAt'] },
      },
    },
    {
      $group: {
        _id: '$department',
        avgResolutionMs: { $avg: '$resolutionTimeMs' },
        count: { $sum: 1 },
      },
    },
    {
      $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' },
    },
    { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        departmentName: { $ifNull: ['$dept.name', 'General'] },
        avgResolutionHours: { $divide: ['$avgResolutionMs', 3600000] },
        count: 1,
      },
    },
  ]);

  res.json({ success: true, data });
};

// GET /api/analytics/trends
const getTrends = async (req, res) => {
  const { startDate, endDate } = req.query;
  const matchStage = {};
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  const data = await Report.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          issueType: '$issueType',
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.date': 1 } },
  ]);

  res.json({ success: true, data });
};

// GET /api/analytics/export (CSV)
const exportCSV = async (req, res) => {
  const { startDate, endDate, issueType, severityLevel, department } = req.query;
  const filter = {};
  if (issueType) filter.issueType = issueType;
  if (severityLevel) filter.severityLevel = severityLevel;
  if (department) filter.department = department;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const reports = await Report.find(filter)
    .populate('submittedBy', 'name email')
    .populate('department', 'name')
    .lean();

  const rows = reports.map((r) => ({
    id: r._id.toString(),
    issueType: r.issueType,
    severityLevel: r.severityLevel,
    status: r.status,
    latitude: r.location?.coordinates?.[1],
    longitude: r.location?.coordinates?.[0],
    address: r.address,
    aiSummary: r.aiSummary,
    isDuplicate: r.isDuplicate,
    duplicateCount: r.duplicateCount,
    department: r.department?.name || '',
    submittedBy: r.submittedBy?.name || '',
    submittedByEmail: r.submittedBy?.email || '',
    submittedAt: r.createdAt?.toISOString(),
    resolvedAt: r.resolvedAt?.toISOString() || '',
    resolutionNotes: r.resolutionNotes,
  }));

  try {
    const parser = new Parser();
    const csv = parser.parse(rows);
    res.header('Content-Type', 'text/csv');
    res.attachment(`civicai_reports_${Date.now()}.csv`);
    res.send(csv);
  } catch (e) {
    res.status(500).json({ success: false, error: { code: 'CSV_ERROR', message: 'Failed to generate CSV' } });
  }
};

module.exports = { getSummary, getPerformance, getTrends, exportCSV };
