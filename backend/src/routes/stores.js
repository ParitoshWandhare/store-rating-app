const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/storeController');
const { nameValidator, addressValidator } = require('../validators/shared');

// GET /api/stores/owner/dashboard  (owner only) — must be before /:id
router.get('/owner/dashboard', authenticate, authorize('owner'), ctrl.getOwnerDashboard);

// GET /api/stores  (admin + user)
router.get('/', authenticate, authorize('admin', 'user'), ctrl.listStores);

// GET /api/stores/:id  (admin + user)
router.get('/:id', authenticate, authorize('admin', 'user'), ctrl.getStore);

// POST /api/stores  (admin only)
router.post(
  '/',
  authenticate,
  authorize('admin'),
  [
    nameValidator,
    body('email').trim().isEmail().withMessage('Valid store email required.').normalizeEmail(),
    addressValidator,
    body('owner_id').optional({ checkFalsy: true }).isUUID().withMessage('owner_id must be a valid UUID.'),
  ],
  validate,
  ctrl.createStore
);

module.exports = router;
