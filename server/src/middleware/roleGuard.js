// Usage: roleGuard(['authority', 'administrator'])
const roleGuard = (roles) => (req, res, next) => {
  if (!req.user) {
    const err = new Error('Not authenticated');
    err.statusCode = 401;
    err.code = 'UNAUTHORIZED';
    return next(err);
  }

  if (!roles.includes(req.user.role)) {
    const err = new Error('You do not have permission to perform this action');
    err.statusCode = 403;
    err.code = 'FORBIDDEN';
    return next(err);
  }

  next();
};

module.exports = roleGuard;
