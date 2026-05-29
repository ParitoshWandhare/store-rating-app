const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/userController');
const {
  nameValidator,
  emailValidator,
  passwordValidator,
  addressValidator,
} = require('../validators/shared');

// All routes require authentication + admin role
router.use(authenticate, authorize('admin'));

// GET /api/users/stats
router.get('/stats', ctrl.getDashboardStats);

// GET /api/users
router.get('/', ctrl.listUsers);

// GET /api/users/:id
router.get('/:id', ctrl.getUser);

// POST /api/users
router.post(
  '/',
  [
    nameValidator,
    emailValidator,
    passwordValidator,
    addressValidator,
    body('role')
      .isIn(['admin', 'user', 'owner'])
      .withMessage('Role must be admin, user, or owner.'),
  ],
  validate,
  ctrl.createUser
);

module.exports = router;
