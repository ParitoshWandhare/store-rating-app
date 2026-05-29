const { query } = require('../db');

const ALLOWED_SORT = ['name', 'email', 'address', 'avg_rating', 'created_at'];

// GET /api/stores  (admin + normal user)
const listStores = async (req, res, next) => {
  try {
    const {
      search = '',
      sortBy = 'name',
      sortDir = 'asc',
      page = 1,
      limit = 20,
    } = req.query;

    const col = ALLOWED_SORT.includes(sortBy) ? sortBy : 'name';
    const dir = sortDir === 'asc' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const conditions = ['1=1'];
    const params = [];
    let pi = 1;

    if (search) {
      conditions.push(`(s.name ILIKE $${pi} OR s.address ILIKE $${pi})`);
      params.push(`%${search}%`);
      pi++;
    }

    const where = conditions.join(' AND ');

    // Get user's own ratings if logged in as normal user
    const userId = req.user?.role === 'user' ? req.user.id : null;

    const countRes = await query(
      `SELECT COUNT(*) FROM stores s WHERE ${where}`,
      params
    );
    const total = parseInt(countRes.rows[0].count);

    const orderCol = col === 'avg_rating' ? 'avg_rating' : `s.${col}`;

    const dataRes = await query(
      `SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at,
              ROUND(AVG(r.score), 2) AS avg_rating,
              COUNT(r.id) AS rating_count
              ${userId ? `, ur.score AS user_rating` : ''}
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       ${userId ? `LEFT JOIN ratings ur ON ur.store_id = s.id AND ur.user_id = $${pi}` : ''}
       WHERE ${where}
       GROUP BY s.id ${userId ? ', ur.score' : ''}
       ORDER BY ${orderCol} ${dir} NULLS LAST
       LIMIT $${userId ? pi + 1 : pi} OFFSET $${userId ? pi + 2 : pi + 1}`,
      userId ? [...params, userId, limit, offset] : [...params, limit, offset]
    );

    res.json({
      stores: dataRes.rows,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/stores/:id
const getStore = async (req, res, next) => {
  try {
    const userId = req.user?.role === 'user' ? req.user.id : null;

    const result = await query(
      `SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at,
              ROUND(AVG(r.score), 2) AS avg_rating,
              COUNT(r.id) AS rating_count
              ${userId ? `, ur.score AS user_rating` : ''}
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       ${userId ? `LEFT JOIN ratings ur ON ur.store_id = s.id AND ur.user_id = $2` : ''}
       WHERE s.id = $1
       GROUP BY s.id ${userId ? ', ur.score' : ''}`,
      userId ? [req.params.id, userId] : [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Store not found.' });
    }

    res.json({ store: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// POST /api/stores  (admin only)
const createStore = async (req, res, next) => {
  try {
    const { name, email, address, owner_id } = req.body;

    // If owner_id provided, verify user exists and is owner role
    if (owner_id) {
      const ownerCheck = await query(
        "SELECT id FROM users WHERE id = $1 AND role = 'owner'",
        [owner_id]
      );
      if (!ownerCheck.rows.length) {
        return res.status(400).json({ error: 'owner_id must reference a user with role "owner".' });
      }
    }

    const result = await query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, address, owner_id, created_at`,
      [name, email, address || null, owner_id || null]
    );

    res.status(201).json({ store: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// GET /api/stores/owner/dashboard  (store owner only)
const getOwnerDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    const storeRes = await query(
      `SELECT s.id, s.name, s.email, s.address,
              ROUND(AVG(r.score), 2) AS avg_rating,
              COUNT(r.id) AS rating_count
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.owner_id = $1
       GROUP BY s.id`,
      [ownerId]
    );

    if (!storeRes.rows.length) {
      return res.status(404).json({ error: 'No store found for this owner.' });
    }

    const store = storeRes.rows[0];

    const ratingsRes = await query(
      `SELECT u.id, u.name, u.email, r.score, r.created_at, r.updated_at
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.store_id = $1
       ORDER BY r.updated_at DESC`,
      [store.id]
    );

    res.json({
      store,
      ratings: ratingsRes.rows,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { listStores, getStore, createStore, getOwnerDashboard };
