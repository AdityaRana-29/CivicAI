const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const err = new Error('No token provided');
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      return next(err);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-passwordHash -refreshToken');
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      return next(err);
    }

    if (user.isLocked) {
      const err = new Error('Account is locked. Please check your email.');
      err.statusCode = 403;
      err.code = 'ACCOUNT_LOCKED';
      return next(err);
    }

    req.user = user;
    next();
  } catch (error) {
    const err = new Error('Invalid or expired token');
    err.statusCode = 401;
    err.code = 'UNAUTHORIZED';
    next(err);
  }
};

module.exports = authMiddleware;
