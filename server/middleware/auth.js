const jwt = require('jsonwebtoken');
const User = require('../models/user');

const getTokenFromReq = (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  if (req.cookies && req.cookies.jwt) {
    return req.cookies.jwt;
  }
  return null;
};

exports.protect = async (req, res, next) => {
  try {
    const token = getTokenFromReq(req);
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id).select('+active');
    if (!currentUser || currentUser.active === false)
      return res.status(401).json({ message: 'User no longer exists' });

    if (currentUser.changedPasswordAfter && currentUser.changedPasswordAfter(decoded.iat))
      return res.status(401).json({ message: 'Password changed recently. Please log in again.' });

    req.user = { id: currentUser.id, role: currentUser.role };
    req.userDoc = currentUser;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

exports.restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role))
    return res.status(403).json({ message: 'Forbidden' });
  next();
};
