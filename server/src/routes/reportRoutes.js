const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');
const upload = require('../middleware/upload');
const {
  submitReport, getReports, getMyReports, getReport,
  updateStatus, reassignDepartment, flagReport, confirmIssueType,
} = require('../controllers/reportController');

router.post('/', authMiddleware, upload.single('photo'), asyncHandler(submitReport));
router.get('/', authMiddleware, roleGuard(['authority', 'administrator']), asyncHandler(getReports));
router.get('/mine', authMiddleware, asyncHandler(getMyReports));
router.get('/:id', authMiddleware, asyncHandler(getReport));
router.patch('/:id/status', authMiddleware, roleGuard(['authority', 'administrator']), asyncHandler(updateStatus));
router.patch('/:id/reassign', authMiddleware, roleGuard(['authority', 'administrator']), asyncHandler(reassignDepartment));
router.patch('/:id/flag', authMiddleware, roleGuard(['authority', 'administrator']), asyncHandler(flagReport));
router.post('/:id/confirm-type', authMiddleware, asyncHandler(confirmIssueType));

module.exports = router;
