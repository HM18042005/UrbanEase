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
    console.log('🔒 Auth middleware called for:', req.method, req.path);
    console.log('🔍 Request headers:', {
      authorization: req.headers.authorization ? 'Present' : 'Missing',
      cookie: req.headers.cookie ? 'Present' : 'Missing'
    });
    
    const token = getTokenFromReq(req);
    console.log('🎫 Token extracted:', token ? `Present (${token.substring(0, 20)}...)` : 'Missing');
    
    if (!token) {
      console.log('❌ No token found');
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded successfully:', { id: decoded.id });
    
    const currentUser = await User.findById(decoded.id).select('+active');
    if (!currentUser || currentUser.active === false) {
      console.log('❌ User not found or inactive');
      return res.status(401).json({ message: 'User no longer exists' });
    }

    if (currentUser.changedPasswordAfter && currentUser.changedPasswordAfter(decoded.iat)) {
      console.log('❌ Password changed after token issued');
      return res.status(401).json({ message: 'Password changed recently. Please log in again.' });
    }

    req.user = { 
      id: currentUser.id, 
      _id: currentUser._id,
      role: currentUser.role 
    };
    req.userDoc = currentUser;
    console.log('✅ Auth successful:', { id: currentUser.id, role: currentUser.role });
    next();
  } catch (err) {
    console.log('❌ Auth error:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

exports.restrictTo = (...roles) => (req, res, next) => {
  console.log('🚪 Role restriction check:', { 
    requiredRoles: roles, 
    userRole: req.user?.role, 
    userId: req.user?.id 
  });
  
  if (!req.user || !roles.includes(req.user.role)) {
    console.log('❌ Role restriction failed');
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  console.log('✅ Role restriction passed');
  next();
};
