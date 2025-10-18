const express = require('express');
const { getProfile, updateProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected - user must be logged in
router.use(protect);

router.get('/', getProfile);
router.patch('/', updateProfile);

module.exports = router;
