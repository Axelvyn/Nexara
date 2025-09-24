const prisma = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user profile',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { email, username } = req.body;
    const userId = req.user.id;

    // Check if email or username is already taken by another user
    if (email || username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: userId } },
            {
              OR: [
                ...(email ? [{ email: email.toLowerCase() }] : []),
                ...(username ? [{ username }] : []),
              ],
            },
          ],
        },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message:
            existingUser.email === email?.toLowerCase()
              ? 'Email is already taken'
              : 'Username is already taken',
        });
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(email && { email: email.toLowerCase() }),
        ...(username && { username }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
    });
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get current user with password hash
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(
      currentPassword,
      user.passwordHash
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
    });
  }
};

// @desc    Deactivate account
// @route   DELETE /api/users/deactivate
// @access  Private
const deactivateAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Deactivate user account
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Account deactivated successfully',
    });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating account',
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });

    // Get additional stats from projects
    const projectStats = await prisma.project.findMany({
      where: { ownerId: userId },
      select: {
        _count: {
          select: {
            boards: true,
          },
        },
      },
    });

    const totalBoards = projectStats.reduce(
      (sum, project) => sum + project._count.boards,
      0
    );

    res.json({
      success: true,
      data: {
        stats: {
          totalProjects: stats._count.projects,
          totalBoards,
          accountCreated: req.user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user statistics',
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  deactivateAccount,
  getUserStats,
};
