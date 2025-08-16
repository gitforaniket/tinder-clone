const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary
 * @param {Buffer|string} file - File buffer or file path
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
const uploadImage = async (file, options = {}) => {
  try {
    const uploadOptions = {
      folder: 'tinder-clone/profiles',
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        { width: 800, height: 800, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ],
      ...options
    };

    let uploadResult;
    
    if (Buffer.isBuffer(file)) {
      // Upload from buffer
      uploadResult = await cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) throw error;
          return result;
        }
      ).end(file);
    } else {
      // Upload from file path
      uploadResult = await cloudinary.uploader.upload(file, uploadOptions);
    }

    return {
      success: true,
      public_id: uploadResult.public_id,
      url: uploadResult.secure_url,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      size: uploadResult.bytes
    };

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      return {
        success: true,
        message: 'Image deleted successfully'
      };
    } else {
      throw new Error('Failed to delete image');
    }

  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

/**
 * Update image in Cloudinary (delete old, upload new)
 * @param {string} oldPublicId - Old image public ID
 * @param {Buffer|string} newFile - New file buffer or path
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Update result
 */
const updateImage = async (oldPublicId, newFile, options = {}) => {
  try {
    // Delete old image if it exists
    if (oldPublicId) {
      await deleteImage(oldPublicId);
    }

    // Upload new image
    const uploadResult = await uploadImage(newFile, options);

    return {
      success: true,
      oldPublicId,
      newPublicId: uploadResult.public_id,
      url: uploadResult.url
    };

  } catch (error) {
    console.error('Cloudinary update error:', error);
    throw new Error(`Failed to update image: ${error.message}`);
  }
};

/**
 * Generate optimized image URL with transformations
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} transformations - Image transformations
 * @returns {string} Optimized image URL
 */
const getOptimizedUrl = (publicId, transformations = {}) => {
  const defaultTransformations = {
    width: 400,
    height: 400,
    crop: 'fill',
    gravity: 'face',
    quality: 'auto',
    fetch_format: 'auto'
  };

  const finalTransformations = { ...defaultTransformations, ...transformations };
  
  return cloudinary.url(publicId, {
    transformation: [finalTransformations]
  });
};

/**
 * Get image information from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Image information
 */
const getImageInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    
    return {
      success: true,
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
      created_at: result.created_at
    };

  } catch (error) {
    console.error('Cloudinary get info error:', error);
    throw new Error(`Failed to get image info: ${error.message}`);
  }
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
  updateImage,
  getOptimizedUrl,
  getImageInfo
};
