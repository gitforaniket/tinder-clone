# User CRUD & Profile Upload API Documentation

This document describes the complete User CRUD operations and Profile Upload functionality for the Tinder Clone application.

## Overview

The User CRUD & Profile Upload API provides comprehensive user management capabilities including profile creation, updates, photo uploads, and search functionality with Cloudinary integration for image storage.

## Features

- ✅ Complete user CRUD operations
- ✅ Profile photo upload with Cloudinary
- ✅ Multiple photo management
- ✅ Photo reordering and primary photo selection
- ✅ User search and filtering
- ✅ Profile preferences management
- ✅ File upload validation with Multer
- ✅ Image optimization and transformation
- ✅ Secure file handling

## Architecture

### Files Structure
```
server/
├── config/
│   └── cloudinary.js          # Cloudinary configuration
├── controllers/
│   └── userController.js      # User CRUD logic
├── middleware/
│   └── upload.js             # Multer file upload middleware
├── routes/
│   └── users.js              # User routes
├── utils/
│   ├── testUserCRUD.js       # User CRUD tests
│   └── user-crud-README.md   # This documentation
└── server.js                 # Express server with user routes
```

## API Endpoints

### User Management

#### GET `/api/users`
Get all users with pagination and filters.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `gender` (string): Filter by gender
- `minAge` (number): Minimum age filter
- `maxAge` (number): Maximum age filter

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "user_id",
        "name": "John Doe",
        "age": 25,
        "gender": "male",
        "bio": "Adventure seeker",
        "photos": [...],
        "location": {...},
        "isOnline": true,
        "lastActive": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

#### GET `/api/users/:id`
Get user by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "age": 25,
      "gender": "male",
      "bio": "Adventure seeker",
      "job": "Software Engineer",
      "education": "Computer Science",
      "interests": ["hiking", "photography"],
      "photos": [...],
      "location": {...},
      "preferences": {...}
    }
  }
}
```

#### GET `/api/users/search`
Search users with text and filters.

**Query Parameters:**
- `q` (string): Search query
- `gender` (string): Filter by gender
- `minAge` (number): Minimum age
- `maxAge` (number): Maximum age
- `location` (string): Location search
- `page` (number): Page number
- `limit` (number): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {...}
  }
}
```

### Profile Management

#### PUT `/api/users/profile`
Update user profile.

**Request Body:**
```json
{
  "name": "John Doe",
  "bio": "Updated bio",
  "age": 26,
  "gender": "male",
  "interestedIn": "female",
  "job": "Senior Software Engineer",
  "education": "Computer Science",
  "interests": ["hiking", "photography", "travel"],
  "location": {
    "type": "Point",
    "coordinates": [-122.4194, 37.7749],
    "address": "San Francisco, CA"
  },
  "preferences": {
    "ageRange": { "min": 22, "max": 30 },
    "distance": 50,
    "showMen": false,
    "showWomen": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "bio": "Updated bio",
      "age": 26,
      "gender": "male",
      "interestedIn": "female",
      "job": "Senior Software Engineer",
      "education": "Computer Science",
      "interests": ["hiking", "photography", "travel"],
      "location": {...},
      "preferences": {...}
    }
  }
}
```

#### DELETE `/api/users/profile`
Delete user account.

**Response:**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

### Photo Management

#### POST `/api/users/profile/photo`
Upload single profile photo.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `photo` (file)

**Response:**
```json
{
  "success": true,
  "message": "Profile photo uploaded successfully",
  "data": {
    "photo": {
      "_id": "photo_id",
      "url": "https://res.cloudinary.com/...",
      "publicId": "tinder-clone/profiles/user_id/profile_1234567890",
      "isPrimary": true,
      "order": 0
    },
    "totalPhotos": 1
  }
}
```

#### POST `/api/users/profile/photos`
Upload multiple profile photos.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `photos` (files array, max 6)

**Response:**
```json
{
  "success": true,
  "message": "3 photos uploaded successfully",
  "data": {
    "photos": [
      {
        "_id": "photo_id_1",
        "url": "https://res.cloudinary.com/...",
        "publicId": "tinder-clone/profiles/user_id/photo_1234567890_0",
        "isPrimary": true,
        "order": 0
      },
      {
        "_id": "photo_id_2",
        "url": "https://res.cloudinary.com/...",
        "publicId": "tinder-clone/profiles/user_id/photo_1234567890_1",
        "isPrimary": false,
        "order": 1
      }
    ],
    "totalPhotos": 2
  }
}
```

#### DELETE `/api/users/profile/photo/:photoId`
Delete profile photo.

**Response:**
```json
{
  "success": true,
  "message": "Photo deleted successfully",
  "data": {
    "deletedPhotoId": "photo_id",
    "totalPhotos": 1
  }
}
```

#### PUT `/api/users/profile/photo/:photoId/primary`
Set photo as primary.

**Response:**
```json
{
  "success": true,
  "message": "Primary photo updated successfully",
  "data": {
    "primaryPhotoId": "photo_id"
  }
}
```

