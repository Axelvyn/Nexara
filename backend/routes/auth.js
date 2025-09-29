const express = require('express');
const router = express.Router();

const {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  verifyEmail,
  resendOTP,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin,
} = require('../middleware/validation');

const prisma = require('../config/database');

// @desc    Check email availability
// @route   GET /api/auth/check-email/:email
// @access  Public (no authentication required)
const checkEmail = async (req, res) => {
  try {
    const { email } = req.params;

    // Basic validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
        available: false,
      });
    }

    // Normalize email to lowercase for case-insensitive checks
    const normalizedEmail = email.toLowerCase().trim();

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
        available: false,
      });
    }

    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    const isAvailable = !existingUser;

    res.json({
      success: true,
      available: isAvailable,
      message: isAvailable
        ? 'Email is available'
        : 'Email is already registered',
      email: normalizedEmail,
    });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking email availability',
      available: false,
    });
  }
};

// @desc    Check username availability
// @route   GET /api/auth/check-username/:username
// @access  Public (no authentication required)
const checkUsername = async (req, res) => {
  try {
    // Normalize input to lowercase for case-insensitive checks
    const raw = req.params.username || '';
    const username = raw.toLowerCase();

    // Basic validation
    if (!username || username.length < 3 || username.length > 30) {
      return res.status(400).json({
        success: false,
        message: 'Username must be between 3 and 30 characters',
        available: false,
      });
    }

    // Check username format (only lowercase letters, numbers, underscores, hyphens)
    if (!/^[a-z0-9_-]+$/.test(username)) {
      return res.status(400).json({
        success: false,
        message:
          'Username can only contain lowercase letters, numbers, underscores, and hyphens',
        available: false,
      });
    }

    // Lookup using lowercase username
    const existingUser = await prisma.user.findFirst({
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
  } catch (err) {
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
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);
router.get('/check-username/:username', checkUsername); // Public username check
router.get('/check-email/:email', checkEmail); // Public email check

// Password reset routes (public)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.use(protect); // All routes below this middleware are protected
router.get('/me', getMe);
router.post('/logout', logout);

module.exports = router;
