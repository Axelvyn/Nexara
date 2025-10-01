const prisma = require('../config/database');

// @desc    Create default board for project (utility function)
// @route   POST /api/projects/:projectId/setup-default-board
// @access  Private
const setupDefaultBoard = async (req, res) => {
  try {
    const { projectId } = req.params;
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

    // Check if project already has boards
    const existingBoards = await prisma.board.findMany({
      where: { projectId },
    });

    if (existingBoards.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Project already has boards',
      });
    }

    // Create default board and columns in a transaction
    const result = await prisma.$transaction(async prisma => {
      // Create default board
      const board = await prisma.board.create({
        data: {
          name: 'Main Board',
          description: 'Default board for project tasks',
          projectId: projectId,
        },
      });

      // Create default columns
      const defaultColumns = [
        { name: 'To Do', orderIndex: 0 },
        { name: 'In Progress', orderIndex: 1 },
        { name: 'Done', orderIndex: 2 },
      ];

      const columns = [];
      for (const column of defaultColumns) {
        const createdColumn = await prisma.column.create({
          data: {
            name: column.name,
            orderIndex: column.orderIndex,
            boardId: board.id,
          },
        });
        columns.push(createdColumn);
      }

      return { board, columns };
    });

    res.status(201).json({
      success: true,
      message: 'Default board and columns created successfully',
      data: result,
    });
  } catch (error) {
    console.error('Setup default board error:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting up default board',
    });
  }
};

module.exports = {
  setupDefaultBoard,
};
