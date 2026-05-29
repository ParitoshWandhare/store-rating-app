const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/authController');
const {
  nameValidator,
  emailValidator,
  passwordValidator,
  addressValidator,
} = require('../validators/shared');

// POST /api/auth/register
router.post(
  '/register',
  [nameValidator, emailValidator, passwordValidator, addressValidator],
  validate,
  ctrl.register
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Valid email required.').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  ctrl.login
);

// PATCH /api/auth/password  (authenticated)
router.patch(
  '/password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required.'),
    body('newPassword')
      .isLength({ min: 8, max: 16 }).withMessage('New password must be 8–16 characters.')
      .matches(/[A-Z]/).withMessage('Must contain at least one uppercase letter.')
      .matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/).withMessage('Must contain at least one special character.'),
  ],
  validate,
  ctrl.updatePassword
);

// GET /api/auth/me
router.get('/me', authenticate, ctrl.getMe);

module.exports = router;
