const Report = require('../models/Report');
const User = require('../models/User');
const { uploadImage } = require('../services/imageService');
const { classifyIssue, estimateSeverity, generateSummary, generateEmbedding } = require('../services/openaiService');
const { routeDepartment } = require('../services/departmentRouter');
const { detectDuplicate } = require('../services/duplicateDetector');
const { sendInAppNotification, sendEmailNotification } = require('../services/notificationService');
const { increaseScore, decreaseScore } = require('../services/reputationEngine');

// POST /api/reports
const submitReport = async (req, res) => {
  const { latitude, longitude, description } = req.body;

  if (!req.file) {
    return res.status(400).json({ success: false, error: { code: 'MISSING_PHOTO', message: 'Photo is required' } });
  }
  if (!latitude || !longitude) {
    return res.status(400).json({ success: false, error: { code: 'MISSING_LOCATION', message: 'Location (latitude, longitude) is required' } });
  }

  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_COORDINATES', message: 'Invalid coordinates' } });
  }

  // Upload image
  const { url: photoUrl, publicId: photoPublicId } = await uploadImage(req.file.buffer);

  // Create initial report
  const report = await Report.create({
    submittedBy: req.user._id,
    photoUrl,
    photoPublicId,
    location: { type: 'Point', coordinates: [lon, lat] },
    status: 'submitted',
    statusHistory: [{ status: 'submitted', changedBy: req.user._id, notes: 'Report submitted' }],
  });

  // AI pipeline (async — don't block response for classification confirmation)
  processReportAI(report, description || '').catch(console.error);

  res.status(201).json({
    success: true,
    data: {
      reportId: report._id,
      message: 'Report submitted successfully. AI analysis in progress.',
    },
  });
};

// Background AI processing
const processReportAI = async (report, description) => {
  try {
    // 1. Classify
    const { issueType, confidence } = await classifyIssue(report.photoUrl);
    report.issueType = issueType;
    report.classificationConfidence = confidence;

    if (confidence < 0.6) {
      report.pendingConfirmation = true;
    }

    // 2. Severity
    const severityLevel = await estimateSeverity(report.photoUrl, issueType);
    report.severityLevel = severityLevel;

    // 3. Department routing
    const { departmentId, needsManualReview } = await routeDepartment(issueType, report.location.coordinates);
    report.department = departmentId;
    report.needsManualReview = needsManualReview;

    // 4. Summary
    const aiSummary = await generateSummary(issueType, severityLevel, report.address || 'location on map', description);
    report.aiSummary = aiSummary;

    // 5. Embedding for duplicate detection
    const embeddingText = `${issueType} ${severityLevel} ${description}`;
    const embedding = await generateEmbedding(embeddingText);
    report.photoEmbedding = embedding;

    await report.save();

    // 6. Duplicate detection
    const duplicateOfId = await detectDuplicate(report);
    if (duplicateOfId) {
      report.isDuplicate = true;
      report.duplicateOf = duplicateOfId;
      await report.save();

      await Report.findByIdAndUpdate(duplicateOfId, { $inc: { duplicateCount: 1 } });

      const submitter = await User.findById(report.submittedBy);
      await sendInAppNotification(
        report.submittedBy,
        report._id,
        `Your report has been linked to an existing open issue #${duplicateOfId}.`
      );
      if (submitter?.notificationEmail) {
        await sendEmailNotification(
          submitter.notificationEmail,
          'Your CivicAI report is a duplicate',
          `Your report (ID: ${report._id}) has been linked to existing issue #${duplicateOfId}. We appreciate your contribution!`
        );
      }
    }

    // 7. Set low priority if reputation score is low
    const submitter = await User.findById(report.submittedBy);
    if (submitter && submitter.reputationScore < 10) {
      report.lowPriority = true;
      await report.save();
    }
  } catch (error) {
    console.error('AI processing failed for report', report._id, error.message);
  }
};

