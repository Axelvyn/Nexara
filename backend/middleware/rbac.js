const prisma = require('../config/database');

// Role hierarchy (higher number = more permissions)
const ROLE_HIERARCHY = {
  VIEWER: 1,
  DEVELOPER: 2,
  ADMIN: 3,
  OWNER: 4,
};

// Permission definitions
const PERMISSIONS = {
  // Project permissions
  PROJECT_READ: ['VIEWER', 'DEVELOPER', 'ADMIN', 'OWNER'],
  PROJECT_UPDATE: ['ADMIN', 'OWNER'],
  PROJECT_DELETE: ['OWNER'],
  PROJECT_MANAGE_MEMBERS: ['ADMIN', 'OWNER'],

  // Board permissions
  BOARD_READ: ['VIEWER', 'DEVELOPER', 'ADMIN', 'OWNER'],
  BOARD_CREATE: ['DEVELOPER', 'ADMIN', 'OWNER'],
  BOARD_UPDATE: ['ADMIN', 'OWNER'],
  BOARD_DELETE: ['ADMIN', 'OWNER'],

  // Issue permissions
  ISSUE_READ: ['VIEWER', 'DEVELOPER', 'ADMIN', 'OWNER'],
  ISSUE_CREATE: ['DEVELOPER', 'ADMIN', 'OWNER'],
  ISSUE_UPDATE: ['DEVELOPER', 'ADMIN', 'OWNER'],
  ISSUE_DELETE: ['ADMIN', 'OWNER'],
  ISSUE_ASSIGN: ['DEVELOPER', 'ADMIN', 'OWNER'],
  ISSUE_MOVE: ['DEVELOPER', 'ADMIN', 'OWNER'],
};

// Check if user has required permission
const hasPermission = (userRole, permission) => {
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;

  return allowedRoles.includes(userRole);
};

// Check if user role is higher than or equal to required role
const hasRole = (userRole, requiredRole) => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

// Get user's role in a project
const getUserProjectRole = async (userId, projectId) => {
  // Check if user is project owner
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId: userId,
    },
  });

  if (project) {
    return 'OWNER';
  }

  // Check if user is a project member
  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  return member ? member.role : null;
};

// Middleware to check project access
const checkProjectAccess = permission => {
  return async (req, res, next) => {
    try {
      const { projectId } = req.params;
      const userId = req.user.id;

      const userRole = await getUserProjectRole(userId, projectId);

      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not a member of this project.',
        });
      }

      if (!hasPermission(userRole, permission)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required permission: ${permission}`,
        });
      }

      // Add user role to request object for use in controllers
      req.userRole = userRole;
      next();
    } catch (error) {
      console.error('Project access check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking project access',
      });
    }
  };
};

// Middleware to check board access
const checkBoardAccess = permission => {
  return async (req, res, next) => {
    try {
      const { boardId } = req.params;
      const userId = req.user.id;

      // Get board with project information
      const board = await prisma.board.findFirst({
        where: { id: boardId },
        include: {
          project: true,
        },
      });

      if (!board) {
        return res.status(404).json({
          success: false,
          message: 'Board not found',
        });
      }

      const userRole = await getUserProjectRole(userId, board.project.id);

      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not a member of this project.',
        });
      }

      if (!hasPermission(userRole, permission)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required permission: ${permission}`,
        });
      }

      req.userRole = userRole;
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
};

// Middleware to check issue access
const checkIssueAccess = permission => {
  return async (req, res, next) => {
    try {
      const { issueId } = req.params;
      const userId = req.user.id;

      // Get issue with project information
      const issue = await prisma.issue.findFirst({
        where: { id: issueId },
        include: {
          column: {
            include: {
              board: {
                include: {
                  project: true,
                },
              },
            },
          },
        },
      });

      if (!issue) {
        return res.status(404).json({
          success: false,
          message: 'Issue not found',
        });
      }

      const userRole = await getUserProjectRole(
        userId,
        issue.column.board.project.id
      );

      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not a member of this project.',
        });
      }

      if (!hasPermission(userRole, permission)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required permission: ${permission}`,
        });
      }

      req.userRole = userRole;
      req.issue = issue;
      next();
    } catch (error) {
      console.error('Issue access check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking issue access',
      });
    }
  };
};

// Middleware to check minimum role requirement
const requireRole = requiredRole => {
  return async (req, res, next) => {
    try {
      const { projectId } = req.params;
      const userId = req.user.id;

      const userRole = await getUserProjectRole(userId, projectId);

      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not a member of this project.',
        });
      }

      if (!hasRole(userRole, requiredRole)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role: ${requiredRole} or higher`,
        });
      }

      req.userRole = userRole;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking user role',
      });
    }
  };
};

// Utility function to get project members with roles
const getProjectMembers = async projectId => {
  const members = await prisma.projectMember.findMany({
    where: { projectId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
          isActive: true,
        },
      },
    },
    orderBy: [{ role: 'desc' }, { joinedAt: 'asc' }],
  });

  // Add project owner to the list
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner: {
        select: {
          id: true,
          email: true,
          username: true,
          isActive: true,
        },
      },
    },
  });

  const ownerMember = {
    id: 'owner',
    role: 'OWNER',
    joinedAt: project.createdAt,
    user: project.owner,
  };

  return [ownerMember, ...members];
};

module.exports = {
  checkProjectAccess,
  checkBoardAccess,
  checkIssueAccess,
  requireRole,
  getUserProjectRole,
  getProjectMembers,
  hasPermission,
  hasRole,
  PERMISSIONS,
  ROLE_HIERARCHY,
};
