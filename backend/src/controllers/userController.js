const bcrypt = require('bcryptjs');
const { query } = require('../db');

const ALLOWED_SORT = ['name', 'email', 'address', 'role', 'created_at'];

// GET /api/users  (admin only)
const listUsers = async (req, res, next) => {
  try {
    const {
      search = '',
      role,
      sortBy = 'created_at',
      sortDir = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const col = ALLOWED_SORT.includes(sortBy) ? sortBy : 'created_at';
    const dir = sortDir === 'asc' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const conditions = ['1=1'];
    const params = [];
    let pi = 1;

    if (search) {
      conditions.push(
        `(u.name ILIKE $${pi} OR u.email ILIKE $${pi} OR u.address ILIKE $${pi})`
      );
      params.push(`%${search}%`);
      pi++;
    }
    if (role) {
      conditions.push(`u.role = $${pi}::user_role`);
      params.push(role);
      pi++;
    }

    const where = conditions.join(' AND ');

    const countRes = await query(
      `SELECT COUNT(*) FROM users u WHERE ${where}`,
      params
    );
    const total = parseInt(countRes.rows[0].count);

    const dataRes = await query(
      `SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
              ROUND(AVG(r.score), 2) AS store_rating
       FROM users u
       LEFT JOIN stores s ON s.owner_id = u.id
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE ${where}
       GROUP BY u.id
       ORDER BY u.${col} ${dir}
       LIMIT $${pi} OFFSET $${pi + 1}`,
      [...params, limit, offset]
    );

    res.json({
      users: dataRes.rows,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id  (admin only)
const getUser = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
              s.id AS store_id, s.name AS store_name,
              ROUND(AVG(r.score), 2) AS store_rating
       FROM users u
       LEFT JOIN stores s ON s.owner_id = u.id
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE u.id = $1
       GROUP BY u.id, s.id`,
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// POST /api/users  (admin only – create any role)
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, address, role } = req.body;

    const exists = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length) {
      return res.status(409).json({ error: 'Email is already registered.' });
    }

    const hash = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO users (name, email, password_hash, address, role)
       VALUES ($1, $2, $3, $4, $5::user_role)
       RETURNING id, name, email, address, role, created_at`,
      [name, email, hash, address || null, role || 'user']
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/stats  (admin dashboard)
const getDashboardStats = async (req, res, next) => {
  try {
    const [usersRes, storesRes, ratingsRes] = await Promise.all([
      query("SELECT COUNT(*) FROM users WHERE role != 'admin'"),
      query('SELECT COUNT(*) FROM stores'),
      query('SELECT COUNT(*) FROM ratings'),
    ]);

    res.json({
      totalUsers: parseInt(usersRes.rows[0].count),
      totalStores: parseInt(storesRes.rows[0].count),
      totalRatings: parseInt(ratingsRes.rows[0].count),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { listUsers, getUser, createUser, getDashboardStats };
