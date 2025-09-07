const prisma = require('../config/database');

// @desc    Get all issues for a column
// @route   GET /api/issues/column/:columnId
// @access  Private
const getIssuesByColumn = async (req, res) => {
  try {
    const { columnId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 10, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Verify column access through project ownership
    const column = await prisma.column.findFirst({
      where: {
        id: columnId,
        board: {
          project: {
            ownerId: userId,
          },
        },
      },
    });

    if (!column) {
      return res.status(404).json({
        success: false,
        message: 'Column not found',
      });
    }

    // Build where clause
    const where = {
      columnId,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Get issues with pagination
    const [issues, total] = await Promise.all([
      prisma.issue.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          assignee: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
          reporter: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
        },
      }),
      prisma.issue.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        issues,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get issues by column error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting issues',
    });
  }
};

// @desc    Get single issue
// @route   GET /api/issues/:issueId
// @access  Private
const getIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    const userId = req.user.id;

    const issue = await prisma.issue.findFirst({
      where: {
        id: issueId,
        column: {
          board: {
            project: {
              ownerId: userId,
            },
          },
        },
      },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        reporter: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        column: {
          select: {
            id: true,
            name: true,
            board: {
              select: {
                id: true,
                name: true,
                project: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
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

    res.json({
      success: true,
      data: { issue },
    });
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting issue',
    });
  }
};

// @desc    Create new issue
// @route   POST /api/issues
// @access  Private
const createIssue = async (req, res) => {
  try {
    const { title, description, type, priority, columnId, assigneeId } =
      req.body;
    const userId = req.user.id;

    // Verify column access through project ownership
    const column = await prisma.column.findFirst({
      where: {
        id: columnId,
        board: {
          project: {
            ownerId: userId,
          },
        },
      },
    });

    if (!column) {
      return res.status(404).json({
        success: false,
        message: 'Column not found',
      });
    }

    // Verify assignee exists if provided
    if (assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: assigneeId },
      });

      if (!assignee) {
        return res.status(400).json({
          success: false,
          message: 'Assignee not found',
        });
      }
    }

    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        type: type || 'TASK',
        priority: priority || 'MEDIUM',
        columnId,
        assigneeId: assigneeId || null,
        reporterId: userId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        reporter: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: { issue },
    });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating issue',
    });
  }
};

// @desc    Update issue
// @route   PUT /api/issues/:issueId
// @access  Private
const updateIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { title, description, type, priority, status, assigneeId } = req.body;
    const userId = req.user.id;

    // Check if issue exists and user has access
    const existingIssue = await prisma.issue.findFirst({
      where: {
        id: issueId,
        column: {
          board: {
            project: {
              ownerId: userId,
            },
          },
        },
      },
    });

    if (!existingIssue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    // Verify assignee exists if provided
    if (assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: assigneeId },
      });

      if (!assignee) {
        return res.status(400).json({
          success: false,
          message: 'Assignee not found',
        });
      }
    }

    const issue = await prisma.issue.update({
      where: { id: issueId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(type && { type }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(assigneeId !== undefined && { assigneeId }),
      },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        reporter: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Issue updated successfully',
      data: { issue },
    });
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating issue',
    });
  }
};

// @desc    Delete issue
// @route   DELETE /api/issues/:issueId
// @access  Private
const deleteIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    const userId = req.user.id;

    // Check if issue exists and user has access
    const existingIssue = await prisma.issue.findFirst({
      where: {
        id: issueId,
        column: {
          board: {
            project: {
              ownerId: userId,
            },
          },
        },
      },
    });

    if (!existingIssue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    // Delete issue
    await prisma.issue.delete({
      where: { id: issueId },
    });

    res.json({
      success: true,
      message: 'Issue deleted successfully',
    });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting issue',
    });
  }
};

// @desc    Move issue to different column
// @route   PATCH /api/issues/:issueId/move
// @access  Private
const moveIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { columnId } = req.body;
    const userId = req.user.id;

    // Check if issue exists and user has access
    const existingIssue = await prisma.issue.findFirst({
      where: {
        id: issueId,
        column: {
          board: {
            project: {
              ownerId: userId,
            },
          },
        },
      },
    });

    if (!existingIssue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    // Verify target column exists and user has access
    const targetColumn = await prisma.column.findFirst({
      where: {
        id: columnId,
        board: {
          project: {
            ownerId: userId,
          },
        },
      },
    });

    if (!targetColumn) {
      return res.status(404).json({
        success: false,
        message: 'Target column not found',
      });
    }

    const issue = await prisma.issue.update({
      where: { id: issueId },
      data: { columnId },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        reporter: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Issue moved successfully',
      data: { issue },
    });
  } catch (error) {
    console.error('Move issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Error moving issue',
    });
  }
};

// @desc    Get issue statistics
// @route   GET /api/issues/stats
// @access  Private
const getIssueStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all projects owned by user
    const projects = await prisma.project.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });

    const projectIds = projects.map(p => p.id);

    // Get all boards for user's projects
    const boards = await prisma.board.findMany({
      where: { projectId: { in: projectIds } },
      select: { id: true },
    });

    const boardIds = boards.map(b => b.id);

    // Get all columns for user's boards
    const columns = await prisma.column.findMany({
      where: { boardId: { in: boardIds } },
      select: { id: true },
    });

    const columnIds = columns.map(c => c.id);

    // Get issue statistics
    const [totalIssues, issuesByStatus, issuesByType, issuesByPriority] =
      await Promise.all([
        prisma.issue.count({
          where: { columnId: { in: columnIds } },
        }),
        prisma.issue.groupBy({
          by: ['status'],
          where: { columnId: { in: columnIds } },
          _count: { status: true },
        }),
        prisma.issue.groupBy({
          by: ['type'],
          where: { columnId: { in: columnIds } },
          _count: { type: true },
        }),
        prisma.issue.groupBy({
          by: ['priority'],
          where: { columnId: { in: columnIds } },
          _count: { priority: true },
        }),
      ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalIssues,
          issuesByStatus,
          issuesByType,
          issuesByPriority,
        },
      },
    });
  } catch (error) {
    console.error('Get issue stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting issue statistics',
    });
  }
};

module.exports = {
  getIssuesByColumn,
  getIssue,
  createIssue,
  updateIssue,
  deleteIssue,
  moveIssue,
  getIssueStats,
};
