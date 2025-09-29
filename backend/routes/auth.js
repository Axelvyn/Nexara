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

const prisma = require('../config/database');

// @desc    Check username availability
// @route   GET /api/auth/check-username/:username
// @access  Public (no authentication required)
const checkUsername = async (req, res) => {
  try {
    const { username } = req.params;

    // Basic validation
    if (!username || username.length < 3 || username.length > 30) {
      return res.status(400).json({
        success: false,
        message: 'Username must be between 3 and 30 characters',
        available: false,
      });
    }

    // Check username format
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return res.status(400).json({
        success: false,
        message: 'Username can only contain letters, numbers, underscores, and hyphens',
        available: false,
      });
    }

    // Check if username exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    const isAvailable = !existingUser;

    res.json({
      success: true,
      available: isAvailable,
      message: isAvailable 
        ? 'Username is available' 
        : 'Username is already taken',
      username,
    });
  } catch (error) {
    console.error('Check username error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking username availability',
      available: false,
    });
  }
};

// Public routes (no authentication required)
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);
router.post('/refresh', refreshToken);
router.get('/check-username/:username', checkUsername); // Public username check

// Protected routes
router.use(protect); // All routes below this middleware are protected
router.get('/me', getMe);
router.post('/logout', logout);

module.exports = router;
