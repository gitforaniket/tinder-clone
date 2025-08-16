const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/userController');
const { protect, requireOwnership } = require('../middleware/auth');
const { 
  uploadProfilePhoto: uploadPhotoMiddleware,
  uploadMultiplePhotos: uploadMultipleMiddleware,
  validateUploadedFiles
} = require('../middleware/upload');

// All routes require authentication
router.use(protect);

// User CRUD routes
router.get('/', getUsers);
router.get('/search', searchUsers);
router.get('/:id', getUserById);

// Profile management routes
router.put('/profile', updateProfile);
router.delete('/profile', deleteAccount);

// Photo upload routes
router.post('/profile/photo', uploadPhotoMiddleware, validateUploadedFiles, uploadProfilePhoto);
router.post('/profile/photos', uploadMultipleMiddleware, validateUploadedFiles, uploadMultiplePhotos);

// Photo management routes
router.delete('/profile/photo/:photoId', deleteProfilePhoto);
router.put('/profile/photo/:photoId/primary', setPrimaryPhoto);
router.put('/profile/photos/reorder', reorderPhotos);

module.exports = router;
