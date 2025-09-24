const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = payload => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Generate refresh token
const generateRefreshToken = payload => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
};

// Verify JWT token
const verifyToken = token => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Verify refresh token
const verifyRefreshToken = token => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

// Decode token without verification (for debugging)
const decodeToken = token => {
  return jwt.decode(token);
};

// Get token from request headers
const getTokenFromHeader = req => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  decodeToken,
  getTokenFromHeader,
};