#### PUT `/api/users/profile/photos/reorder`
Reorder photos.

**Request Body:**
```json
{
  "photoIds": ["photo_id_1", "photo_id_2", "photo_id_3"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Photos reordered successfully",
  "data": {
    "photos": [
      {
        "_id": "photo_id_1",
        "order": 0
      },
      {
        "_id": "photo_id_2",
        "order": 1
      },
      {
        "_id": "photo_id_3",
        "order": 2
      }
    ]
  }
}
```

## Cloudinary Integration

### Configuration
The system uses Cloudinary for image storage and optimization:

```javascript
// Environment variables required:
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Features
- **Automatic Optimization**: Images are automatically optimized for web
- **Face Detection**: Primary photos are cropped to focus on faces
- **Multiple Formats**: Supports JPEG, PNG, GIF, WebP
- **Secure URLs**: All images served over HTTPS
- **Folder Organization**: Images organized by user ID
- **Automatic Cleanup**: Old images deleted when replaced

### Image Transformations
- **Size**: 800x800 pixels maximum
- **Crop**: Fill with face detection
- **Quality**: Auto-optimized
- **Format**: Auto-converted to best format

## File Upload with Multer

### Configuration
- **Storage**: Memory storage (for Cloudinary uploads)
- **File Size**: 5MB maximum per file
- **File Count**: 6 files maximum per request
- **Allowed Types**: JPEG, PNG, GIF, WebP

### Validation
- File type validation
- File size validation
- File count validation
- Error handling for invalid uploads

### Error Handling
```json
{
  "success": false,
  "message": "File too large. Maximum size is 5MB."
}
```

## Security Features

### File Upload Security
- File type validation
- File size limits
- Secure file handling
- No direct file system access

### Data Protection
- Password excluded from responses
- Email excluded from public endpoints
- User data validation
- Input sanitization

### Access Control
- All endpoints require authentication
- User can only modify their own profile
- Photo ownership validation
- Account deletion cleanup

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Invalid input data"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "User not found"
}
```

**413 Payload Too Large:**
```json
{
  "success": false,
  "message": "File too large. Maximum size is 5MB."
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Server error while processing request"
}
```

## Testing

### Run User CRUD Tests
```bash
cd server
npm run test-user-crud
```

### Test Coverage
- User creation and validation
- Profile updates
- Photo management
- Search functionality
- Cloudinary integration
- File upload validation
- Error handling

## Environment Variables

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# File Upload Limits
MAX_FILE_SIZE=5242880
MAX_FILES=6

# Server Configuration
PORT=5000
NODE_ENV=development
```

## Usage Examples

### Frontend Integration

```javascript
// Upload single photo
const uploadPhoto = async (file) => {
  const formData = new FormData();
  formData.append('photo', file);

  const response = await fetch('/api/users/profile/photo', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return response.json();
};

// Update profile
const updateProfile = async (profileData) => {
  const response = await fetch('/api/users/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });

  return response.json();
};

// Search users
const searchUsers = async (query, filters) => {
  const params = new URLSearchParams({
    q: query,
    ...filters
  });

  const response = await fetch(`/api/users/search?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.json();
};
```

### Backend Integration

```javascript
// Protect user routes
app.use('/api/users', protect, userRoutes);

// Custom photo upload middleware
app.post('/api/custom-upload', 
  uploadProfilePhoto, 
  validateUploadedFiles, 
  customUploadHandler
);

// User search with filters
app.get('/api/users/search', protect, (req, res) => {
  const { q, gender, minAge, maxAge } = req.query;
  // Implement search logic
});
```

## Best Practices

1. **File Upload**
   - Always validate file types and sizes
   - Use secure file handling
   - Implement proper error handling
   - Clean up unused files

2. **User Data**
   - Validate all input data
   - Sanitize user inputs
   - Protect sensitive information
   - Implement proper access control

3. **Image Management**
   - Optimize images for web
   - Use CDN for fast delivery
   - Implement proper cleanup
   - Handle upload failures gracefully

4. **API Design**
   - Use consistent response format
   - Implement proper pagination
   - Provide meaningful error messages
   - Use appropriate HTTP status codes

## Troubleshooting

### Common Issues

1. **Upload Failures**
   - Check Cloudinary credentials
   - Verify file size limits
   - Check file type restrictions
   - Ensure proper form data

2. **Photo Management**
   - Verify photo ownership
   - Check primary photo logic
   - Ensure proper ordering
   - Handle deletion cleanup

3. **Search Issues**
   - Check query parameters
   - Verify filter logic
   - Ensure proper indexing
   - Handle empty results

### Debug Mode
Set `NODE_ENV=development` to see detailed error messages.

## Future Enhancements

- [ ] Image compression optimization
- [ ] Advanced search filters
- [ ] Photo editing capabilities
- [ ] Bulk photo operations
- [ ] Image watermarking
- [ ] Photo verification system
- [ ] Advanced user analytics
- [ ] Photo backup system 