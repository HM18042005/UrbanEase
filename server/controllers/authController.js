const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  const userSafe = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  res.status(statusCode).json({ token, user: userSafe });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const safeRole = role && ['customer', 'provider'].includes(role) ? role : 'customer';
    const user = await User.create({ name, email, password, role: safeRole });

    sendToken(user, 201, res);
  } catch (err) {
    res.status(500).json({ message: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing credentials' });
    const user = await User.findOne({ email }).select('+password +active');
    if (!user || user.active === false)
      return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await user.correctPassword(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
};

exports.logout = async (req, res) => {
  res.cookie('jwt', '', { httpOnly: true, expires: new Date(0), path: '/' });
  res.status(200).json({ message: 'Logged out' });
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};

exports.updateMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Missing fields' });

    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const ok = await user.correctPassword(currentPassword, user.password);
    if (!ok) return res.status(401).json({ message: 'Current password incorrect' });

    user.password = newPassword;
    await user.save();
    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ message: 'Password update failed' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: 'If email exists, reset sent' });

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ message: 'Password reset token generated', resetToken });
  } catch (err) {
    res.status(500).json({ message: 'Forgot password failed' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: 'Password required' });
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: 'Token invalid or expired' });

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ message: 'Reset password failed' });
  }
};
