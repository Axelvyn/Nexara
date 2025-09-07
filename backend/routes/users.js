const express = require('express');
const router = express.Router();

const {
  getProfile,
  updateProfile,
  changePassword,
  deactivateAccount,
  getUserStats,
} = require('../controllers/userController');

const { protect } = require('../middleware/auth');
const { validateUserUpdate } = require('../middleware/validation');

// All routes are protected
router.use(protect);

// User profile routes
router.get('/profile', getProfile);
router.put('/profile', validateUserUpdate, updateProfile);
router.get('/stats', getUserStats);

// Password management
router.put('/change-password', changePassword);

// Account management
router.delete('/deactivate', deactivateAccount);

module.exports = router;
