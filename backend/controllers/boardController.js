const prisma = require('../config/database');

// @desc    Get all boards for a project
// @route   GET /api/boards/project/:projectId
// @access  Private
const getBoardsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 10, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Verify project ownership
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

    // Build where clause
    const where = {
      projectId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Get boards with pagination
    const [boards, total] = await Promise.all([
      prisma.board.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'asc' },
        include: {
          _count: {
            select: {
              columns: true,
            },
          },
        },
      }),
      prisma.board.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        boards,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get boards by project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting boards',
    });
  }
};

// @desc    Get single board
// @route   GET /api/boards/:boardId
// @access  Private
const getBoard = async (req, res) => {
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
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        columns: {
          orderBy: { orderIndex: 'asc' },
          include: {
            _count: {
              select: {
                issues: true,
              },
            },
          },
        },
        _count: {
          select: {
            columns: true,
          },
        },
      },
    });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    res.json({
      success: true,
      data: { board },
    });
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting board',
    });
  }
};

// @desc    Create new board
// @route   POST /api/boards
// @access  Private
const createBoard = async (req, res) => {
  try {
    const { name, description, projectId } = req.body;
    const userId = req.user.id;

    // Verify project ownership
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

    const board = await prisma.board.create({
      data: {
        name,
        description,
        projectId,
      },
      include: {
        _count: {
          select: {
            columns: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Board created successfully',
      data: { board },
    });
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating board',
    });
  }
};

// @desc    Update board
// @route   PUT /api/boards/:boardId
// @access  Private
const updateBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { name, description } = req.body;
    const userId = req.user.id;

    // Check if board exists and user owns the project
    const existingBoard = await prisma.board.findFirst({
      where: {
        id: boardId,
        project: {
          ownerId: userId,
        },
      },
    });

    if (!existingBoard) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    const board = await prisma.board.update({
      where: { id: boardId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
      include: {
        _count: {
          select: {
            columns: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Board updated successfully',
      data: { board },
    });
  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating board',
    });
  }
};

// @desc    Delete board
// @route   DELETE /api/boards/:boardId
// @access  Private
const deleteBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const userId = req.user.id;

    // Check if board exists and user owns the project
    const existingBoard = await prisma.board.findFirst({
      where: {
        id: boardId,
        project: {
          ownerId: userId,
        },
      },
    });

    if (!existingBoard) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    // Delete board (cascade will handle columns)
    await prisma.board.delete({
      where: { id: boardId },
    });

    res.json({
      success: true,
      message: 'Board deleted successfully',
    });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting board',
    });
  }
};

// @desc    Get board statistics
// @route   GET /api/boards/:boardId/stats
// @access  Private
const getBoardStats = async (req, res) => {
  try {
    const { boardId } = req.params;
    const userId = req.user.id;

    // Check if board exists and user owns the project
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        project: {
          ownerId: userId,
        },
      },
    });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    // Get board statistics
    const stats = await prisma.board.findUnique({
      where: { id: boardId },
      select: {
        _count: {
          select: {
            columns: true,
          },
        },
      },
    });

    // Get column statistics
    const columnStats = await prisma.column.findMany({
      where: { boardId },
      select: {
        _count: {
          select: {
            issues: true,
          },
        },
      },
    });

    const totalIssues = columnStats.reduce(
      (sum, column) => sum + column._count.issues,
      0
    );

    res.json({
      success: true,
      data: {
        stats: {
          totalColumns: stats._count.columns,
          totalIssues,
          boardCreated: board.createdAt,
          lastUpdated: board.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Get board stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting board statistics',
    });
  }
};

module.exports = {
  getBoardsByProject,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  getBoardStats,
};
