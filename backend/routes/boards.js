const express = require('express');
const router = express.Router();

const {
  getBoardsByProject,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  getBoardStats,
} = require('../controllers/boardController');

const { protect } = require('../middleware/auth');
const { checkBoardAccess } = require('../middleware/rbac');
const {
  validateBoard,
  validateBoardId,
  validateProjectId,
  validatePagination,
  validateSearch,
} = require('../middleware/validation');

// All routes are protected
router.use(protect);

// Board routes
router.get(
  '/project/:projectId',
  validateProjectId,
  validatePagination,
  validateSearch,
  getBoardsByProject
);
router.post('/', validateBoard, createBoard);
router.get('/:boardId', validateBoardId, getBoard);
router.put(
  '/:boardId',
  validateBoardId,
  checkBoardAccess('BOARD_UPDATE'),
  validateBoard,
  updateBoard
);
router.delete(
  '/:boardId',
  validateBoardId,
  checkBoardAccess('BOARD_DELETE'),
  deleteBoard
);
router.get('/:boardId/stats', validateBoardId, getBoardStats);

module.exports = router;
