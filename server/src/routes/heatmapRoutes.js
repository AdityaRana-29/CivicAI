const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');
const { getHeatmapData } = require('../controllers/heatmapController');

router.get('/data', authMiddleware, roleGuard(['authority', 'administrator']), asyncHandler(getHeatmapData));

module.exports = router;
