const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const { getMyNotifications, markRead, markAllRead } = require('../controllers/notificationController');

router.get('/mine', authMiddleware, asyncHandler(getMyNotifications));
router.patch('/:id/read', authMiddleware, asyncHandler(markRead));
router.patch('/read-all', authMiddleware, asyncHandler(markAllRead));

module.exports = router;
