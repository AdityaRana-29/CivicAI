const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');
const { getSummary, getPerformance, getTrends, exportCSV } = require('../controllers/analyticsController');

router.get('/summary', authMiddleware, roleGuard(['administrator']), asyncHandler(getSummary));
router.get('/performance', authMiddleware, roleGuard(['administrator']), asyncHandler(getPerformance));
router.get('/trends', authMiddleware, roleGuard(['administrator']), asyncHandler(getTrends));
router.get('/export', authMiddleware, roleGuard(['administrator']), asyncHandler(exportCSV));

module.exports = router;
