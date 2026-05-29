const { body, query } = require('express-validator');

const nameValidator = body('name')
  .trim()
  .isLength({ min: 20, max: 60 })
  .withMessage('Name must be between 20 and 60 characters.');

const emailValidator = body('email')
  .trim()
  .isEmail()
  .withMessage('Must be a valid email address.')
  .normalizeEmail();

const passwordValidator = body('password')
  .isLength({ min: 8, max: 16 })
  .withMessage('Password must be 8–16 characters.')
  .matches(/[A-Z]/)
  .withMessage('Password must contain at least one uppercase letter.')
  .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
  .withMessage('Password must contain at least one special character.');

const addressValidator = body('address')
  .optional({ checkFalsy: true })
  .trim()
  .isLength({ max: 400 })
  .withMessage('Address must not exceed 400 characters.');

const paginationValidators = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1–100.').toInt(),
];

const sortValidator = (allowedFields) =>
  query('sortBy')
    .optional()
    .isIn(allowedFields)
    .withMessage(`sortBy must be one of: ${allowedFields.join(', ')}`);

module.exports = {
  nameValidator,
  emailValidator,
  passwordValidator,
  addressValidator,
  paginationValidators,
  sortValidator,
};
