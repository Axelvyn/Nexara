const express = require('express');
const router = express.Router();

const {
  getIssuesByColumn,
  getIssue,
  createIssue,
  updateIssue,
  deleteIssue,
  moveIssue,
  getIssueStats,
} = require('../controllers/issueController');

const { protect } = require('../middleware/auth');
const { checkIssueAccess } = require('../middleware/rbac');
const {
  validateIssue,
  validateIssueId,
  validatePagination,
  validateSearch,
} = require('../middleware/validation');

// All routes are protected
router.use(protect);

// Issue routes
router.get(
  '/column/:columnId',
  validatePagination,
  validateSearch,
  getIssuesByColumn
);
router.get('/stats', getIssueStats);
router.post('/', validateIssue, createIssue);
router.get('/:issueId', validateIssueId, getIssue);
router.put(
  '/:issueId',
  validateIssueId,
  checkIssueAccess('ISSUE_UPDATE'),
  validateIssue,
  updateIssue
);
router.delete(
  '/:issueId',
  validateIssueId,
  checkIssueAccess('ISSUE_DELETE'),
  deleteIssue
);
router.patch(
  '/:issueId/move',
  validateIssueId,
  checkIssueAccess('ISSUE_MOVE'),
  moveIssue
);

module.exports = router;