// GET /api/reports (authority/admin with filters)
const getReports = async (req, res) => {
  const {
    issueType, severityLevel, status, department,
    startDate, endDate, page = 1, limit = 20,
  } = req.query;

  const filter = {};
  if (req.user.role === 'authority' && req.user.department) {
    filter.department = req.user.department;
  }
  if (issueType) filter.issueType = issueType;
  if (severityLevel) filter.severityLevel = severityLevel;
  if (status) filter.status = status;
  if (department && req.user.role === 'administrator') filter.department = department;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const reports = await Report.find(filter)
    .populate('submittedBy', 'name email reputationScore')
    .populate('department', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  reports.sort((a, b) => (severityOrder[a.severityLevel] || 3) - (severityOrder[b.severityLevel] || 3));

  const total = await Report.countDocuments(filter);

  res.json({ success: true, data: reports, total, page: parseInt(page), limit: parseInt(limit) });
};

// GET /api/reports/mine (citizen)
const getMyReports = async (req, res) => {
  const reports = await Report.find({ submittedBy: req.user._id })
    .populate('department', 'name')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: reports });
};

// GET /api/reports/:id
const getReport = async (req, res) => {
  const report = await Report.findById(req.params.id)
    .populate('submittedBy', 'name email reputationScore')
    .populate('department', 'name')
    .populate('duplicateOf', '_id issueType status');

  if (!report) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Report not found' } });
  }

  res.json({ success: true, data: report });
};

// PATCH /api/reports/:id/status (authority)
const updateStatus = async (req, res) => {
  const { status, notes } = req.body;
  const validStatuses = ['submitted', 'under_review', 'in_progress', 'resolved', 'closed'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Invalid status value' } });
  }

  const report = await Report.findById(req.params.id).populate('submittedBy', 'name email notificationEmail');
  if (!report) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Report not found' } });
  }

  const oldStatus = report.status;
  report.status = status;
  report.statusHistory.push({ status, changedBy: req.user._id, notes: notes || '' });

  if (status === 'resolved') {
    report.resolvedAt = new Date();
    report.resolutionNotes = notes || '';
    await increaseScore(report.submittedBy._id, 5);
  }

  await report.save();

  // Notify citizen
  await sendInAppNotification(
    report.submittedBy._id,
    report._id,
    `Your report #${report._id} status changed from "${oldStatus}" to "${status}".`
  );
  if (report.submittedBy.notificationEmail) {
    await sendEmailNotification(
      report.submittedBy.notificationEmail,
      `CivicAI Report Status Update`,
      `Your report (ID: ${report._id}) status has been updated to: ${status}.\n${notes ? 'Notes: ' + notes : ''}`
    );
  }

  res.json({ success: true, data: report });
};

// PATCH /api/reports/:id/reassign (authority)
const reassignDepartment = async (req, res) => {
  const { departmentId, reason } = req.body;

  const report = await Report.findById(req.params.id);
  if (!report) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Report not found' } });
  }

  report.department = departmentId;
  report.statusHistory.push({
    status: report.status,
    changedBy: req.user._id,
    notes: `Reassigned to department. Reason: ${reason || 'N/A'}`,
  });

  await report.save();
  res.json({ success: true, data: report });
};

// PATCH /api/reports/:id/flag (authority — mark spam)
const flagReport = async (req, res) => {
  const report = await Report.findById(req.params.id).populate('submittedBy', 'name email');
  if (!report) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Report not found' } });
  }

  report.status = 'closed';
  report.statusHistory.push({ status: 'closed', changedBy: req.user._id, notes: 'Flagged as spam/invalid' });
  await report.save();

  const newScore = await decreaseScore(report.submittedBy._id, 10);

  // If score drops below 10, mark future reports
  if (newScore !== undefined && newScore < 10) {
    await Report.updateMany(
      { submittedBy: report.submittedBy._id, status: { $nin: ['resolved', 'closed'] } },
      { lowPriority: true }
    );
  }

  res.json({ success: true, message: 'Report flagged and citizen score updated' });
};

// POST /api/reports/:id/confirm-type (citizen — confirm AI classification)
const confirmIssueType = async (req, res) => {
  const { issueType } = req.body;
  const report = await Report.findById(req.params.id);

  if (!report) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Report not found' } });
  }

  if (report.submittedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not your report' } });
  }

  report.issueType = issueType;
  report.pendingConfirmation = false;
  await report.save();

  res.json({ success: true, data: report });
};

module.exports = {
  submitReport, getReports, getMyReports, getReport,
  updateStatus, reassignDepartment, flagReport, confirmIssueType,
};
