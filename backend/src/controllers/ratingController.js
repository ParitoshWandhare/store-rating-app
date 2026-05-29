const { query } = require('../db');

// POST /api/ratings  (normal user)
const submitRating = async (req, res, next) => {
  try {
    const { store_id, score } = req.body;
    const user_id = req.user.id;

    const storeCheck = await query('SELECT id FROM stores WHERE id = $1', [store_id]);
    if (!storeCheck.rows.length) {
      return res.status(404).json({ error: 'Store not found.' });
    }

    const existing = await query(
      'SELECT id FROM ratings WHERE user_id = $1 AND store_id = $2',
      [user_id, store_id]
    );
    if (existing.rows.length) {
      return res.status(409).json({ error: 'You have already rated this store. Use PUT to update.' });
    }

    const result = await query(
      `INSERT INTO ratings (user_id, store_id, score)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, store_id, score, created_at`,
      [user_id, store_id, score]
    );

    res.status(201).json({ rating: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// PUT /api/ratings/:storeId  (normal user – update own rating)
const updateRating = async (req, res, next) => {
  try {
    const { score } = req.body;
    const user_id = req.user.id;
    const store_id = req.params.storeId;

    const result = await query(
      `UPDATE ratings SET score = $1
       WHERE user_id = $2 AND store_id = $3
       RETURNING id, user_id, store_id, score, updated_at`,
      [score, user_id, store_id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Rating not found. Submit a rating first.' });
    }

    res.json({ rating: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/ratings/:storeId  (normal user)
const deleteRating = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const store_id = req.params.storeId;

    const result = await query(
      'DELETE FROM ratings WHERE user_id = $1 AND store_id = $2 RETURNING id',
      [user_id, store_id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Rating not found.' });
    }

    res.json({ message: 'Rating removed.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { submitRating, updateRating, deleteRating };
