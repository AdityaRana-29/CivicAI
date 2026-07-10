const Notification = require('../models/Notification');

// GET /api/notifications/mine
const getMyNotifications = async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ success: true, data: notifications });
};

// PATCH /api/notifications/:id/read
const markRead = async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ success: true });
};

// PATCH /api/notifications/read-all
const markAllRead = async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
  res.json({ success: true });
};

module.exports = { getMyNotifications, markRead, markAllRead };
