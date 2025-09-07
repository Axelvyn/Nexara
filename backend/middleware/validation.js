const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(
      'Username can only contain letters, numbers, underscores, and hyphens'
    ),
  handleValidationErrors,
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const validateUserUpdate = [
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(
      'Username can only contain letters, numbers, underscores, and hyphens'
    ),
  handleValidationErrors,
];

// Project validation rules
const validateProject = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Project name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Project description must be less than 500 characters'),
  handleValidationErrors,
];

const validateProjectId = [
  param('projectId')
    .isString()
    .withMessage('Project ID must be a string')
    .notEmpty()
    .withMessage('Project ID is required'),
  handleValidationErrors,
];

// Board validation rules
const validateBoard = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Board name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Board description must be less than 500 characters'),
  handleValidationErrors,
];

const validateBoardId = [
  param('boardId')
    .isString()
    .withMessage('Board ID must be a string')
    .notEmpty()
    .withMessage('Board ID is required'),
  handleValidationErrors,
];

// Column validation rules
const validateColumn = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Column name must be between 1 and 50 characters'),
  body('orderIndex')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order index must be a non-negative integer'),
  handleValidationErrors,
];

const validateColumnId = [
  param('columnId')
    .isString()
    .withMessage('Column ID must be a string')
    .notEmpty()
    .withMessage('Column ID is required'),
  handleValidationErrors,
];

// Issue validation rules
const validateIssue = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Issue title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Issue description must be less than 2000 characters'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Priority must be one of: LOW, MEDIUM, HIGH, URGENT'),
  body('type')
    .optional()
    .isIn(['BUG', 'FEATURE', 'TASK', 'STORY', 'EPIC'])
    .withMessage('Type must be one of: BUG, FEATURE, TASK, STORY, EPIC'),
  handleValidationErrors,
];

const validateIssueId = [
  param('issueId')
    .isString()
    .withMessage('Issue ID must be a string')
    .notEmpty()
    .withMessage('Issue ID is required'),
  handleValidationErrors,
];

// Query validation rules
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors,
];

const validateSearch = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateProject,
  validateProjectId,
  validateBoard,
  validateBoardId,
  validateColumn,
  validateColumnId,
  validateIssue,
  validateIssueId,
  validatePagination,
  validateSearch,
};
