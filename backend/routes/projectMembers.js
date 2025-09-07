const express = require('express');
const router = express.Router();

const {
  getMembers,
  addMember,
  updateMemberRole,
  removeMember,
  leaveProject,
  transferOwnership,
} = require('../controllers/projectMemberController');

const { protect } = require('../middleware/auth');
const { checkProjectAccess } = require('../middleware/rbac');
const {
  validateProjectId,
  handleValidationErrors,
} = require('../middleware/validation');

// All routes are protected
router.use(protect);

// Member management routes
router.get('/:projectId/members', validateProjectId, getMembers);
router.post('/:projectId/members', validateProjectId, addMember);
router.put(
  '/:projectId/members/:memberId',
  validateProjectId,
  updateMemberRole
);
router.delete('/:projectId/members/:memberId', validateProjectId, removeMember);
router.delete('/:projectId/members/leave', validateProjectId, leaveProject);
router.put(
  '/:projectId/transfer-ownership',
  validateProjectId,
  transferOwnership
);

module.exports = router;
