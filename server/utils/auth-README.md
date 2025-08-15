# Authentication System Documentation

This document describes the complete authentication system implementation for the Tinder Clone application.

## Overview

The authentication system uses JWT (JSON Web Tokens) and bcrypt for secure user authentication and password hashing.

## Features

- ✅ User registration with validation
- ✅ Secure login with password comparison
- ✅ JWT token generation and verification
- ✅ Password hashing with bcrypt
- ✅ Protected route middleware
- ✅ Rate limiting for security
- ✅ Token refresh functionality
- ✅ Password change functionality
- ✅ User profile management
- ✅ Logout functionality

## Architecture

### Files Structure
```
server/
├── controllers/
│   └── authController.js      # Authentication logic
├── middleware/
│   └── auth.js               # JWT verification middleware
├── routes/
│   └── auth.js               # Authentication routes
├── utils/
│   ├── generateToken.js      # JWT token utilities
│   ├── testAuth.js          # Authentication tests
│   └── auth-README.md       # This documentation
└── server.js                # Express server with auth routes
```

## API Endpoints

### Public Endpoints

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "age": 25,
  "gender": "male",
  "interestedIn": "female"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "age": 25,
      "gender": "male",
      "interestedIn": "female",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

#### POST `/api/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "age": 25,
      "gender": "male",
      "interestedIn": "female",
      "isOnline": true,
      "lastActive": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

### Protected Endpoints

All protected endpoints require the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

#### GET `/api/auth/me`
Get current user profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "age": 25,
      "gender": "male",
      "interestedIn": "female",
      "bio": "Adventure seeker",
      "photos": [...],
      "location": {...},
      "preferences": {...},
      "isOnline": true,
      "lastActive": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### POST `/api/auth/logout`
Logout user (updates online status).

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### POST `/api/auth/refresh`
Refresh JWT token.

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "new_jwt_token_here"
  }
}
```

#### PUT `/api/auth/change-password`
Change user password.

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

## Security Features

### Password Hashing
- Uses bcrypt with 12 salt rounds
- Passwords are automatically hashed before saving
- Password comparison is done securely

### JWT Tokens
- Tokens expire in 30 days
- Include user ID and token type
- Verified on every protected request
- Support for refresh tokens

### Rate Limiting
- 5 requests per 15 minutes for auth endpoints
- 100 requests per 15 minutes for general endpoints
- Prevents brute force attacks

### Input Validation
- Email format validation
- Password strength requirements (minimum 6 characters)
- Age validation (minimum 18 years)
- Required field validation

## Middleware

### `protect`
Verifies JWT token and adds user to request object.

```javascript
const { protect } = require('../middleware/auth');

app.get('/protected-route', protect, (req, res) => {
  // req.user contains decoded token
});
```

### `optionalAuth`
Optional authentication that doesn't fail if no token provided.

```javascript
const { optionalAuth } = require('../middleware/auth');

app.get('/optional-route', optionalAuth, (req, res) => {
  // req.user may or may not exist
});
```

### `requirePremium`
Checks if user has premium subscription.

```javascript
const { requirePremium } = require('../middleware/auth');

app.get('/premium-route', protect, requirePremium, (req, res) => {
  // Only premium users can access
});
```

### `rateLimit`
Rate limiting middleware.

```javascript
const { rateLimit } = require('../middleware/auth');

const customRateLimit = rateLimit(10, 60 * 1000); // 10 requests per minute
app.use('/api', customRateLimit);
```

## Testing

### Run Authentication Tests
```bash
cd server
npm run test-auth
```

### Test Coverage
- User creation and validation
- Password hashing and comparison
- JWT token generation and verification
- Token expiration handling
- User methods and utilities
- Data cleanup

## Environment Variables

Create a `.env` file in the server directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/tinder-clone

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# Security
BCRYPT_SALT_ROUNDS=12
```

## Error Handling

The authentication system includes comprehensive error handling:

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: User not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server errors

## Best Practices

1. **Never store passwords in plain text**
2. **Use HTTPS in production**
3. **Rotate JWT secrets regularly**
4. **Implement proper logout on client side**
5. **Use refresh tokens for better security**
6. **Monitor failed login attempts**
7. **Implement account lockout after failed attempts**
8. **Use strong password requirements**

## Usage Examples

### Frontend Integration

```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    return data.data.user;
  }
};

// Protected request
const getProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/auth/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  return response.json();
};
```

### Backend Integration

```javascript
// Protect routes
app.get('/api/users', protect, userController.getUsers);

// Optional auth
app.get('/api/public-data', optionalAuth, (req, res) => {
  const isAuthenticated = !!req.user;
  // Handle both authenticated and anonymous users
});

// Premium features
app.post('/api/super-like', protect, requirePremium, matchController.superLike);
```

## Troubleshooting

### Common Issues

1. **Token Expired**: Use refresh token or re-login
2. **Invalid Token**: Check token format and secret
3. **Rate Limited**: Wait before making more requests
4. **Password Mismatch**: Verify password is correct
5. **User Not Found**: Check if user exists and is active

### Debug Mode

Set `NODE_ENV=development` to see detailed error messages.

## Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Social login (Google, Facebook)
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Account lockout after failed attempts
- [ ] Session management
- [ ] Audit logging
- [ ] OAuth 2.0 implementation 