const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');
const { getPredictions, triggerPredictions } = require('../controllers/predictionController');

router.get('/', authMiddleware, roleGuard(['authority', 'administrator']), asyncHandler(getPredictions));
router.post('/run', authMiddleware, roleGuard(['administrator']), asyncHandler(triggerPredictions));

module.exports = router;
