const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import models
const Booking = require('./models/booking');
const User = require('./models/user');
const message = require('./models/message');
const service = require('./models/service');
const review = require('./models/review');


const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
// MongoDB connection
mongoose.connect(process.env.MONGO_URI ,{ useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Auth routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Profile routes
const profileRoutes = require('./routes/profileRoutes');
app.use('/api/profile', profileRoutes);

// Service routes
const serviceRoutes = require('./routes/serviceRoutes');
app.use('/api/services', serviceRoutes);

// Booking routes
const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api/bookings', bookingRoutes);

// Review routes
const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);

// Message routes
const messageRoutes = require('./routes/messageRoutes');
app.use('/api/messages', messageRoutes);

// User routes
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// Admin routes
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

// Test route
app.get('/', (req, res) => res.send('Hello from backend!'));

// Admin-only test route
const { protect, restrictTo } = require('./middleware/auth');
app.get('/admin/ping', protect, restrictTo('admin'), (req, res) => {
  res.json({ ok: true, user: req.user });
});

// Test database route
app.get('/test-db1', async (req, res) => {
  try {
    const count = await message.countDocuments();
    res.json({ 
      message: 'Database connection working!', 
      messagesCount: count,
      dbStatus: 'Connected'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Database error', 
      error: error.message,
      dbStatus: 'Error'
    });
  }
});
app.get('/test-db2', async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ 
      message: 'Database connection working!', 
      usersCount: count,
      dbStatus: 'Connected'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Database error', 
      error: error.message,
      dbStatus: 'Error'
    });
  }
});
app.get('/test-db3', async (req, res) => {
  try {
    const count = await Booking.countDocuments();
    res.json({ 
      message: 'Database connection working!', 
      bookingsCount: count,
      dbStatus: 'Connected'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Database error', 
      error: error.message,
      dbStatus: 'Error'
    });
  }
});
app.get('/test-db4', async (req, res) => {
  try {
    const count = await service.countDocuments();
    res.json({ 
      message: 'Database connection working!', 
      servicesCount: count,
      dbStatus: 'Connected'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Database error', 
      error: error.message,
      dbStatus: 'Error'
    });
  }
});app.get('/test-db5', async (req, res) => {
  try {
    const count = await review.countDocuments();
    res.json({ 
      message: 'Database connection working!', 
      reviewsCount: count,
      dbStatus: 'Connected'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Database error', 
      error: error.message,
      dbStatus: 'Error'
    });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
