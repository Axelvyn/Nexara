const prisma = require('../config/database');
const {
  getProjectMembers,
  getUserProjectRole,
  hasRole,
} = require('../middleware/rbac');

// @desc    Get project members
// @route   GET /api/projects/:projectId/members
// @access  Private (Project members only)
const getMembers = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Check if user has access to project
    const userRole = await getUserProjectRole(userId, projectId);
    if (!userRole) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this project.',
      });
    }

    const members = await getProjectMembers(projectId);

    res.json({
      success: true,
      data: { members },
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting project members',
    });
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:projectId/members
// @access  Private (Admin/Owner only)
const addMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email, role = 'VIEWER' } = req.body;
    const userId = req.user.id;

    // Check if user has permission to add members
    const userRole = await getUserProjectRole(userId, projectId);
    if (!userRole || !hasRole(userRole, 'ADMIN')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins and owners can add members.',
      });
    }

    // Find user by email
    const userToAdd = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!userToAdd.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot add inactive user to project',
      });
    }

    // Check if user is already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: userToAdd.id,
        },
      },
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this project',
      });
    }

    // Check if user is the project owner
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: userToAdd.id,
      },
    });

    if (project) {
      return res.status(400).json({
        success: false,
        message: 'User is already the project owner',
      });
    }

    // Add member to project
    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId: userToAdd.id,
        role,
      },
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
    });

    res.status(201).json({
      success: true,
      message: 'Member added successfully',
      data: { member },
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding member to project',
    });
  }
};

// @desc    Update member role
// @route   PUT /api/projects/:projectId/members/:memberId
// @access  Private (Admin/Owner only)
const updateMemberRole = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;
    const { role } = req.body;
    const userId = req.user.id;

    // Check if user has permission to update member roles
    const userRole = await getUserProjectRole(userId, projectId);
    if (!userRole || !hasRole(userRole, 'ADMIN')) {
      return res.status(403).json({
        success: false,
        message:
          'Access denied. Only admins and owners can update member roles.',
      });
    }

    // Check if member exists
    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: memberId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    // Prevent changing owner role (owners are managed separately)
    if (member.role === 'OWNER') {
      return res.status(400).json({
        success: false,
        message: 'Cannot change owner role',
      });
    }

    // Update member role
    const updatedMember = await prisma.projectMember.update({
      where: {
        projectId_userId: {
          projectId,
          userId: memberId,
        },
      },
      data: { role },
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
    });

    res.json({
      success: true,
      message: 'Member role updated successfully',
      data: { member: updatedMember },
    });
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating member role',
    });
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:projectId/members/:memberId
// @access  Private (Admin/Owner only)
const removeMember = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;
    const userId = req.user.id;

    // Check if user has permission to remove members
    const userRole = await getUserProjectRole(userId, projectId);
    if (!userRole || !hasRole(userRole, 'ADMIN')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins and owners can remove members.',
      });
    }

    // Check if member exists
    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: memberId,
        },
      },
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    // Prevent removing owner (owners are managed separately)
    if (member.role === 'OWNER') {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove project owner',
      });
    }

    // Remove member from project
    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId: memberId,
        },
      },
    });

    res.json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing member from project',
    });
  }
};

// @desc    Leave project
// @route   DELETE /api/projects/:projectId/members/leave
// @access  Private (Project members only)
const leaveProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Check if user is a member
    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'You are not a member of this project',
      });
    }

    // Check if user is the project owner
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId,
      },
    });

    if (project) {
      return res.status(400).json({
        success: false,
        message:
          'Project owners cannot leave their own project. Transfer ownership first.',
      });
    }

    // Remove member from project
    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    res.json({
      success: true,
      message: 'You have left the project successfully',
    });
  } catch (error) {
    console.error('Leave project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error leaving project',
    });
  }
};

// @desc    Transfer project ownership
// @route   PUT /api/projects/:projectId/transfer-ownership
// @access  Private (Owner only)
const transferOwnership = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { newOwnerEmail } = req.body;
    const userId = req.user.id;

    // Check if user is the project owner
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId,
      },
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only project owners can transfer ownership.',
      });
    }

    // Find new owner by email
    const newOwner = await prisma.user.findUnique({
      where: { email: newOwnerEmail.toLowerCase() },
    });

    if (!newOwner) {
      return res.status(404).json({
        success: false,
        message: 'New owner not found',
      });
    }

    if (!newOwner.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot transfer ownership to inactive user',
      });
    }

    // Check if new owner is already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: newOwner.id,
        },
      },
    });

    // Use transaction to ensure data consistency
    await prisma.$transaction(async tx => {
      // Update project owner
      await tx.project.update({
        where: { id: projectId },
        data: { ownerId: newOwner.id },
      });

      // If new owner was a member, remove them from members table
      if (existingMember) {
        await tx.projectMember.delete({
          where: {
            projectId_userId: {
              projectId,
              userId: newOwner.id,
            },
          },
        });
      }

      // Add old owner as admin member
      await tx.projectMember.create({
        data: {
          projectId,
          userId,
          role: 'ADMIN',
        },
      });
    });

    res.json({
      success: true,
      message: 'Project ownership transferred successfully',
    });
  } catch (error) {
    console.error('Transfer ownership error:', error);
    res.status(500).json({
      success: false,
      message: 'Error transferring project ownership',
    });
  }
};

module.exports = {
  getMembers,
  addMember,
  updateMemberRole,
  removeMember,
  leaveProject,
  transferOwnership,
};
