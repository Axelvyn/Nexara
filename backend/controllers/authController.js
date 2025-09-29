const prisma = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken, generateRefreshToken } = require('../utils/jwt');
const emailService = require('../services/emailService');
const tempUserStorage = require('../services/tempUserStorage');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { email, password, username, firstName, lastName } = req.body;

    // Check if user already exists in database
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, { username }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.email === email.toLowerCase()
            ? 'User with this email already exists'
            : 'Username is already taken',
      });
    }

    // Check if user is already in temporary storage (pending verification)
    const tempUser = tempUserStorage.get(email);
    if (tempUser) {
      return res.status(400).json({
        success: false,
        message:
          'Registration already in progress. Please check your email for verification code or try again later.',
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate OTP for email verification
    const otp = emailService.generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Store user data temporarily (not in main database yet)
    tempUserStorage.store(
      email.toLowerCase(),
      {
        email: email.toLowerCase(),
        passwordHash,
        username,
        firstName,
        lastName,
      },
      {
        emailVerificationOtp: otp,
        otpExpiresAt,
      }
    );

    // Send verification email
    try {
      await emailService.sendVerificationEmail(email, firstName, otp);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Remove from temp storage if email fails
      tempUserStorage.remove(email);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.',
      });
    }

    res.status(201).json({
      success: true,
      message:
        'Registration initiated. Please check your email for verification code.',
      data: {
        email: email.toLowerCase(),
        requiresEmailVerification: true,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: email }, // Allow login with username in the email field
        ],
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        passwordHash: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address before logging in',
        requiresEmailVerification: true,
        email: user.email,
      });
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate tokens
    const token = generateToken({ id: user.id });
    const refreshToken = generateRefreshToken({ id: user.id });

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
    });
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    // Verify refresh token
    const { verifyRefreshToken } = require('../utils/jwt');
    const decoded = verifyRefreshToken(refreshToken);

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        username: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    // Generate new tokens
    const newToken = generateToken({ id: user.id });
    const newRefreshToken = generateRefreshToken({ id: user.id });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        user,
        token: newToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success message
    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging out',
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
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
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user information',
    });
  }
};

// @desc    Verify email with OTP
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    // Get user data from temporary storage
    const tempUser = tempUserStorage.get(email.toLowerCase());

    if (!tempUser) {
      return res.status(400).json({
        success: false,
        message:
          'No pending registration found for this email. Please register again.',
      });
    }

    // Check if OTP is valid and not expired
    if (tempUser.emailVerificationOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code',
      });
    }

    if (new Date() > tempUser.otpExpiresAt) {
      // Remove expired temporary data
      tempUserStorage.remove(email.toLowerCase());
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please register again.',
      });
    }

    // Create the actual user in the database
    const user = await prisma.user.create({
      data: {
        email: tempUser.email,
        passwordHash: tempUser.passwordHash,
        username: tempUser.username,
        firstName: tempUser.firstName,
        lastName: tempUser.lastName,
        isEmailVerified: true,
        emailVerificationOtp: null,
        otpExpiresAt: null,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    // Remove from temporary storage
    tempUserStorage.remove(email.toLowerCase());

    // Generate tokens
    const accessToken = generateToken({ id: user.id });
    const refreshToken = generateRefreshToken({ id: user.id });

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user.email, user.firstName);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail verification if welcome email fails
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! Welcome to Nexara!',
      data: {
        user,
        token: accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Email verification error:', error);

    // Handle unique constraint violations (in case of race conditions)
    if (error.code === 'P2002') {
      const field = error.meta?.target?.includes('email')
        ? 'email'
        : 'username';
      return res.status(400).json({
        success: false,
        message: `A user with this ${field} already exists. Please try logging in instead.`,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error verifying email',
    });
  }
};

// @desc    Resend OTP for email verification
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Check if user is in temporary storage (pending verification)
    const tempUser = tempUserStorage.get(email.toLowerCase());

    if (!tempUser) {
      // Check if user already exists and is verified
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser && existingUser.isEmailVerified) {
        return res.status(400).json({
          success: false,
          message: 'Email is already verified. Please login instead.',
        });
      }

      return res.status(400).json({
        success: false,
        message:
          'No pending registration found for this email. Please register again.',
      });
    }

    // Generate new OTP
    const newOtp = emailService.generateOTP();
    const newOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Update OTP in temporary storage
    tempUserStorage.updateOtp(email.toLowerCase(), newOtp, newOtpExpiresAt);

    // Send new verification email
    try {
      await emailService.sendVerificationEmail(
        tempUser.email,
        tempUser.firstName,
        newOtp
      );
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'New verification code sent successfully',
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resending verification code',
    });
  }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message:
          'If an account with that email exists, we sent a password reset link',
      });
    }

    // Generate reset token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiry: resetExpiry,
      },
    });

    // TODO: Send reset email (implement email service)
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({
      success: true,
      message:
        'If an account with that email exists, we sent a password reset link',
      // Remove this in production - only for development
      resetToken:
        process.env.NODE_ENV === 'development' ? resetToken : undefined,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing password reset request',
    });
  }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiry: {
          gt: new Date(), // Token not expired
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Hash new password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });

    res.json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  verifyEmail,
  resendOTP,
  forgotPassword,
  resetPassword,
};
