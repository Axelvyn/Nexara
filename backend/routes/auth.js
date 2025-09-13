const express = require('express');
const router = express.Router();

const {
  register,
  login,
  refreshToken,
  logout,
  getMe,
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin,
} = require('../middleware/validation');

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);
router.post('/refresh', refreshToken);

// Protected routes
router.use(protect); // All routes below this middleware are protected
router.get('/me', getMe);
router.post('/logout', logout);

module.exports = router;
