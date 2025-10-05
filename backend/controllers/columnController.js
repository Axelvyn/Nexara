const prisma = require('../config/database');

// @desc    Get all columns for a board
// @route   GET /api/columns/board/:boardId
// @access  Private
const getColumnsByBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const userId = req.user.id;

    // Verify board ownership
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

    // Get columns with issue counts
    const columns = await prisma.column.findMany({
      where: { boardId },
      orderBy: { orderIndex: 'asc' },
      include: {
        _count: {
          select: {
            issues: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: { columns },
    });
  } catch (error) {
    console.error('Get columns by board error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting columns',
    });
  }
};

// @desc    Get single column
// @route   GET /api/columns/:columnId
// @access  Private
const getColumn = async (req, res) => {
  try {
    const { columnId } = req.params;
    const userId = req.user.id;

    const column = await prisma.column.findFirst({
      where: {
        id: columnId,
        board: {
          project: {
            ownerId: userId,
          },
        },
      },
      include: {
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
        _count: {
          select: {
            issues: true,
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

    res.json({
      success: true,
      data: { column },
    });
  } catch (error) {
    console.error('Get column error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting column',
    });
  }
};

// @desc    Create new column
// @route   POST /api/columns
// @access  Private
const createColumn = async (req, res) => {
  try {
    const { name, boardId, orderIndex } = req.body;
    const userId = req.user.id;

    // Verify board ownership
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

    // If no orderIndex provided, append to end
    let finalOrderIndex = orderIndex;
    if (finalOrderIndex === undefined) {
      const lastColumn = await prisma.column.findFirst({
        where: { boardId },
        orderBy: { orderIndex: 'desc' },
      });
      finalOrderIndex = lastColumn ? lastColumn.orderIndex + 1 : 0;
    }

    const column = await prisma.column.create({
      data: {
        name,
        boardId,
        orderIndex: finalOrderIndex,
      },
      include: {
        _count: {
          select: {
            issues: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Column created successfully',
      data: { column },
    });
  } catch (error) {
    console.error('Create column error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating column',
    });
  }
};

// @desc    Update column
// @route   PUT /api/columns/:columnId
// @access  Private
const updateColumn = async (req, res) => {
  try {
    const { columnId } = req.params;
    const { name, orderIndex } = req.body;
    const userId = req.user.id;

    // Check if column exists and user owns the board
    const existingColumn = await prisma.column.findFirst({
      where: {
        id: columnId,
        board: {
          project: {
            ownerId: userId,
          },
        },
      },
    });

    if (!existingColumn) {
      return res.status(404).json({
        success: false,
        message: 'Column not found',
      });
    }

    const column = await prisma.column.update({
      where: { id: columnId },
      data: {
        ...(name && { name }),
        ...(orderIndex !== undefined && { orderIndex }),
      },
      include: {
        _count: {
          select: {
            issues: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Column updated successfully',
      data: { column },
    });
  } catch (error) {
    console.error('Update column error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating column',
    });
  }
};

// @desc    Delete column
// @route   DELETE /api/columns/:columnId
// @access  Private
const deleteColumn = async (req, res) => {
  try {
    const { columnId } = req.params;
    const userId = req.user.id;

    // Check if column exists and user owns the board
    const existingColumn = await prisma.column.findFirst({
      where: {
        id: columnId,
        board: {
          project: {
            ownerId: userId,
          },
        },
      },
      include: {
        _count: {
          select: {
            issues: true,
          },
        },
      },
    });

    if (!existingColumn) {
      return res.status(404).json({
        success: false,
        message: 'Column not found',
      });
    }

    // Check if column has issues
    if (existingColumn._count.issues > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete column with existing issues',
      });
    }

    // Delete column
    await prisma.column.delete({
      where: { id: columnId },
    });

    res.json({
      success: true,
      message: 'Column deleted successfully',
    });
  } catch (error) {
    console.error('Delete column error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting column',
    });
  }
};

// @desc    Reorder columns
// @route   PATCH /api/columns/reorder
// @access  Private
const reorderColumns = async (req, res) => {
  try {
    const { boardId, columnIds } = req.body;
    const userId = req.user.id;

    // Verify board ownership
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

    // Update column order in transaction
    await prisma.$transaction(async tx => {
      for (let i = 0; i < columnIds.length; i++) {
        await tx.column.update({
          where: { id: columnIds[i] },
          data: { orderIndex: i },
        });
      }
    });

    // Return updated columns
    const columns = await prisma.column.findMany({
      where: { boardId },
      orderBy: { orderIndex: 'asc' },
      include: {
        _count: {
          select: {
            issues: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Columns reordered successfully',
      data: { columns },
    });
  } catch (error) {
    console.error('Reorder columns error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reordering columns',
    });
  }
};

module.exports = {
  getColumnsByBoard,
  getColumn,
  createColumn,
  updateColumn,
  deleteColumn,
  reorderColumns,
};
