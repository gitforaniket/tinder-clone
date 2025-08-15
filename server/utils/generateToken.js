const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for user authentication
 * @param {string} userId - User ID to encode in token
 * @param {string} type - Token type ('access' or 'refresh')
 * @returns {string} JWT token
 */
const generateToken = (userId, type = 'access') => {
  const secret = type === 'refresh' 
    ? process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    : process.env.JWT_SECRET;

  const expiresIn = type === 'refresh' ? '7d' : '30d';

  return jwt.sign(
    { 
      userId,
      type,
      iat: Math.floor(Date.now() / 1000)
    },
    secret,
    {
      expiresIn,
      issuer: 'tinder-clone',
      audience: 'tinder-clone-users'
    }
  );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @param {string} type - Token type ('access' or 'refresh')
 * @returns {object} Decoded token payload
 */
const verifyToken = (token, type = 'access') => {
  const secret = type === 'refresh' 
    ? process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    : process.env.JWT_SECRET;

  return jwt.verify(token, secret, {
    issuer: 'tinder-clone',
    audience: 'tinder-clone-users'
  });
};

/**
 * Decode JWT token without verification (for debugging)
 * @param {string} token - JWT token to decode
 * @returns {object} Decoded token payload
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

/**
 * Check if token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} True if token is expired
 */
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date|null} Expiration date or null if invalid
 */
const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return null;
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

/**
 * Generate token pair (access + refresh)
 * @param {string} userId - User ID
 * @returns {object} Object containing access and refresh tokens
 */
const generateTokenPair = (userId) => {
  return {
    accessToken: generateToken(userId, 'access'),
    refreshToken: generateToken(userId, 'refresh')
  };
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
  isTokenExpired,
  getTokenExpiration,
  generateTokenPair
};
