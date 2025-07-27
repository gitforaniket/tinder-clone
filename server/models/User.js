const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  
  // Profile Information
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [18, 'Must be at least 18 years old'],
    max: [100, 'Age cannot exceed 100']
  },
  
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: {
      values: ['male', 'female', 'non-binary', 'other'],
      message: 'Gender must be male, female, non-binary, or other'
    }
  },
  
  interestedIn: {
    type: String,
    required: [true, 'Interested in preference is required'],
    enum: {
      values: ['male', 'female', 'non-binary', 'everyone'],
      message: 'Invalid preference'
    }
  },
  
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    trim: true,
    default: ''
  },
  
  // Photos
  photos: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Location
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Location coordinates are required'],
      validate: {
        validator: function(coordinates) {
          return coordinates.length === 2 && 
                 coordinates[0] >= -180 && coordinates[0] <= 180 && // longitude
                 coordinates[1] >= -90 && coordinates[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates format'
      }
    },
    address: {
      type: String,
      trim: true
    }
  },
  
  // Preferences
  preferences: {
    ageRange: {
      min: {
        type: Number,
        default: 18,
        min: 18,
        max: 100
      },
      max: {
        type: Number,
        default: 35,
        min: 18,
        max: 100
      }
    },
    maxDistance: {
      type: Number,
      default: 50, // kilometers
      min: [1, 'Distance must be at least 1 km'],
      max: [500, 'Distance cannot exceed 500 km']
    },
    showMe: {
      type: String,
      enum: ['male', 'female', 'non-binary', 'everyone'],
      default: 'everyone'
    }
  },
  
  // Swipe History
  swipes: {
    liked: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      swipedAt: {
        type: Date,
        default: Date.now
      }
    }],
    passed: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      swipedAt: {
        type: Date,
        default: Date.now
      }
    }],
    superLiked: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      swipedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Activity Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  isOnline: {
    type: Boolean,
    default: false
  },
  
  lastActive: {
    type: Date,
    default: Date.now
  },
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  
  verificationPhotos: [{
    url: String,
    publicId: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Premium Features
  isPremium: {
    type: Boolean,
    default: false
  },
  
  premiumExpiry: {
    type: Date
  },
  
  superLikesCount: {
    type: Number,
    default: 1,
    min: 0
  },
  
  boostsCount: {
    type: Number,
    default: 0,
    min: 0
  }
  
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ location: '2dsphere' }); // Geospatial index
userSchema.index({ email: 1 });
userSchema.index({ age: 1 });
userSchema.index({ gender: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ lastActive: -1 });

// Virtual for age calculation (if you want to store birthdate instead)
userSchema.virtual('profileComplete').get(function() {
  return !!(this.name && this.photos.length > 0 && this.bio && this.location);
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified or new
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to validate age range
userSchema.pre('save', function(next) {
  if (this.preferences.ageRange.min > this.preferences.ageRange.max) {
    next(new Error('Minimum age cannot be greater than maximum age'));
  }
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to check if user has liked another user
userSchema.methods.hasLiked = function(userId) {
  return this.swipes.liked.some(like => like.user.toString() === userId.toString());
};

// Instance method to check if user has passed another user
userSchema.methods.hasPassed = function(userId) {
  return this.swipes.passed.some(pass => pass.user.toString() === userId.toString());
};

// Instance method to get primary photo
userSchema.methods.getPrimaryPhoto = function() {
  const primaryPhoto = this.photos.find(photo => photo.isPrimary);
  return primaryPhoto || this.photos[0] || null;
};

// Static method to find potential matches
userSchema.statics.findPotentialMatches = function(userId, userPreferences, userLocation) {
  const { ageRange, maxDistance, showMe } = userPreferences;
  
  return this.aggregate([
    {
      $geoNear: {
        near: userLocation,
        distanceField: 'distance',
        maxDistance: maxDistance * 1000, // Convert km to meters
        spherical: true
      }
    },
    {
      $match: {
        _id: { $ne: userId },
        age: { $gte: ageRange.min, $lte: ageRange.max },
        gender: showMe === 'everyone' ? { $exists: true } : showMe,
        isActive: true,
        $and: [
          { 'swipes.liked.user': { $ne: userId } },
          { 'swipes.passed.user': { $ne: userId } }
        ]
      }
    },
    {
      $limit: 20
    }
  ]);
};

module.exports = mongoose.model('User', userSchema);