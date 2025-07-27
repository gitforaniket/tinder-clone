const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Reference to the match this message belongs to
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: [true, 'Match reference is required']
  },
  
  // Message sender
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required']
  },
  
  // Message receiver
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Receiver is required']
  },
  
  // Message content
  content: {
    text: {
      type: String,
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    
    // For image messages
    image: {
      url: String,
      publicId: String,
      caption: {
        type: String,
        maxlength: [200, 'Caption cannot exceed 200 characters']
      }
    },
    
    // For GIF messages
    gif: {
      url: String,
      title: String
    }
  },
  
  // Message type
  messageType: {
    type: String,
    enum: ['text', 'image', 'gif', 'system'],
    default: 'text',
    required: true
  },
  
  // Message status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  
  // Timestamps for message lifecycle
  sentAt: {
    type: Date,
    default: Date.now
  },
  
  deliveredAt: {
    type: Date
  },
  
  readAt: {
    type: Date
  },
  
  // Message metadata
  isEdited: {
    type: Boolean,
    default: false
  },
  
  editedAt: {
    type: Date
  },
  
  originalText: {
    type: String // Store original message if edited
  },
  
  // Reply functionality
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  // Message reactions
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      enum: ['❤️', '😂', '😮', '😢', '😡', '👍', '👎']
    },
    reactedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Temporary message indicator (for optimistic UI updates)
  isTemporary: {
    type: Boolean,
    default: false
  },
  
  // Client-generated ID for temporary messages
  tempId: {
    type: String
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
messageSchema.index({ match: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ receiver: 1 });
messageSchema.index({ sentAt: -1 });
messageSchema.index({ status: 1 });

// Compound indexes
messageSchema.index({ match: 1, status: 1 });
messageSchema.index({ receiver: 1, status: 1 });

// Virtual for message age
messageSchema.virtual('messageAge').get(function() {
  return Date.now() - this.sentAt;
});

// Validation: Ensure message has content based on type
messageSchema.pre('save', function(next) {
  switch (this.messageType) {
    case 'text':
      if (!this.content.text || this.content.text.trim() === '') {
        return next(new Error('Text message must have text content'));
      }
      break;
    case 'image':
      if (!this.content.image || !this.content.image.url) {
        return next(new Error('Image message must have image URL'));
      }
      break;
    case 'gif':
      if (!this.content.gif || !this.content.gif.url) {
        return next(new Error('GIF message must have GIF URL'));
      }
      break;
  }
  next();
});

// Instance method to mark message as delivered
messageSchema.methods.markAsDelivered = function() {
  if (this.status === 'sent') {
    this.status = 'delivered';
    this.deliveredAt = new Date();
    return this.save();
  }
};

// Instance method to mark message as read
messageSchema.methods.markAsRead = function() {
  if (this.status === 'delivered' || this.status === 'sent') {
    this.status = 'read';
    this.readAt = new Date();
    return this.save();
  }
};

// Instance method to add reaction
messageSchema.methods.addReaction = function(userId, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(
    reaction => reaction.user.toString() !== userId.toString()
  );
  
  // Add new reaction
  this.reactions.push({
    user: userId,
    emoji: emoji,
    reactedAt: new Date()
  });
  
  return this.save();
};

// Instance method to remove reaction
messageSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(
    reaction => reaction.user.toString() !== userId.toString()
  );
  
  return this.save();
};

// Static method to get match messages with pagination
messageSchema.statics.getMatchMessages = function(matchId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return this.find({ match: matchId })
    .populate('sender', 'name photos')
    .populate('replyTo', 'content messageType sender')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get unread message count for user
messageSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    receiver: userId,
    status: { $in: ['sent', 'delivered'] }
  });
};

// Static method to mark multiple messages as read
messageSchema.statics.markMatchMessagesAsRead = function(matchId, userId) {
  return this.updateMany(
    {
      match: matchId,
      receiver: userId,
      status: { $in: ['sent', 'delivered'] }
    },
    {
      $set: {
        status: 'read',
        readAt: new Date()
      }
    }
  );
};

module.exports = mongoose.model('Message', messageSchema);