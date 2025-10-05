const express = require('express');
const router = express.Router();

const {
  getColumnsByBoard,
  getColumn,
  createColumn,
  updateColumn,
  deleteColumn,
  reorderColumns,
} = require('../controllers/columnController');

const { protect } = require('../middleware/auth');
const {
  validateColumn,
  validateColumnId,
  validateBoardId,
  validateColumnReorder,
} = require('../middleware/validation');

// All routes are protected
router.use(protect);

// Column routes
router.get('/board/:boardId', validateBoardId, getColumnsByBoard);
router.post('/', validateColumn, createColumn);
router.get('/:columnId', validateColumnId, getColumn);
router.put('/:columnId', validateColumnId, validateColumn, updateColumn);
router.delete('/:columnId', validateColumnId, deleteColumn);
router.patch('/reorder', validateColumnReorder, reorderColumns);

module.exports = router;
