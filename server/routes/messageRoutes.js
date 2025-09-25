const express = require('express');
const {
  getConversations,
  getBookingBasedConversations,
  getConversationMessages,
  sendMessage,
  deleteMessage,
  markAsRead,
  getUnreadCount,
  searchMessages
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All message routes require authentication
router.use(protect);

// Message management
router.get('/conversations', getConversations);
router.get('/booking-conversations', getBookingBasedConversations);
router.get('/conversation/:userId', getConversationMessages);
router.get('/unread-count', getUnreadCount);
router.get('/search', searchMessages);
router.post('/send', sendMessage);
router.put('/mark-read', markAsRead);
router.delete('/:id', deleteMessage);

module.exports = router;
