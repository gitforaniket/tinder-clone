const multer = require('multer');
const path = require('path');

// Configure multer for memory storage (for Cloudinary uploads)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 6 // Maximum 6 files (for multiple photos)
  }
});

// Single file upload middleware
const uploadSingle = upload.single('photo');

// Multiple files upload middleware
const uploadMultiple = upload.array('photos', 6);

// Custom error handling wrapper
const handleUpload = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer-specific errors
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 5MB.'
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'Too many files. Maximum 6 files allowed.'
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: 'Unexpected file field.'
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      } else if (err) {
        // Other errors (like fileFilter errors)
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      // Check if files were uploaded
      if (!req.file && !req.files) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded.'
        });
      }
      
      next();
    });
  };
};

// Profile photo upload (single)
const uploadProfilePhoto = handleUpload(uploadSingle);

// Multiple photos upload
const uploadMultiplePhotos = handleUpload(uploadMultiple);

// Validate uploaded files
const validateUploadedFiles = (req, res, next) => {
  const files = req.files || (req.file ? [req.file] : []);
  
  if (files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded.'
    });
  }

  // Validate each file
  for (const file of files) {
    // Check file size
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: `File ${file.originalname} is too large. Maximum size is 5MB.`
      });
    }

    // Check file type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `File ${file.originalname} has invalid type. Only JPEG, PNG, GIF, and WebP images are allowed.`
      });
    }
  }

  next();
};

// Clean up uploaded files (remove from memory)
const cleanupUploadedFiles = (req, res, next) => {
  // This is handled automatically by multer.memoryStorage()
  // Files are stored in memory and will be garbage collected
  next();
};

module.exports = {
  upload,
  uploadProfilePhoto,
  uploadMultiplePhotos,
  validateUploadedFiles,
  cleanupUploadedFiles,
  handleUpload
};
