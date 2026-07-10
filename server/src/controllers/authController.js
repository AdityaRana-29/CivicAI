const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmailNotification } = require('../services/notificationService');

const generateToken = (userId, role) =>
  jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });

// POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ success: false, error: { code: 'EMAIL_EXISTS', message: 'Email already registered' } });
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: role === 'authority' || role === 'administrator' ? role : 'citizen',
    notificationEmail: email,
  });

  const token = generateToken(user._id, user.role);

  res.status(201).json({
    success: true,
    data: {
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    },
  });
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
  }

  if (user.isLocked) {
    return res.status(403).json({ success: false, error: { code: 'ACCOUNT_LOCKED', message: 'Account is locked. Check your email.' } });
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    user.failedLoginAttempts += 1;

    if (user.failedLoginAttempts >= 5) {
      user.isLocked = true;
      await user.save();
      await sendEmailNotification(
        user.notificationEmail,
        'CivicAI Account Locked',
        `Your CivicAI account has been locked due to 5 consecutive failed login attempts. Please contact support to unlock it.`
      );
      return res.status(403).json({ success: false, error: { code: 'ACCOUNT_LOCKED', message: 'Account locked after 5 failed attempts.' } });
    }

    await user.save();
    return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
  }

  // Successful login — reset counter
  user.failedLoginAttempts = 0;
  await user.save();

  const token = generateToken(user._id, user.role);

  res.json({
    success: true,
    data: {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        reputationScore: user.reputationScore,
        department: user.department,
      },
    },
  });
};

// POST /api/auth/logout
const logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out' });
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};

module.exports = { register, login, logout, getMe };
