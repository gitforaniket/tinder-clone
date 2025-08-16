const User = require('../models/User');
const { uploadImage, deleteImage, updateImage, getOptimizedUrl } = require('../config/cloudinary');

// @desc    Get all users (with pagination and filters)
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isActive: true };
    
    if (req.query.gender) {
      filter.gender = req.query.gender;
    }
    
    if (req.query.minAge || req.query.maxAge) {
      filter.age = {};
      if (req.query.minAge) filter.age.$gte = parseInt(req.query.minAge);
      if (req.query.maxAge) filter.age.$lte = parseInt(req.query.maxAge);
    }

    // Exclude current user from results
    filter._id = { $ne: req.user.userId };

    const users = await User.find(filter)
      .select('-password -email')
      .sort({ lastActive: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    res.json({
      success: true,
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      bio,
      age,
      gender,
      interestedIn,
      location,
      preferences,
      job,
      education,
      interests
    } = req.body;

    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (age !== undefined) user.age = age;
    if (gender !== undefined) user.gender = gender;
    if (interestedIn !== undefined) user.interestedIn = interestedIn;
    if (location !== undefined) user.location = location;
    if (preferences !== undefined) user.preferences = preferences;
    if (job !== undefined) user.job = job;
    if (education !== undefined) user.education = education;
    if (interests !== undefined) user.interests = interests;

    // Validate age if updated
    if (age !== undefined && age < 18) {
      return res.status(400).json({
        success: false,
        message: 'You must be at least 18 years old'
      });
    }

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: userResponse
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Upload profile photo
// @route   POST /api/users/profile/photo
// @access  Private
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No photo uploaded'
      });
    }

    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadImage(req.file.buffer, {
      folder: `tinder-clone/profiles/${user._id}`,
      public_id: `profile_${Date.now()}`
    });

    // Add photo to user's photos array
    const newPhoto = {
      url: uploadResult.url,
      publicId: uploadResult.public_id,
      isPrimary: user.photos.length === 0, // First photo is primary
      order: user.photos.length
    };

    user.photos.push(newPhoto);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        photo: newPhoto,
        totalPhotos: user.photos.length
      }
    });

  } catch (error) {
    console.error('Upload profile photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading photo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Upload multiple photos
// @route   POST /api/users/profile/photos
// @access  Private
const uploadMultiplePhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No photos uploaded'
      });
    }

    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if adding these photos would exceed the limit
    if (user.photos.length + req.files.length > 6) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 6 photos allowed'
      });
    }

    const uploadedPhotos = [];

    // Upload each photo to Cloudinary
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      
      const uploadResult = await uploadImage(file.buffer, {
        folder: `tinder-clone/profiles/${user._id}`,
        public_id: `photo_${Date.now()}_${i}`
      });

      const newPhoto = {
        url: uploadResult.url,
        publicId: uploadResult.public_id,
        isPrimary: user.photos.length === 0 && i === 0, // First photo is primary
        order: user.photos.length + i
      };

      user.photos.push(newPhoto);
      uploadedPhotos.push(newPhoto);
    }

    await user.save();

    res.status(201).json({
      success: true,
      message: `${uploadedPhotos.length} photos uploaded successfully`,
      data: {
        photos: uploadedPhotos,
        totalPhotos: user.photos.length
      }
    });

  } catch (error) {
    console.error('Upload multiple photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading photos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete profile photo
// @route   DELETE /api/users/profile/photo/:photoId
// @access  Private
const deleteProfilePhoto = async (req, res) => {
  try {
    const { photoId } = req.params;

    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const photoIndex = user.photos.findIndex(photo => photo._id.toString() === photoId);
    
    if (photoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    const photo = user.photos[photoIndex];

    // Delete from Cloudinary
    if (photo.publicId) {
      await deleteImage(photo.publicId);
    }

    // Remove photo from user's photos array
    user.photos.splice(photoIndex, 1);

    // If this was the primary photo and there are other photos, make the first one primary
    if (photo.isPrimary && user.photos.length > 0) {
      user.photos[0].isPrimary = true;
    }

    // Reorder remaining photos
    user.photos.forEach((photo, index) => {
      photo.order = index;
    });

    await user.save();

    res.json({
      success: true,
      message: 'Photo deleted successfully',
      data: {
        deletedPhotoId: photoId,
        totalPhotos: user.photos.length
      }
    });

  } catch (error) {
    console.error('Delete profile photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting photo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Set primary photo
// @route   PUT /api/users/profile/photo/:photoId/primary
// @access  Private
const setPrimaryPhoto = async (req, res) => {
  try {
    const { photoId } = req.params;

    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const photo = user.photos.find(photo => photo._id.toString() === photoId);
    
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    // Remove primary flag from all photos
    user.photos.forEach(photo => {
      photo.isPrimary = false;
    });

    // Set the selected photo as primary
    photo.isPrimary = true;

    await user.save();

    res.json({
      success: true,
      message: 'Primary photo updated successfully',
      data: {
        primaryPhotoId: photoId
      }
    });

  } catch (error) {
    console.error('Set primary photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while setting primary photo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Reorder photos
// @route   PUT /api/users/profile/photos/reorder
// @access  Private
const reorderPhotos = async (req, res) => {
  try {
    const { photoIds } = req.body; // Array of photo IDs in new order

    if (!Array.isArray(photoIds)) {
      return res.status(400).json({
        success: false,
        message: 'Photo IDs must be an array'
      });
    }

    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate that all photo IDs belong to the user
    const userPhotoIds = user.photos.map(photo => photo._id.toString());
    const isValidOrder = photoIds.every(id => userPhotoIds.includes(id));
    
    if (!isValidOrder) {
      return res.status(400).json({
        success: false,
        message: 'Invalid photo IDs provided'
      });
    }

    // Reorder photos based on the provided order
    const reorderedPhotos = [];
    photoIds.forEach((photoId, index) => {
      const photo = user.photos.find(p => p._id.toString() === photoId);
      if (photo) {
        photo.order = index;
        reorderedPhotos.push(photo);
      }
    });

    user.photos = reorderedPhotos;
    await user.save();

    res.json({
      success: true,
      message: 'Photos reordered successfully',
      data: {
        photos: user.photos
      }
    });

  } catch (error) {
    console.error('Reorder photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while reordering photos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete all photos from Cloudinary
    for (const photo of user.photos) {
      if (photo.publicId) {
        try {
          await deleteImage(photo.publicId);
        } catch (error) {
          console.error(`Failed to delete photo ${photo.publicId}:`, error);
        }
      }
    }

    // Delete user from database
    await User.findByIdAndDelete(req.user.userId);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting account',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Private
const searchUsers = async (req, res) => {
  try {
    const { q, gender, minAge, maxAge, location } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build search filter
    const filter = { isActive: true, _id: { $ne: req.user.userId } };

    // Text search
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } },
        { job: { $regex: q, $options: 'i' } },
        { education: { $regex: q, $options: 'i' } }
      ];
    }

    // Gender filter
    if (gender) {
      filter.gender = gender;
    }

    // Age filter
    if (minAge || maxAge) {
      filter.age = {};
      if (minAge) filter.age.$gte = parseInt(minAge);
      if (maxAge) filter.age.$lte = parseInt(maxAge);
    }

    // Location filter (if implemented)
    if (location) {
      // This would need geospatial query implementation
      // For now, we'll search in the address field
      filter['location.address'] = { $regex: location, $options: 'i' };
    }

    const users = await User.find(filter)
      .select('-password -email')
      .sort({ lastActive: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateProfile,
  uploadProfilePhoto,
  uploadMultiplePhotos,
  deleteProfilePhoto,
  setPrimaryPhoto,
  reorderPhotos,
  deleteAccount,
  searchUsers
};
