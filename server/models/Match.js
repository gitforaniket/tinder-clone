const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  
  // Match status
  status: {
    type: String,
    enum: ['active', 'unmatched', 'blocked'],
    default: 'active'
  },
  
  // Who initiated the match (who liked second)
  matchedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Last message in this match
  lastMessage: {
    text: {
      type: String,
      trim: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'gif'],
      default: 'text'
    }
  },
  
  // Message count for each user
  messageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Unread message counts for each user
  unreadCount: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
  
  // Match metadata
  isConversationStarted: {
    type: Boolean,
    default: false
  },
  
  // Track who unmatched (if applicable)
  unmatchedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  unmatchedAt: {
    type: Date
  },
  
  // Super like indicator
  isSuperLike: {
    type: Boolean,
    default: false
  },
  
  superLikedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
matchSchema.index({ users: 1 });
matchSchema.index({ status: 1 });
matchSchema.index({ 'lastMessage.timestamp': -1 });
matchSchema.index({ createdAt: -1 });

// Compound index for efficient user match queries
matchSchema.index({ users: 1, status: 1 });

// Virtual to get the other user in the match
matchSchema.virtual('otherUser').get(function() {
  // This would be set when populated with the requesting user's ID
  return this.users.find(user => user._id.toString() !== this.requestingUserId);
});

// Pre-save middleware to initialize unread counts
matchSchema.pre('save', function(next) {
  if (this.isNew) {
    this.unreadCount = this.users.map(userId => ({
      user: userId,
      count: 0
    }));
  }
  next();
});

// Instance method to get unread count for specific user
matchSchema.methods.getUnreadCount = function(userId) {
  const userUnread = this.unreadCount.find(
    unread => unread.user.toString() === userId.toString()
  );
  return userUnread ? userUnread.count : 0;
};

// Instance method to increment unread count
matchSchema.methods.incrementUnreadCount = function(userId) {
  const userUnread = this.unreadCount.find(
    unread => unread.user.toString() === userId.toString()
  );
  if (userUnread) {
    userUnread.count += 1;
  }
};

// Instance method to reset unread count
matchSchema.methods.resetUnreadCount = function(userId) {
  const userUnread = this.unreadCount.find(
    unread => unread.user.toString() === userId.toString()
  );
  if (userUnread) {
    userUnread.count = 0;
  }
};

// Instance method to check if user is part of this match
matchSchema.methods.includesUser = function(userId) {
  return this.users.some(user => user.toString() === userId.toString());
};

// Static method to find match between two users
matchSchema.statics.findMatchBetweenUsers = function(userId1, userId2) {
  return this.findOne({
    users: { $all: [userId1, userId2] },
    status: 'active'
  });
};

// Static method to get user's active matches
matchSchema.statics.getUserMatches = function(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return this.find({
    users: userId,
    status: 'active'
  })
  .populate('users', 'name photos age bio lastActive isOnline')
  .sort({ 'lastMessage.timestamp': -1 })
  .skip(skip)
  .limit(limit);
};

module.exports = mongoose.model('Match', matchSchema);