const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/ratingController');

const scoreValidator = body('score')
  .isInt({ min: 1, max: 5 })
  .withMessage('Score must be an integer between 1 and 5.')
  .toInt();

// POST /api/ratings
router.post(
  '/',
  authenticate,
  authorize('user'),
  [
    body('store_id').isUUID().withMessage('store_id must be a valid UUID.'),
    scoreValidator,
  ],
  validate,
  ctrl.submitRating
);

// PUT /api/ratings/:storeId
router.put(
  '/:storeId',
  authenticate,
  authorize('user'),
  [scoreValidator],
  validate,
  ctrl.updateRating
);

// DELETE /api/ratings/:storeId
router.delete('/:storeId', authenticate, authorize('user'), ctrl.deleteRating);

module.exports = router;
