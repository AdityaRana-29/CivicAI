const User = require('../models/User');

const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

const increaseScore = async (userId, delta = 5) => {
  const user = await User.findById(userId);
  if (!user) return;
  user.reputationScore = clamp(user.reputationScore + delta, 0, 100);
  await user.save();
  return user.reputationScore;
};

const decreaseScore = async (userId, delta = 10) => {
  const user = await User.findById(userId);
  if (!user) return;
  user.reputationScore = clamp(user.reputationScore - delta, 0, 100);
  await user.save();
  return user.reputationScore;
};

module.exports = { increaseScore, decreaseScore };
