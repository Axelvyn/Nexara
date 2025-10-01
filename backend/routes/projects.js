const express = require('express');
const router = express.Router();

const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
} = require('../controllers/projectController');

const { setupDefaultBoard } = require('../controllers/utilityController');

const { protect } = require('../middleware/auth');
const { checkProjectAccess } = require('../middleware/rbac');
const {
  validateProject,
  validateProjectId,
  validatePagination,
  validateSearch,
} = require('../middleware/validation');

// All routes are protected
router.use(protect);

// Project routes
router.get('/', validatePagination, validateSearch, getProjects);
router.post('/', validateProject, createProject);
router.get('/:projectId', validateProjectId, getProject);
router.put(
  '/:projectId',
  validateProjectId,
  checkProjectAccess('PROJECT_UPDATE'),
  validateProject,
  updateProject
);
router.delete(
  '/:projectId',
  validateProjectId,
  checkProjectAccess('PROJECT_DELETE'),
  deleteProject
);
router.get('/:projectId/stats', validateProjectId, getProjectStats);
router.post(
  '/:projectId/setup-default-board',
  validateProjectId,
  checkProjectAccess('PROJECT_UPDATE'),
  setupDefaultBoard
);

module.exports = router;
