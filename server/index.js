const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import models
const Booking = require('./models/booking');
const User = require('./models/user');
const message = require('./models/message');
const service = require('./models/service');
const review = require('./models/review');


const app = express();
app.use(cors());
app.use(express.json());
// MongoDB connection
mongoose.connect(process.env.MONGO_URI ,{ useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Test route
app.get('/', (req, res) => res.send('Hello from backend!'));

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
