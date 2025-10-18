const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  // Core message fields
  senderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: { 
    type: String, 
    required: true,
    trim: true 
  },

  // Real-time chat features
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },

  // Enhanced metadata
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  editedAt: { 
    type: Date 
  },
  isEdited: { 
    type: Boolean, 
    default: false 
  },

  // Message threading (for future use)
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },

  // Booking context (if message is related to a booking)
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
MessageSchema.index({ conversationId: 1, timestamp: -1 });
MessageSchema.index({ senderId: 1, receiverId: 1 });
MessageSchema.index({ status: 1, receiverId: 1 });

// Virtual for backward compatibility
MessageSchema.virtual('content').get(function() {
  return this.message;
});

MessageSchema.virtual('sender').get(function() {
  return this.senderId;
});

MessageSchema.virtual('receiver').get(function() {
  return this.receiverId;
});

// Static method to generate conversation ID
MessageSchema.statics.generateConversationId = function(userId1, userId2) {
  const sortedIds = [userId1.toString(), userId2.toString()].sort();
  return `conv_${sortedIds[0]}_${sortedIds[1]}`;
};

// Static method to get conversation messages
MessageSchema.statics.getConversationMessages = function(conversationId, limit = 50, skip = 0) {
  return this.find({ conversationId })
    .populate('senderId', 'name email avatar role')
    .populate('receiverId', 'name email avatar role')
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip);
};

// Instance method to mark as read
MessageSchema.methods.markAsRead = function() {
  this.status = 'read';
  return this.save();
};

module.exports = mongoose.model("Message", MessageSchema);
