const prisma = require('../config/database');
const { getUserProjectRole, getProjectMembers } = require('../middleware/rbac');

// @desc    Get all projects for user (owned + member)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const userId = req.user.id;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause to include owned projects and projects where user is a member
    const where = {
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      ...(search && {
        AND: [
          {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          },
        ],
      }),
    };

    // Get projects with pagination
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { updatedAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
          _count: {
            select: {
              boards: true,
              members: true,
            },
          },
        },
      }),
      prisma.project.count({ where }),
    ]);

    // Add user role to each project
    const projectsWithRoles = await Promise.all(
      projects.map(async project => {
        const userRole = await getUserProjectRole(userId, project.id);
        return {
          ...project,
          userRole,
        };
      })
    );

    res.json({
      success: true,
      data: {
        projects: projectsWithRoles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting projects',
    });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:projectId
// @access  Private
const getProject = async (req, res) => {
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

    const project = await prisma.project.findFirst({
      where: {
        OR: [
          { id: projectId, ownerId: userId },
          { id: projectId, members: { some: { userId } } },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        boards: {
          include: {
            _count: {
              select: {
                columns: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: {
            boards: true,
            members: true,
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.json({
      success: true,
      data: {
        project: {
          ...project,
          userRole,
        },
      },
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting project',
    });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: userId,
      },
      include: {
        _count: {
          select: {
            boards: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project },
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating project',
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:projectId
// @access  Private
const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description } = req.body;
    const userId = req.user.id;

    // Check if project exists and user owns it
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId,
      },
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
      include: {
        _count: {
          select: {
            boards: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project },
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating project',
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:projectId
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Check if project exists and user owns it
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId,
      },
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Delete project (cascade will handle boards and columns)
    await prisma.project.delete({
      where: { id: projectId },
    });

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting project',
    });
  }
};

// @desc    Get project statistics
// @route   GET /api/projects/:projectId/stats
// @access  Private
const getProjectStats = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Check if project exists and user owns it
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Get project statistics
    const stats = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        _count: {
          select: {
            boards: true,
          },
        },
      },
    });

    // Get board statistics
    const boardStats = await prisma.board.findMany({
      where: { projectId },
      select: {
        _count: {
          select: {
            columns: true,
          },
        },
      },
    });

    const totalColumns = boardStats.reduce(
      (sum, board) => sum + board._count.columns,
      0
    );

    res.json({
      success: true,
      data: {
        stats: {
          totalBoards: stats._count.boards,
          totalColumns,
          projectCreated: project.createdAt,
          lastUpdated: project.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Get project stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting project statistics',
    });
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
};
