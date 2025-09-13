const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          username: true,
          isActive: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found',
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user account is deactivated',
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token',
    });
  }
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          username: true,
          isActive: true,
        },
      });

      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Silently fail for optional auth
      console.log('Optional auth failed:', error.message);
    }
  }

  next();
};

// Check if user is project owner or has access
const checkProjectAccess = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId,
      },
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this project',
      });
    }

    req.project = project;
    next();
  } catch (error) {
    console.error('Project access check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking project access',
    });
  }
};

// Check if user is board owner or has access
const checkBoardAccess = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const userId = req.user.id;

    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        project: {
          ownerId: userId,
        },
      },
      include: {
        project: true,
      },
    });

    if (!board) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this board',
      });
    }

    req.board = board;
    next();
  } catch (error) {
    console.error('Board access check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking board access',
    });
  }
};

module.exports = {
  protect,
  optionalAuth,
  checkProjectAccess,
  checkBoardAccess,
};
